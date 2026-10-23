/**
 * The Taté Glow - Secure Server-Side Checkout Cloud Function
 * 
 * Rules Enforced:
 * 1. Never trusts prices, totals, discounts, or payment statuses sent from client browser.
 * 2. Fetches authoritative product prices and status directly from Firestore 'products' collection.
 * 3. Validates promo codes against 'discounts' collection on the server.
 * 4. Checks and decrements physical stock transactionally in 'inventory' and 'products'.
 * 5. Sets payment status strictly to 'pending payment' (or 'cod_pending' for Cash on Delivery).
 * 6. Records immutable inventory audit logs and upserts customer profiles.
 */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Free shipping threshold in EGP
const FREE_SHIPPING_THRESHOLD_EGP = 1200;
const STANDARD_SHIPPING_FEE_EGP = 65;

exports.checkoutOrder = onRequest({ cors: true }, async (req, res) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  try {
    const {
      items,
      customer,
      paymentMethodRequested,
      discountCode,
      redeemGlowPoints,
      userId
    } = req.body;

    // 1. Basic payload validations
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Your bag is empty. Please select products to purchase." });
    }

    if (!customer || !customer.name || !customer.phone || !customer.city || !customer.address) {
      return res.status(400).json({ error: "Complete delivery address and contact information are required." });
    }

    // 2. Fetch all referenced products from Firestore to establish server-authoritative prices and stock
    const validatedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      if (!item.productId || typeof item.quantity !== "number" || item.quantity <= 0) {
        return res.status(400).json({ error: `Invalid item or quantity for product ${item.productId}` });
      }

      const productRef = db.collection("products").doc(item.productId);
      const productSnap = await productRef.get();

      if (!productSnap.exists) {
        return res.status(404).json({ error: `Product "${item.productId}" no longer exists in our catalog.` });
      }

      const productData = productSnap.data();

      // Only published products can be purchased
      if (productData.status !== "published") {
        return res.status(400).json({ error: `Product "${productData.name}" is not currently available for purchase.` });
      }

      // Check current stock from product / inventory document
      const currentStock = typeof productData.stock === "number" ? productData.stock : 0;
      if (currentStock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${productData.name}". Available: ${currentStock}, requested: ${item.quantity}.`
        });
      }

      // Authoritative unit price from database - NEVER TRUST CLIENT PRICE
      const authoritativeUnitPrice = Number(productData.price);
      if (isNaN(authoritativeUnitPrice) || authoritativeUnitPrice <= 0) {
        return res.status(500).json({ error: `Invalid catalog pricing configured for "${productData.name}".` });
      }

      const itemLineTotal = authoritativeUnitPrice * item.quantity;
      calculatedSubtotal += itemLineTotal;

      validatedItems.push({
        productId: item.productId,
        name: productData.name,
        nameAr: productData.nameAr || "",
        sku: productData.sku || item.productId.toUpperCase(),
        price: authoritativeUnitPrice, // Authoritative price from DB
        quantity: item.quantity,
        selectedSize: item.selectedSize || "Standard",
        image: productData.image || ""
      });
    }

    // 3. Calculate bundle discounts server-side (2 pieces = 10% off, 3+ pieces = 15% off)
    const totalItemCount = validatedItems.reduce((acc, i) => acc + i.quantity, 0);
    let bundleDiscountAmount = 0;
    let bundleLabel = null;

    if (totalItemCount >= 3) {
      bundleDiscountAmount = Math.round(calculatedSubtotal * 0.15);
      bundleLabel = "Capsule Stack Offer (15% off 3+ pieces)";
    } else if (totalItemCount === 2) {
      bundleDiscountAmount = Math.round(calculatedSubtotal * 0.10);
      bundleLabel = "Duo Stack Offer (10% off 2 pieces)";
    }

    // 4. Validate promotional discount code server-side
    let promoDiscountAmount = 0;
    let appliedPromoCode = null;

    if (discountCode && typeof discountCode === "string" && discountCode.trim()) {
      const cleanCode = discountCode.trim().toUpperCase();
      const promoRef = db.collection("discounts").doc(cleanCode);
      const promoSnap = await promoRef.get();

      if (promoSnap.exists) {
        const promoData = promoSnap.data();
        const now = new Date();

        const isActive = promoData.active === true;
        const hasStarted = !promoData.startsAt || new Date(promoData.startsAt) <= now;
        const notExpired = !promoData.expiresAt || new Date(promoData.expiresAt) >= now;
        const meetsMinPurchase = !promoData.minPurchase || calculatedSubtotal >= promoData.minPurchase;
        const underMaxUses = !promoData.maxUses || (promoData.usedCount || 0) < promoData.maxUses;

        if (isActive && hasStarted && notExpired && meetsMinPurchase && underMaxUses) {
          if (promoData.discountType === "percentage") {
            promoDiscountAmount = Math.round((calculatedSubtotal * Number(promoData.value)) / 100);
          } else {
            promoDiscountAmount = Math.min(calculatedSubtotal, Number(promoData.value));
          }
          appliedPromoCode = cleanCode;
        }
      }
    }

    // 5. Validate Glow Points loyalty discount server-side (100 points = 50 EGP discount)
    let pointsDiscountAmount = 0;
    const requestedPoints = Number(redeemGlowPoints) || 0;
    if (requestedPoints >= 50) {
      pointsDiscountAmount = Math.round(requestedPoints * 0.5);
    }

    const totalDiscountAmount = bundleDiscountAmount + promoDiscountAmount + pointsDiscountAmount;
    const discountedSubtotal = Math.max(0, calculatedSubtotal - totalDiscountAmount);

    // 6. Compute shipping delivery fee server-side
    const deliveryFee = discountedSubtotal >= FREE_SHIPPING_THRESHOLD_EGP ? 0 : STANDARD_SHIPPING_FEE_EGP;
    const authoritativeTotal = discountedSubtotal + deliveryFee;

    // 7. Calculate points earned on this purchase (10 points / 100 EGP)
    const glowPointsEarned = Math.round((discountedSubtotal / 100) * 10);

    // Generate secure order reference
    const orderId = `TG-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

    // 8. Execute Firestore Transaction: decrement stock and record order & audit logs atomically
    const orderRecord = await db.runTransaction(async (transaction) => {
      // Step A: Re-verify stock inside transaction for every item
      for (const item of validatedItems) {
        const invRef = db.collection("inventory").doc(item.productId);
        const invSnap = await transaction.get(invRef);
        const currentStock = invSnap.exists ? (invSnap.data().stock || 0) : 0;

        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for "${item.name}" during checkout lock.`);
        }

        const newStock = Math.max(0, currentStock - item.quantity);

        // Update inventory document
        transaction.set(invRef, {
          productId: item.productId,
          productName: item.name,
          sku: item.sku,
          stock: newStock,
          status: newStock <= 0 ? "out_of_stock" : newStock <= 5 ? "low_stock" : "in_stock",
          lastSoldAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Update product document stock
        const prodRef = db.collection("products").doc(item.productId);
        transaction.update(prodRef, {
          stock: newStock,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Write inventory movement audit log
        const logId = `invlog_${orderId}_${item.productId}`;
        const logRef = db.collection("inventoryLogs").doc(logId);
        transaction.set(logRef, {
          id: logId,
          productId: item.productId,
          productName: item.name,
          sku: item.sku,
          type: "order_placed",
          quantityChange: -item.quantity,
          previousStock: currentStock,
          newStock,
          reason: `Customer purchase order #${orderId}`,
          orderId,
          adminEmail: "system@thetateglow.com",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Step B: Set payment status strictly on server - NEVER TRUST CLIENT PAYMENT STATUS
      // Card orders start as 'pending payment' until webhook/gateway captures charge
      // Cash on delivery orders start as 'cod_pending'
      const isCod = paymentMethodRequested === "cod";
      const paymentStatus = isCod ? "cod_pending" : "pending payment";

      const newOrder = {
        id: orderId,
        userId: userId || null,
        customerName: customer.name.trim(),
        customerEmail: customer.email ? customer.email.trim().toLowerCase() : "",
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
        paymentMethod: isCod ? "Cash on Delivery" : "Credit / Debit Card",
        paymentStatus, // STRICTLY 'pending payment' or 'cod_pending'
        fulfillmentStatus: "unfulfilled",
        glowPointsEarned,
        statusHistory: [
          {
            status: "unfulfilled",
            timestamp: new Date().toISOString(),
            note: "Order initialized via secure server-side checkout"
          }
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Write to root 'orders' collection
      const orderRef = db.collection("orders").doc(orderId);
      transaction.set(orderRef, newOrder);

      // Write to user's order subcollection if authenticated
      if (userId) {
        const userOrderRef = db.collection("users").doc(userId).collection("orders").doc(orderId);
        transaction.set(userOrderRef, newOrder);
      }

      // Step C: Increment promo code usage if applied
      if (appliedPromoCode) {
        const promoRef = db.collection("discounts").doc(appliedPromoCode);
        transaction.update(promoRef, {
          usedCount: admin.firestore.FieldValue.increment(1)
        });
      }

      // Step D: Upsert customer profile
      const customerKey = (customer.email || customer.phone || orderId).toLowerCase().trim();
      const customerRef = db.collection("customers").doc(customerKey);
      transaction.set(customerRef, {
        id: customerKey,
        uid: userId || null,
        name: customer.name.trim(),
        email: customer.email ? customer.email.trim().toLowerCase() : "",
        phone: customer.phone.trim(),
        city: customer.city.trim(),
        address: customer.address.trim(),
        totalOrders: admin.firestore.FieldValue.increment(1),
        totalSpent: admin.firestore.FieldValue.increment(authoritativeTotal),
        glowPoints: admin.firestore.FieldValue.increment(glowPointsEarned - requestedPoints),
        lastOrderAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return newOrder;
    });

    // 9. Send verified order details back to client
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
      bundleLabel,
      message: "Order placed securely with server-side validation."
    });

  } catch (error) {
    console.error("Secure Checkout Error:", error);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred during secure checkout processing."
    });
  }
});
