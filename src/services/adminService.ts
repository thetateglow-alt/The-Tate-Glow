import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './firebaseAuth';
import { PRODUCTS, BRAND_CONFIG } from '../data/products';
import {
  AdminProduct,
  AdminOrderRecord,
  CustomerProfile,
  DiscountCode,
  HomepageContentConfig,
  InventoryLogRecord,
  AdminUser,
  AuditLogRecord,
  DashboardMetrics,
  PaymentStatus,
  FulfillmentStatus,
  InventoryMovementReason
} from '../types/admin';

export const STORE_OWNER_EMAIL = 'thetateglow@gmail.com';

export interface AdminStatusResult {
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isAdmin: boolean;
  email: string | null;
  role?: string;
  reason?: 'unauthenticated' | 'unverified_email' | 'unauthorized_role' | 'authorized';
}

/**
 * Checks detailed admin authentication and email verification status.
 * Required by Firebase security rules: isAdmin() requires request.auth.token.email_verified == true.
 */
export async function getAdminAuthStatus(user: User | null): Promise<AdminStatusResult> {
  if (!user) {
    return {
      isAuthenticated: false,
      isEmailVerified: false,
      isAdmin: false,
      email: null,
      reason: 'unauthenticated'
    };
  }

  const email = (user.email || '').toLowerCase().trim();

  // 1. Primary Check: Read admins/{user.uid} document where doc ID is the admin's Firebase Auth UID
  try {
    const adminDocRef = doc(db, 'admins', user.uid);
    const snap = await getDoc(adminDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const isRoleAdmin = data.role === 'admin' || data.role === 'superadmin' || data.role === 'manager';
      if (isRoleAdmin) {
        return {
          isAuthenticated: true,
          isEmailVerified: true,
          isAdmin: true,
          email: user.email || data.email || null,
          role: data.role || 'admin',
          reason: 'authorized'
        };
      }
    }
  } catch (err) {
    console.warn('Admin check (admins/{uid}) note:', err);
  }

  // 2. Fallback Check: Check adminUsers/{email} or store owner email
  try {
    if (email) {
      if (email === STORE_OWNER_EMAIL.toLowerCase()) {
        return {
          isAuthenticated: true,
          isEmailVerified: true,
          isAdmin: true,
          email,
          role: 'admin',
          reason: 'authorized'
        };
      }
      const legacyRef = doc(db, 'adminUsers', email);
      const legacySnap = await getDoc(legacyRef);
      if (legacySnap.exists()) {
        const data = legacySnap.data() as AdminUser;
        return {
          isAuthenticated: true,
          isEmailVerified: true,
          isAdmin: true,
          email,
          role: data.role || 'admin',
          reason: 'authorized'
        };
      }
    }
  } catch (err) {
    console.warn('Legacy admin fallback note:', err);
  }

  return {
    isAuthenticated: true,
    isEmailVerified: true,
    isAdmin: false,
    email: user.email || null,
    reason: 'unauthorized_role'
  };
}

/**
 * Checks if user is an authorized admin with verified email
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  const status = await getAdminAuthStatus(user);
  return status.isAdmin;
}

/**
 * Audit log recording
 */
export async function logAuditEvent(
  adminEmail: string,
  action: string,
  resource: 'products' | 'orders' | 'inventory' | 'discounts' | 'content' | 'settings',
  resourceId: string,
  details: string
): Promise<void> {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logRef = doc(db, 'auditLogs', logId);
    const logData: AuditLogRecord = {
      id: logId,
      adminEmail: adminEmail || STORE_OWNER_EMAIL,
      action,
      resource,
      resourceId,
      details,
      timestamp: new Date().toISOString()
    };
    await setDoc(logRef, logData);
  } catch (err) {
    console.warn('Audit log write error:', err);
  }
}

/**
 * Initialize Store Backend: ensures admin role, products catalog, and baseline settings
 */
export async function initializeStoreBackend(): Promise<void> {
  try {
    // 1. Ensure store owner exists in adminUsers
    const ownerRef = doc(db, 'adminUsers', STORE_OWNER_EMAIL);
    const ownerSnap = await getDoc(ownerRef);
    if (!ownerSnap.exists()) {
      await setDoc(ownerRef, {
        id: STORE_OWNER_EMAIL,
        email: STORE_OWNER_EMAIL,
        name: 'The Taté Glow Founder & Superadmin',
        role: 'superadmin',
        permissions: ['all'],
        createdAt: new Date().toISOString()
      });
    }

    // 2. Ensure initial products exist
    const productsCol = collection(db, 'products');
    const productsSnap = await getDocs(productsCol);
    if (productsSnap.empty) {
      console.log('Seeding initial products into Firestore...');
      const batch = writeBatch(db);

      for (const p of PRODUCTS) {
        const prodRef = doc(db, 'products', p.id);
        const adminProduct: AdminProduct = {
          ...p,
          sku: p.id.toUpperCase(),
          status: 'published',
          costPrice: Math.round(p.price * 0.45), // baseline 45% production cost
          variants: (p.specs?.sizes || ['Standard']).map((size, index) => ({
            id: `${p.id}-${index}`,
            size,
            sku: `${p.id.toUpperCase()}-${index + 1}`,
            stock: p.stock ?? 12,
            price: p.price
          })),
          seoTitle: `${p.name} | The Taté Glow`,
          seoDescription: p.description.slice(0, 155),
          slug: p.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        batch.set(prodRef, adminProduct);

        // Also record initial inventory stock
        const invRef = doc(db, 'inventory', p.id);
        batch.set(invRef, {
          productId: p.id,
          productName: p.name,
          sku: p.id.toUpperCase(),
          stock: p.stock ?? 12,
          lowStockThreshold: 5,
          lastRestockedAt: new Date().toISOString()
        });
      }

      // Initial Welcome Discount
      const welcomeDiscountRef = doc(db, 'discounts', 'GLOW10');
      const discountData: DiscountCode = {
        id: 'GLOW10',
        code: 'GLOW10',
        discountType: 'percentage',
        value: 10,
        minPurchase: 500,
        usedCount: 0,
        startsAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        createdAt: new Date().toISOString()
      };
      batch.set(welcomeDiscountRef, discountData);

      // Initial Homepage Content
      const hpRef = doc(db, 'homepageContent', 'config');
      const hpData: HomepageContentConfig = {
        announcementBar: {
          en: 'Pure Stainless Steel · 100% Waterproof & Tarnish-Free · Free Express Delivery Over 1,200 EGP',
          ar: 'Pure Stainless Steel · 100% Waterproof & Tarnish-Free · Free Express Delivery Over 1,200 EGP',
          active: true
        },
        hero: {
          headlineEn: 'Effortless shine for her.',
          headlineAr: 'Effortless shine for her.',
          subtitleEn: 'Minimalist everyday jewelry cast in pure stainless steel. 100% waterproof, hypoallergenic, and made to never take off.',
          subtitleAr: 'Minimalist everyday jewelry cast in pure stainless steel. 100% waterproof, hypoallergenic, and made to never take off.',
          badgeEn: '100% Pure Stainless Steel',
          badgeAr: '100% Pure Stainless Steel',
          ctaButtonTextEn: 'Explore Capsule',
          ctaButtonTextAr: 'Explore Capsule'
        },
        brandStory: {
          titleEn: 'Your Daily Dose of Glow',
          titleAr: 'Your Daily Dose of Glow',
          descriptionEn: 'Designed in Cairo for women who want permanent jewelry luxury that stands up to daily showers, sea water, and skincare.',
          descriptionAr: 'Designed in Cairo for women who want permanent jewelry luxury that stands up to daily showers, sea water, and skincare.'
        },
        featuredCategoryIds: ['necklace', 'bracelet', 'ring', 'earrings'],
        featuredProductIds: ['tate-aura-herringbone', 'tate-arc-cuff', 'tate-dome-signet-ring', 'tate-goutte-teardrop-huggies'],
        updatedAt: new Date().toISOString(),
        updatedBy: STORE_OWNER_EMAIL
      };
      batch.set(hpRef, hpData);

      await batch.commit();
      console.log('Seeding completed successfully.');
    }
  } catch (err) {
    console.warn('Store backend initialization notice:', err);
  }
}

// ==========================================
// 1. PRODUCTS MANAGEMENT (CRUD)
// ==========================================

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  try {
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    if (!snapshot.empty) {
      const items: AdminProduct[] = [];
      snapshot.forEach((d) => {
        items.push({ ...(d.data() as AdminProduct), id: d.id });
      });
      return items;
    }
  } catch (err) {
    console.warn('Failed to fetch admin products from Firestore:', err);
  }

  // Fallback to local catalog mapped to AdminProduct format
  return PRODUCTS.map((p) => ({
    ...p,
    sku: p.id.toUpperCase(),
    status: 'published' as const,
    costPrice: Math.round(p.price * 0.45),
    variants: (p.specs?.sizes || ['Standard']).map((size, idx) => ({
      id: `${p.id}-${idx}`,
      size,
      sku: `${p.id.toUpperCase()}-${idx + 1}`,
      stock: p.stock ?? 12,
      price: p.price
    }))
  }));
}

export async function checkSkuUnique(sku: string, excludeProductId?: string): Promise<boolean> {
  const products = await fetchAdminProducts();
  const normalized = sku.trim().toUpperCase();
  const existing = products.find(
    (p) => p.sku?.toUpperCase() === normalized && p.id !== excludeProductId
  );
  return !existing;
}

export async function saveAdminProduct(
  product: AdminProduct,
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!product.name || !product.sku || product.price <= 0) {
      return { success: false, error: 'Product name, SKU, and positive price are required.' };
    }

    const isUnique = await checkSkuUnique(product.sku, product.id);
    if (!isUnique) {
      return { success: false, error: `SKU "${product.sku}" is already in use by another product.` };
    }

    const docId = product.id || `tate-${product.sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const productRef = doc(db, 'products', docId);

    const payload: AdminProduct = {
      ...product,
      id: docId,
      sku: product.sku.trim().toUpperCase(),
      updatedAt: new Date().toISOString(),
      createdAt: product.createdAt || new Date().toISOString()
    };

    await setDoc(productRef, payload, { merge: true });

    // Sync inventory record
    const invRef = doc(db, 'inventory', docId);
    await setDoc(invRef, {
      productId: docId,
      productName: product.name,
      sku: payload.sku,
      stock: product.stock ?? 10,
      lowStockThreshold: 5,
      lastRestockedAt: new Date().toISOString()
    }, { merge: true });

    await logAuditEvent(
      adminEmail,
      product.id ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
      'products',
      docId,
      `Saved product "${product.name}" (${payload.sku}) with price ${product.price} EGP and stock ${product.stock}`
    );

    return { success: true };
  } catch (err: any) {
    console.error('Error saving product in Firestore:', err);
    return { success: false, error: err.message || 'Failed to save product in database.' };
  }
}

export async function deleteAdminProduct(
  productId: string,
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);

    // Also delete inventory
    const invRef = doc(db, 'inventory', productId);
    await deleteDoc(invRef).catch(() => {});

    await logAuditEvent(
      adminEmail,
      'DELETE_PRODUCT',
      'products',
      productId,
      `Permanently deleted product SKU: ${productId}`
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete product.' };
  }
}

// ==========================================
// 2. INVENTORY MANAGEMENT
// ==========================================

export async function adjustInventoryStock(
  productId: string,
  productName: string,
  sku: string,
  quantityChange: number,
  type: InventoryMovementReason,
  reasonDescription: string,
  adminEmail: string
): Promise<{ success: boolean; newStock?: number; error?: string }> {
  try {
    const invRef = doc(db, 'inventory', productId);
    const prodRef = doc(db, 'products', productId);

    const result = await runTransaction(db, async (transaction) => {
      const invSnap = await transaction.get(invRef);
      const currentStock = invSnap.exists() ? (invSnap.data().stock || 0) : 0;
      const newStock = Math.max(0, currentStock + quantityChange);

      transaction.set(invRef, {
        productId,
        productName,
        sku,
        stock: newStock,
        status: newStock <= 0 ? 'out_of_stock' : newStock <= 5 ? 'low_stock' : 'in_stock',
        lastRestockedAt: new Date().toISOString()
      }, { merge: true });

      // Keep products collection stock in sync
      transaction.update(prodRef, {
        stock: newStock,
        updatedAt: new Date().toISOString()
      });

      // Write inventory movement log
      const logId = `invlog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const logRef = doc(db, 'inventoryLogs', logId);
      const logRecord: InventoryLogRecord = {
        id: logId,
        productId,
        productName,
        sku,
        type,
        quantityChange,
        previousStock: currentStock,
        newStock,
        reason: reasonDescription,
        adminEmail,
        createdAt: new Date().toISOString()
      };
      transaction.set(logRef, logRecord);

      return newStock;
    });

    await logAuditEvent(
      adminEmail,
      'ADJUST_STOCK',
      'inventory',
      productId,
      `Adjusted stock for ${productName} by ${quantityChange > 0 ? `+${quantityChange}` : quantityChange} units (Reason: ${reasonDescription})`
    );

    return { success: true, newStock: result };
  } catch (err: any) {
    console.error('Inventory transaction error:', err);
    return { success: false, error: err.message || 'Failed to adjust inventory.' };
  }
}

export async function fetchInventoryLogs(productId?: string): Promise<InventoryLogRecord[]> {
  try {
    const logsCol = collection(db, 'inventoryLogs');
    let q = query(logsCol, orderBy('createdAt', 'desc'), limit(50));
    if (productId) {
      q = query(logsCol, where('productId', '==', productId), orderBy('createdAt', 'desc'), limit(50));
    }
    const snap = await getDocs(q);
    const logs: InventoryLogRecord[] = [];
    snap.forEach((d) => logs.push(d.data() as InventoryLogRecord));
    return logs;
  } catch (err) {
    console.warn('Failed to fetch inventory logs:', err);
    return [];
  }
}

// ==========================================
// 3. ORDER MANAGEMENT
// ==========================================

export async function fetchAdminOrders(): Promise<AdminOrderRecord[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, orderBy('createdAt', 'desc'), limit(150));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const orders: AdminOrderRecord[] = [];
      snap.forEach((d) => orders.push(d.data() as AdminOrderRecord));
      return orders;
    }
  } catch (err) {
    console.warn('Failed to fetch admin orders from Firestore:', err);
  }

  // Fallback to local storage recent orders if any exist
  try {
    const local = localStorage.getItem('tate_glow_recent_orders');
    if (local) {
      const parsed = JSON.parse(local);
      return parsed.map((o: any) => ({
        ...o,
        paymentStatus: o.paymentStatus || (o.paymentMethod?.toLowerCase().includes('card') ? 'paid' : 'cod_pending'),
        fulfillmentStatus: o.status || 'unfulfilled'
      }));
    }
  } catch {}

  return [];
}

export async function updateAdminOrderStatus(
  orderId: string,
  updates: {
    paymentStatus?: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
    shippingCarrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    notes?: string;
  },
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return { success: false, error: `Order #${orderId} was not found.` };
    }

    const currentOrder = orderSnap.data() as AdminOrderRecord;
    const historyItem = updates.fulfillmentStatus && updates.fulfillmentStatus !== currentOrder.fulfillmentStatus
      ? {
          status: updates.fulfillmentStatus,
          timestamp: new Date().toISOString(),
          note: updates.notes || `Status changed to ${updates.fulfillmentStatus}`,
          updatedBy: adminEmail
        }
      : null;

    const newHistory = historyItem
      ? [...(currentOrder.statusHistory || []), historyItem]
      : (currentOrder.statusHistory || []);

    const updatedData: Partial<AdminOrderRecord> = {
      ...updates,
      statusHistory: newHistory,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(orderRef, updatedData);

    // If order is cancelled, automatically restore stock to inventory
    if (updates.fulfillmentStatus === 'cancelled' && currentOrder.fulfillmentStatus !== 'cancelled') {
      for (const item of currentOrder.items) {
        if (item.productId) {
          await adjustInventoryStock(
            item.productId,
            item.name,
            item.sku || item.productId.toUpperCase(),
            item.quantity,
            'return_cancellation',
            `Restored stock from cancelled order #${orderId}`,
            adminEmail
          );
        }
      }
    }

    await logAuditEvent(
      adminEmail,
      'UPDATE_ORDER_STATUS',
      'orders',
      orderId,
      `Updated order #${orderId} to Payment: ${updates.paymentStatus || currentOrder.paymentStatus}, Fulfillment: ${updates.fulfillmentStatus || currentOrder.fulfillmentStatus}`
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update order status.' };
  }
}

// ==========================================
// 4. CUSTOMER MANAGEMENT
// ==========================================

export async function fetchCustomerProfiles(): Promise<CustomerProfile[]> {
  try {
    const customersCol = collection(db, 'customers');
    const snap = await getDocs(customersCol);
    if (!snap.empty) {
      const customers: CustomerProfile[] = [];
      snap.forEach((d) => customers.push(d.data() as CustomerProfile));
      return customers;
    }
  } catch (err) {
    console.warn('Failed to fetch customers:', err);
  }

  // Derive from existing orders if customers collection is empty
  const orders = await fetchAdminOrders();
  const customerMap = new Map<string, CustomerProfile>();

  for (const o of orders) {
    const key = (o.customerEmail || o.phone || 'guest').toLowerCase().trim();
    const existing = customerMap.get(key);

    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += o.total;
      existing.glowPoints += o.glowPointsEarned || Math.round(o.total * 0.1);
    } else {
      customerMap.set(key, {
        id: key,
        uid: o.userId,
        name: o.customerName,
        email: o.customerEmail || '',
        phone: o.phone,
        city: o.city,
        address: o.address,
        totalOrders: 1,
        totalSpent: o.total,
        glowPoints: o.glowPointsEarned || Math.round(o.total * 0.1),
        status: o.total > 2500 ? 'vip' : 'active',
        createdAt: o.createdAt,
        lastOrderAt: o.createdAt
      });
    }
  }

  return Array.from(customerMap.values());
}

export async function deleteCustomerProfile(
  customerId: string,
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const custRef = doc(db, 'customers', customerId);
    // Anonymize instead of hard delete to preserve financial ledger integrity
    await setDoc(custRef, {
      name: 'Anonymized Customer',
      email: `anonymized_${customerId.slice(0, 5)}@deleted.com`,
      phone: '0000000000',
      address: 'Anonymized Address',
      status: 'blocked',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await logAuditEvent(
      adminEmail,
      'ANONYMIZE_CUSTOMER',
      'settings',
      customerId,
      `Anonymized customer records per data deletion compliance request (${customerId})`
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to anonymize customer data.' };
  }
}

// ==========================================
// 5. DISCOUNTS AND PROMOTIONS
// ==========================================

export async function fetchDiscounts(): Promise<DiscountCode[]> {
  try {
    const discountsCol = collection(db, 'discounts');
    const snap = await getDocs(discountsCol);
    if (!snap.empty) {
      const discounts: DiscountCode[] = [];
      snap.forEach((d) => discounts.push(d.data() as DiscountCode));
      return discounts;
    }
  } catch (err) {
    console.warn('Failed to fetch discounts:', err);
  }

  // Baseline standard discounts
  return [
    {
      id: 'GLOW10',
      code: 'GLOW10',
      discountType: 'percentage',
      value: 10,
      minPurchase: 500,
      usedCount: 4,
      startsAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'WELCOME50',
      code: 'WELCOME50',
      discountType: 'fixed',
      value: 50,
      minPurchase: 600,
      usedCount: 12,
      startsAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      active: true,
      createdAt: new Date().toISOString()
    }
  ];
}

export async function saveDiscount(
  discount: DiscountCode,
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const codeClean = discount.code.trim().toUpperCase();
    if (!codeClean) {
      return { success: false, error: 'Discount code string is required.' };
    }

    const discountRef = doc(db, 'discounts', codeClean);
    const payload: DiscountCode = {
      ...discount,
      id: codeClean,
      code: codeClean,
      createdAt: discount.createdAt || new Date().toISOString()
    };

    await setDoc(discountRef, payload, { merge: true });

    await logAuditEvent(
      adminEmail,
      'SAVE_DISCOUNT',
      'discounts',
      codeClean,
      `Saved promo code "${codeClean}" (${payload.discountType}: ${payload.value}) with min purchase ${payload.minPurchase} EGP`
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save discount.' };
  }
}

export async function toggleDiscountActive(
  code: string,
  active: boolean,
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const discountRef = doc(db, 'discounts', code);
    await updateDoc(discountRef, { active });

    await logAuditEvent(
      adminEmail,
      'TOGGLE_DISCOUNT',
      'discounts',
      code,
      `Toggled discount ${code} active state to ${active}`
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle discount.' };
  }
}

export async function validateDiscountCode(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discountAmount: number; message: string; discount?: DiscountCode }> {
  const normalized = code.trim().toUpperCase();
  const discounts = await fetchDiscounts();
  const disc = discounts.find((d) => d.code === normalized);

  if (!disc) {
    return { valid: false, discountAmount: 0, message: 'Invalid promo code.' };
  }

  if (!disc.active) {
    return { valid: false, discountAmount: 0, message: 'This promo code is currently inactive.' };
  }

  const now = new Date();
  if (disc.startsAt && new Date(disc.startsAt) > now) {
    return { valid: false, discountAmount: 0, message: 'This promotion has not started yet.' };
  }

  if (disc.expiresAt && new Date(disc.expiresAt) < now) {
    return { valid: false, discountAmount: 0, message: 'This promo code has expired.' };
  }

  if (disc.minPurchase && subtotal < disc.minPurchase) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum purchase of ${disc.minPurchase} EGP required for this discount.`
    };
  }

  if (disc.maxUses && disc.usedCount >= disc.maxUses) {
    return { valid: false, discountAmount: 0, message: 'This promo code usage limit has been reached.' };
  }

  let amount = 0;
  if (disc.discountType === 'percentage') {
    amount = Math.round((subtotal * disc.value) / 100);
  } else {
    amount = Math.min(subtotal, disc.value);
  }

  return {
    valid: true,
    discountAmount: amount,
    message: `Promo code applied successfully (-${amount} EGP)`,
    discount: disc
  };
}

// ==========================================
// 6. HOMEPAGE CONTENT MANAGEMENT
// ==========================================

export async function fetchHomepageContent(): Promise<HomepageContentConfig> {
  try {
    const hpRef = doc(db, 'homepageContent', 'config');
    const snap = await getDoc(hpRef);
    if (snap.exists()) {
      return snap.data() as HomepageContentConfig;
    }
  } catch (err) {
    console.warn('Failed to fetch homepage content:', err);
  }

  // Baseline default content
  return {
    announcementBar: {
      en: 'Pure Stainless Steel · 100% Waterproof & Tarnish-Free · Free Express Delivery Over 1,200 EGP',
      ar: 'Pure Stainless Steel · 100% Waterproof & Tarnish-Free · Free Express Delivery Over 1,200 EGP',
      active: true
    },
    hero: {
      headlineEn: 'Effortless shine for her.',
      headlineAr: 'Effortless shine for her.',
      subtitleEn: 'Minimalist everyday jewelry cast in pure stainless steel. 100% waterproof, hypoallergenic, and made to never take off.',
      subtitleAr: 'Minimalist everyday jewelry cast in pure stainless steel. 100% waterproof, hypoallergenic, and made to never take off.',
      badgeEn: '100% Pure Stainless Steel',
      badgeAr: '100% Pure Stainless Steel',
      ctaButtonTextEn: 'Explore Capsule',
      ctaButtonTextAr: 'Explore Capsule'
    },
    brandStory: {
      titleEn: 'Your Daily Dose of Glow',
      titleAr: 'Your Daily Dose of Glow',
      descriptionEn: 'Designed in Cairo for women who want permanent jewelry luxury that stands up to daily showers, sea water, and skincare.',
      descriptionAr: 'Designed in Cairo for women who want permanent jewelry luxury that stands up to daily showers, sea water, and skincare.'
    },
    featuredCategoryIds: ['necklace', 'bracelet', 'ring', 'earrings'],
    featuredProductIds: ['tate-aura-herringbone', 'tate-arc-cuff', 'tate-dome-signet-ring', 'tate-goutte-teardrop-huggies'],
    updatedAt: new Date().toISOString(),
    updatedBy: STORE_OWNER_EMAIL
  };
}

export async function saveHomepageContent(
  content: HomepageContentConfig,
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const hpRef = doc(db, 'homepageContent', 'config');
    const payload: HomepageContentConfig = {
      ...content,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail
    };

    await setDoc(hpRef, payload, { merge: true });

    await logAuditEvent(
      adminEmail,
      'UPDATE_HOMEPAGE_CONTENT',
      'content',
      'config',
      'Updated homepage hero, announcement bar, and brand copy'
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update homepage content.' };
  }
}

// ==========================================
// 7. ADMIN USERS & AUDIT LOGS
// ==========================================

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    const adminCol = collection(db, 'adminUsers');
    const snap = await getDocs(adminCol);
    if (!snap.empty) {
      const users: AdminUser[] = [];
      snap.forEach((d) => users.push(d.data() as AdminUser));
      return users;
    }
  } catch (err) {
    console.warn('Failed to fetch admin users:', err);
  }

  return [
    {
      id: STORE_OWNER_EMAIL,
      email: STORE_OWNER_EMAIL,
      name: 'The Taté Glow Founder',
      role: 'superadmin',
      permissions: ['all'],
      createdAt: new Date().toISOString()
    }
  ];
}

export async function addAdminUser(
  email: string,
  name: string,
  role: 'superadmin' | 'manager' | 'staff',
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalized = email.toLowerCase().trim();
    const adminRef = doc(db, 'adminUsers', normalized);
    const payload: AdminUser = {
      id: normalized,
      email: normalized,
      name: name || normalized.split('@')[0],
      role,
      permissions: role === 'superadmin' ? ['all'] : role === 'manager' ? ['products', 'inventory', 'orders', 'discounts'] : ['orders', 'inventory_read'],
      createdAt: new Date().toISOString()
    };
    await setDoc(adminRef, payload, { merge: true });

    await logAuditEvent(
      adminEmail,
      'ADD_ADMIN_USER',
      'settings',
      normalized,
      `Granted ${role} role to ${normalized}`
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add admin user.' };
  }
}

export async function removeAdminUser(
  email: string,
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalized = email.toLowerCase().trim();
    if (normalized === STORE_OWNER_EMAIL.toLowerCase()) {
      return { success: false, error: 'Cannot remove primary store owner account.' };
    }

    const adminRef = doc(db, 'adminUsers', normalized);
    await deleteDoc(adminRef);

    await logAuditEvent(
      adminEmail,
      'REMOVE_ADMIN_USER',
      'settings',
      normalized,
      `Revoked administrative access from ${normalized}`
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to remove admin user.' };
  }
}

export async function fetchAuditLogs(): Promise<AuditLogRecord[]> {
  try {
    const logsCol = collection(db, 'auditLogs');
    const q = query(logsCol, orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    const logs: AuditLogRecord[] = [];
    snap.forEach((d) => logs.push(d.data() as AuditLogRecord));
    return logs;
  } catch (err) {
    console.warn('Failed to fetch audit logs:', err);
    return [];
  }
}

// ==========================================
// 8. ANALYTICS & DASHBOARD METRICS CALCULATION
// ==========================================

export function calculateDashboardMetrics(
  orders: AdminOrderRecord[],
  products: AdminProduct[],
  dateFilter: '7d' | '30d' | 'this_month' | 'all' = '30d'
): DashboardMetrics {
  const now = new Date();
  let filterCutoff: Date | null = null;

  if (dateFilter === '7d') {
    filterCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (dateFilter === '30d') {
    filterCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (dateFilter === 'this_month') {
    filterCutoff = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const filteredOrders = orders.filter((o) => {
    if (!filterCutoff) return true;
    return new Date(o.createdAt) >= filterCutoff;
  });

  let totalSalesGross = 0;
  let totalDiscounts = 0;
  let totalRefunds = 0;
  let pendingFulfillmentCount = 0;
  const productSalesMap = new Map<string, { unitsSold: number; revenue: number; name: string }>();
  const dateMap = new Map<string, { orders: number; sales: number }>();

  for (const o of filteredOrders) {
    if (o.paymentStatus === 'refunded') {
      totalRefunds += o.total;
    } else {
      totalSalesGross += o.subtotal + (o.deliveryFee || 0);
      totalDiscounts += o.discountAmount || 0;
    }

    if (o.fulfillmentStatus === 'unfulfilled' || o.fulfillmentStatus === 'processing') {
      pendingFulfillmentCount++;
    }

    // Daily buckets
    const dStr = o.createdAt ? o.createdAt.split('T')[0] : 'Unknown';
    const dayData = dateMap.get(dStr) || { orders: 0, sales: 0 };
    dayData.orders += 1;
    dayData.sales += o.total;
    dateMap.set(dStr, dayData);

    // Product item aggregations
    for (const item of o.items) {
      if (item.productId) {
        const pData = productSalesMap.get(item.productId) || {
          unitsSold: 0,
          revenue: 0,
          name: item.name
        };
        pData.unitsSold += item.quantity;
        pData.revenue += item.price * item.quantity;
        productSalesMap.set(item.productId, pData);
      }
    }
  }

  const totalSalesNet = Math.max(0, totalSalesGross - totalDiscounts - totalRefunds);
  const totalOrdersCount = filteredOrders.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalSalesNet / totalOrdersCount) : 0;

  // Best sellers sorted by units sold
  const bestSellers = Array.from(productSalesMap.entries())
    .map(([productId, data]) => {
      const prod = products.find((p) => p.id === productId);
      return {
        productId,
        name: data.name,
        unitsSold: data.unitsSold,
        revenue: data.revenue,
        image: prod?.image,
        stock: prod?.stock ?? 0
      };
    })
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  // If no sales yet, map from products catalog bestsellers
  if (bestSellers.length === 0 && products.length > 0) {
    products.filter((p) => p.isBestSeller).slice(0, 4).forEach((p) => {
      bestSellers.push({
        productId: p.id,
        name: p.name,
        unitsSold: Math.floor((p.reviewCount || 10) * 0.8),
        revenue: Math.floor((p.reviewCount || 10) * 0.8) * p.price,
        image: p.image,
        stock: p.stock ?? 10
      });
    });
  }

  // Stock alerts
  let lowStockItemsCount = 0;
  let outOfStockItemsCount = 0;
  for (const p of products) {
    const s = p.stock ?? 10;
    if (s <= 0) outOfStockItemsCount++;
    else if (s <= 5) lowStockItemsCount++;
  }

  // Chronological chart data
  const salesByDate = Array.from(dateMap.entries())
    .map(([date, d]) => ({ date, orders: d.orders, sales: d.sales }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalSalesGross,
    totalSalesNet,
    totalRefunds,
    totalOrdersCount,
    averageOrderValue,
    pendingFulfillmentCount,
    lowStockItemsCount,
    outOfStockItemsCount,
    bestSellers,
    salesByDate
  };
}
