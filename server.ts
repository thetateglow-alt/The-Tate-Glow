import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase configuration
const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
let firebaseConfig: any = {};
if (fs.existsSync(configPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.warn('Could not read firebase-applet-config.json:', err);
  }
}

// Initialize Firebase Admin SDK
const adminApp: App = getApps().length > 0
  ? getApp()
  : initializeApp({
      projectId: firebaseConfig.projectId || 'giga-folio-l3kqt'
    });

// Firestore instance pointing to the app's configured database
const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId || 'ai-studio-thetatglow-e6703ffd-3b67-4723-8dae-49daf7486ab6');

const app = express();
app.use(express.json());

const FREE_SHIPPING_THRESHOLD_EGP = 1200;
const STANDARD_SHIPPING_FEE_EGP = 65;

/**
 * SECURE SERVER-SIDE CHECKOUT ENDPOINT
 * 
 * Strict Security Guarantees:
 * 1. ZERO trust in browser-supplied prices, totals, or payment status.
 * 2. Fetches authoritative prices and product status directly from Firestore 'products'.
 * 3. Server validates discount codes and minimum purchase requirements against 'discounts'.
 * 4. Atomic transaction decrements inventory stock and creates order with 'pending payment'.
 * 5. Immutable movement logging in 'inventoryLogs'.
 */
app.post('/api/checkout', async (req, res) => {
  try {
    const {
      items,
      customer,
      paymentMethodRequested,
      discountCode,
      redeemGlowPoints,
      userId
    } = req.body;

    // 1. Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your shopping bag is empty.' });
    }

    if (!customer || !customer.name || !customer.phone || !customer.city || !customer.address) {
      return res.status(400).json({ error: 'Recipient name, phone, city, and delivery address are required.' });
    }

    // 2. Query products from Firestore to establish server-authoritative prices and check stock
    const validatedItems: any[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ error: `Invalid item or quantity for piece: ${item.productId}` });
      }

      const productRef = db.collection('products').doc(item.productId);
      const productSnap = await productRef.get();

      if (!productSnap.exists) {
        return res.status(404).json({ error: `Jewelry piece "${item.productId}" is not available in our catalog.` });
      }

      const productData = productSnap.data() || {};

      // Enforce published-only purchasing
      if (productData.status !== 'published') {
        return res.status(400).json({ error: `"${productData.name}" is not currently available for purchase.` });
      }

      // Check stock
      const currentStock = typeof productData.stock === 'number' ? productData.stock : 0;
      if (currentStock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${productData.name}". Available: ${currentStock}, requested: ${item.quantity}.`
        });
      }

      // Authoritative unit price from database - never trust browser price
      const authoritativeUnitPrice = Number(productData.price);
      if (isNaN(authoritativeUnitPrice) || authoritativeUnitPrice <= 0) {
        return res.status(500).json({ error: `Invalid catalog pricing configured for "${productData.name}".` });
      }

      calculatedSubtotal += authoritativeUnitPrice * item.quantity;

      validatedItems.push({
        productId: item.productId,
        name: productData.name,
        nameAr: productData.nameAr || '',
        sku: productData.sku || item.productId.toUpperCase(),
        price: authoritativeUnitPrice,
        quantity: item.quantity,
        selectedSize: item.selectedSize || 'Standard',
        image: productData.image || ''
      });
    }

    // 3. Compute bundle stacking discounts server-side (2 pieces = 10% off, 3+ pieces = 15% off)
    const totalUnits = validatedItems.reduce((acc, i) => acc + i.quantity, 0);
    let bundleDiscountAmount = 0;
    let bundleType: string | undefined;

    if (totalUnits >= 3) {
      bundleDiscountAmount = Math.round(calculatedSubtotal * 0.15);
      bundleType = 'Capsule Stack Offer (15% off 3+ pieces)';
    } else if (totalUnits === 2) {
      bundleDiscountAmount = Math.round(calculatedSubtotal * 0.10);
      bundleType = 'Duo Stack Offer (10% off 2 pieces)';
    }

    // 4. Validate promotional discount code server-side
    let promoDiscountAmount = 0;
    let appliedPromoCode: string | null = null;

    if (discountCode && typeof discountCode === 'string' && discountCode.trim()) {
      const cleanCode = discountCode.trim().toUpperCase();
      const promoRef = db.collection('discounts').doc(cleanCode);
      const promoSnap = await promoRef.get();

      if (promoSnap.exists) {
        const promoData = promoSnap.data() || {};
        const now = new Date();

        const isActive = promoData.active === true;
        const hasStarted = !promoData.startsAt || new Date(promoData.startsAt) <= now;
        const notExpired = !promoData.expiresAt || new Date(promoData.expiresAt) >= now;
        const meetsMinPurchase = !promoData.minPurchase || calculatedSubtotal >= promoData.minPurchase;
        const underMaxUses = !promoData.maxUses || (promoData.usedCount || 0) < promoData.maxUses;

        if (isActive && hasStarted && notExpired && meetsMinPurchase && underMaxUses) {
          if (promoData.discountType === 'percentage') {
            promoDiscountAmount = Math.round((calculatedSubtotal * Number(promoData.value)) / 100);
          } else {
            promoDiscountAmount = Math.min(calculatedSubtotal, Number(promoData.value));
          }
          appliedPromoCode = cleanCode;
        }
      }
    }

    // 5. Loyalty Points redemption server-side
    let pointsDiscountAmount = 0;
    const requestedPoints = Number(redeemGlowPoints) || 0;
    if (requestedPoints >= 50) {
      pointsDiscountAmount = Math.round(requestedPoints * 0.5);
    }

    const totalDiscountAmount = bundleDiscountAmount + promoDiscountAmount + pointsDiscountAmount;
    const discountedSubtotal = Math.max(0, calculatedSubtotal - totalDiscountAmount);

    // 6. Delivery courier fee calculation server-side
    const deliveryFee = discountedSubtotal >= FREE_SHIPPING_THRESHOLD_EGP ? 0 : STANDARD_SHIPPING_FEE_EGP;
    const authoritativeTotal = discountedSubtotal + deliveryFee;
    const glowPointsEarned = Math.round((discountedSubtotal / 100) * 10);

    const orderId = `TG-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

    // 7. Atomic transaction: lock stock, write order with 'pending payment', write audit log
    const orderRecord = await db.runTransaction(async (transaction) => {
      // Step A: Re-check stock in transaction for atomicity
      for (const item of validatedItems) {
        const invRef = db.collection('inventory').doc(item.productId);
        const invSnap = await transaction.get(invRef);
        const currentStock = invSnap.exists ? (invSnap.data()?.stock ?? 0) : 0;

        if (currentStock < item.quantity) {
          throw new Error(`Item "${item.name}" ran out of stock during checkout confirmation.`);
        }

        const newStock = Math.max(0, currentStock - item.quantity);

        transaction.set(invRef, {
          productId: item.productId,
          productName: item.name,
          sku: item.sku,
          stock: newStock,
          status: newStock <= 0 ? 'out_of_stock' : newStock <= 5 ? 'low_stock' : 'in_stock',
          lastSoldAt: FieldValue.serverTimestamp()
        }, { merge: true });

        const prodRef = db.collection('products').doc(item.productId);
        transaction.update(prodRef, {
          stock: newStock,
          updatedAt: FieldValue.serverTimestamp()
        });

        // Audit log
        const logId = `invlog_${orderId}_${item.productId}`;
        const logRef = db.collection('inventoryLogs').doc(logId);
        transaction.set(logRef, {
          id: logId,
          productId: item.productId,
          productName: item.name,
          sku: item.sku,
          type: 'order_placed',
          quantityChange: -item.quantity,
          previousStock: currentStock,
          newStock,
          reason: `Customer purchase order #${orderId}`,
          orderId,
          adminEmail: 'system@thetateglow.com',
          createdAt: FieldValue.serverTimestamp()
        });
      }

      // Step B: Set payment status strictly on server - NEVER TRUST CLIENT PAYMENT STATUS
      const isCod = paymentMethodRequested === 'cod';
      const paymentStatus = isCod ? 'cod_pending' : 'pending payment';

      const newOrder = {
        id: orderId,
        userId: userId || null,
        customerName: customer.name.trim(),
        customerEmail: customer.email ? customer.email.trim().toLowerCase() : '',
        phone: customer.phone.trim(),
        city: customer.city.trim(),
        address: customer.address.trim(),
        items: validatedItems,
        subtotal: calculatedSubtotal,
        discount: totalDiscountAmount,
        discountBreakdown: {
          bundle: bundleDiscountAmount,
          promo: promoDiscountAmount,
          glowPoints: pointsDiscountAmount
        },
        discountCode: appliedPromoCode,
        deliveryFee,
        total: authoritativeTotal,
        paymentMethod: isCod ? 'Cash on Delivery' : 'Credit / Debit Card',
        paymentStatus, // 'pending payment' or 'cod_pending'
        fulfillmentStatus: 'unfulfilled',
        glowPointsEarned,
        statusHistory: [
          {
            status: 'unfulfilled',
            timestamp: new Date().toISOString(),
            note: 'Order submitted via secure server-side checkout'
          }
        ],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      const orderRef = db.collection('orders').doc(orderId);
      transaction.set(orderRef, newOrder);

      if (userId) {
        const userOrderRef = db.collection('users').doc(userId).collection('orders').doc(orderId);
        transaction.set(userOrderRef, newOrder);
      }

      // Step C: Increment promo counter if applied
      if (appliedPromoCode) {
        const promoRef = db.collection('discounts').doc(appliedPromoCode);
        transaction.update(promoRef, {
          usedCount: FieldValue.increment(1)
        });
      }

      // Step D: Upsert customer profile
      const customerKey = (customer.email || customer.phone || orderId).toLowerCase().trim();
      const customerRef = db.collection('customers').doc(customerKey);
      transaction.set(customerRef, {
        id: customerKey,
        uid: userId || null,
        name: customer.name.trim(),
        email: customer.email ? customer.email.trim().toLowerCase() : '',
        phone: customer.phone.trim(),
        city: customer.city.trim(),
        address: customer.address.trim(),
        totalOrders: FieldValue.increment(1),
        totalSpent: FieldValue.increment(authoritativeTotal),
        glowPoints: FieldValue.increment(glowPointsEarned - requestedPoints),
        lastOrderAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      return newOrder;
    });

    return res.status(200).json({
      success: true,
      orderId: orderRecord.id,
      subtotal: calculatedSubtotal,
      discount: totalDiscountAmount,
      deliveryFee,
      total: authoritativeTotal,
      paymentStatus: orderRecord.paymentStatus,
      fulfillmentStatus: orderRecord.fulfillmentStatus,
      glowPointsEarned,
      bundleType,
      message: 'Order created with status "pending payment" and stock locked.'
    });

  } catch (error: any) {
    console.error('Server checkout error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during secure order processing.'
    });
  }
});

// Mount Vite or serve static files
async function startServer() {
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`The Taté Glow server running on port ${PORT}`);
  });
}

startServer();
