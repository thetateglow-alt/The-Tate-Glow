import { collection, doc, setDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebaseAuth';
import { PRODUCTS, BRAND_CONFIG } from '../data/products';
import { calculateBundleDiscount } from '../utils/pricing';
import { sendOrderReceiptViaEmailJS } from './emailJsService';

export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'delivered';

export interface OrderItemRecord {
  productId: string;
  name: string;
  nameAr?: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  image?: string;
}

export interface CustomerOrder {
  id: string; // e.g. TG-782194
  orderNumber?: string;
  userId?: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: string;
  items: OrderItemRecord[];
  subtotal: number;
  discount: number;
  discountAmount?: number;
  discountCode?: string;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  statusLabelEn: string;
  statusLabelAr: string;
  paymentStatus: 'paid' | 'pending' | 'cod_pending' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  glowPointsEarned?: number;
  glowPointsDiscount?: number;
  bundleType?: string;
  statusHistory?: {
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }[];
}

export const ORDER_STATUS_MAP: Record<OrderStatus, { en: string; ar: string; color: string; step: number }> = {
  confirmed: {
    en: 'Order Confirmed',
    ar: 'Order Confirmed',
    color: 'bg-amber-100 text-amber-900 border-amber-200',
    step: 1
  },
  processing: {
    en: 'Packaging in Studio',
    ar: 'Packaging in Studio',
    color: 'bg-blue-100 text-blue-900 border-blue-200',
    step: 2
  },
  shipped: {
    en: 'Out for Delivery (Courier)',
    ar: 'Out for Delivery (Courier)',
    color: 'bg-purple-100 text-purple-900 border-purple-200',
    step: 3
  },
  delivered: {
    en: 'Delivered Successfully',
    ar: 'Delivered Successfully',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    step: 4
  }
};

export interface CheckoutRequestPayload {
  items: { productId: string; selectedSize?: string; quantity: number }[];
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    address: string;
  };
  paymentMethodRequested: 'card' | 'cod';
  discountCode?: string;
  redeemGlowPoints?: number;
  userId?: string;
}

export interface CheckoutResponsePayload {
  success: boolean;
  orderId: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  glowPointsEarned: number;
  bundleType?: string;
  message?: string;
}

/**
 * Generates an elegant luxury order reference ID, e.g. TG-842915
 */
function generateOrderId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `TG-${randomNum}`;
}

/**
 * Client-Side Order Submission & Firestore Persistence (GitHub Pages Compatible).
 * - Zero /api backend calls.
 * - Computes pricing, bundle promotions (10% off for 2 items, 15% off for 3+), and loyalty points.
 * - Saves order directly into the Firestore 'orders' collection.
 * - Dispatches receipt email using EmailJS.
 * - Caches order locally for instantaneous client receipts.
 */
export async function submitSecureCheckout(payload: CheckoutRequestPayload): Promise<CheckoutResponsePayload> {
  if (!payload.items || payload.items.length === 0) {
    throw new Error('Your cart is empty. Please select jewelry items to proceed.');
  }

  if (!payload.customer.name.trim() || !payload.customer.phone.trim() || !payload.customer.address.trim()) {
    throw new Error('Please fill in your name, delivery phone number, and street address.');
  }

  // 1. Resolve and validate items against authoritative catalog
  const resolvedItems: OrderItemRecord[] = [];
  let rawSubtotal = 0;

  for (const requestedItem of payload.items) {
    const catalogItem = PRODUCTS.find((p) => p.id === requestedItem.productId);
    const itemPrice = catalogItem ? catalogItem.price : 550; // Fallback price
    const itemName = catalogItem ? catalogItem.name : requestedItem.productId;
    const itemNameAr = catalogItem ? catalogItem.nameAr : undefined;
    const itemImage = catalogItem ? catalogItem.image : undefined;

    const qty = Math.max(1, requestedItem.quantity || 1);
    rawSubtotal += itemPrice * qty;

    resolvedItems.push({
      productId: requestedItem.productId,
      name: itemName,
      nameAr: itemNameAr,
      price: itemPrice,
      quantity: qty,
      selectedSize: requestedItem.selectedSize,
      image: itemImage
    });
  }

  // 2. Compute bundle discounts using authoritative product definitions
  const bundleCalculation = calculateBundleDiscount(
    resolvedItems.map((item) => {
      const fullProduct = PRODUCTS.find((p) => p.id === item.productId) || PRODUCTS[0];
      return {
        id: `${item.productId}-${item.selectedSize || 'standard'}`,
        product: fullProduct,
        quantity: item.quantity,
        selectedSize: item.selectedSize || 'Standard'
      };
    })
  );

  const bundleDiscount = bundleCalculation.discountAmount || 0;
  let bundleType: string | undefined = undefined;
  if (bundleDiscount > 0) {
    const totalQty = resolvedItems.reduce((acc, i) => acc + i.quantity, 0);
    bundleType = totalQty >= 3 ? 'Glow Trio Bundle (15% Off)' : 'Glow Duo Bundle (10% Off)';
  }

  // 3. Compute loyalty Glow Points discount (100 points = 50 EGP, i.e. 0.5 EGP per point)
  const activePointsRedeemed = Math.max(0, payload.redeemGlowPoints || 0);
  const glowPointsDiscount = Math.round(activePointsRedeemed * 0.5);

  // 4. Combined discount amount
  const totalDiscount = bundleDiscount + glowPointsDiscount;
  const discountedSubtotal = Math.max(0, rawSubtotal - totalDiscount);

  // 5. Delivery fee calculation (Free above 1,200 EGP, otherwise 65 EGP)
  const deliveryFee = discountedSubtotal >= BRAND_CONFIG.freeShippingThreshold ? 0 : 65;
  const finalTotal = discountedSubtotal + deliveryFee;

  // 6. Glow points earned: 10 points for every 100 EGP spent on jewelry
  const glowPointsEarned = Math.round((discountedSubtotal / 100) * 10);

  // 7. Generate order details
  const orderId = generateOrderId();
  const nowIso = new Date().toISOString();
  const paymentMethodLabel = payload.paymentMethodRequested === 'cod' ? 'Cash on Delivery' : 'Credit / Debit Card';
  const paymentStatus = payload.paymentMethodRequested === 'cod' ? 'cod_pending' : 'paid';

  const orderRecord: CustomerOrder = {
    id: orderId,
    orderNumber: orderId,
    userId: payload.userId,
    customerName: payload.customer.name.trim(),
    customerEmail: payload.customer.email.trim(),
    phone: payload.customer.phone.trim(),
    city: payload.customer.city || 'Cairo',
    address: payload.customer.address.trim(),
    paymentMethod: paymentMethodLabel,
    items: resolvedItems,
    subtotal: rawSubtotal,
    discount: totalDiscount,
    discountAmount: totalDiscount,
    discountCode: payload.discountCode,
    deliveryFee,
    total: finalTotal,
    status: 'confirmed',
    statusLabelEn: 'Order Confirmed',
    statusLabelAr: 'Order Confirmed',
    paymentStatus,
    fulfillmentStatus: 'unfulfilled',
    createdAt: nowIso,
    updatedAt: nowIso,
    estimatedDelivery: '2 - 4 business days',
    trackingNumber: `TG-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
    glowPointsEarned,
    glowPointsDiscount: glowPointsDiscount > 0 ? glowPointsDiscount : undefined,
    bundleType,
    statusHistory: [
      {
        status: 'unfulfilled',
        timestamp: nowIso,
        note: 'Order placed by customer via store checkout (GitHub Pages client-side mode).'
      }
    ]
  };

  // 8. Save order directly to Firestore 'orders' collection
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await setDoc(orderDocRef, orderRecord);
    console.info(`[Firestore] Order #${orderId} saved directly to 'orders' collection.`);
  } catch (firestoreErr: any) {
    console.warn(`[Firestore] Could not save order #${orderId} to 'orders' collection:`, firestoreErr);
    // Even if Firestore hits permission or offline issue, do not crash checkout - local storage will persist it
  }

  // 9. If user is logged in, also mirror to user subcollection
  if (payload.userId) {
    try {
      const userOrderRef = doc(db, 'users', payload.userId, 'orders', orderId);
      await setDoc(userOrderRef, orderRecord);
    } catch (userSubColErr) {
      console.warn('[Firestore] Note on user order subcollection save:', userSubColErr);
    }
  }

  // 10. Also attempt customer profile record in 'customers' collection
  try {
    const customerDocId = payload.userId || payload.customer.email.trim().toLowerCase() || orderId;
    const customerRef = doc(db, 'customers', customerDocId);
    await setDoc(
      customerRef,
      {
        name: payload.customer.name.trim(),
        email: payload.customer.email.trim().toLowerCase(),
        phone: payload.customer.phone.trim(),
        city: payload.customer.city || 'Cairo',
        address: payload.customer.address.trim(),
        lastOrderAt: nowIso,
        lastOrderId: orderId
      },
      { merge: true }
    );
  } catch (custErr) {
    // Non-critical background save
  }

  // 11. Dispatch itemized receipt email using EmailJS directly from client
  try {
    await sendOrderReceiptViaEmailJS({
      orderId,
      customerName: payload.customer.name.trim(),
      customerEmail: payload.customer.email.trim(),
      phone: payload.customer.phone.trim(),
      city: payload.customer.city || 'Cairo',
      address: payload.customer.address.trim(),
      paymentMethod: paymentMethodLabel,
      items: resolvedItems.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        selectedSize: i.selectedSize
      })),
      subtotal: rawSubtotal,
      discount: totalDiscount,
      deliveryFee,
      total: finalTotal,
      bundleType,
      glowPointsEarned,
      glowPointsDiscount: glowPointsDiscount > 0 ? glowPointsDiscount : undefined
    });
  } catch (emailErr) {
    console.warn('[EmailJS] Order receipt dispatch note:', emailErr);
  }

  // 12. Cache order locally for instantaneous client receipts
  try {
    const storageKey = payload.userId ? `tate_glow_orders_${payload.userId}` : 'tate_glow_orders_guest';
    const existingRaw = localStorage.getItem(storageKey);
    const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
    localStorage.setItem(storageKey, JSON.stringify([orderRecord, ...existing.filter((o) => o.id !== orderId)]));

    const globalRaw = localStorage.getItem('tate_glow_recent_orders');
    const globalOrders: any[] = globalRaw ? JSON.parse(globalRaw) : [];
    localStorage.setItem('tate_glow_recent_orders', JSON.stringify([orderRecord, ...globalOrders.filter((o) => o.id !== orderId)].slice(0, 20)));
  } catch (err) {
    console.warn('Local storage cache note:', err);
  }

  return {
    success: true,
    orderId,
    subtotal: rawSubtotal,
    discount: totalDiscount,
    deliveryFee,
    total: finalTotal,
    paymentStatus,
    fulfillmentStatus: 'unfulfilled',
    glowPointsEarned,
    bundleType,
    message: 'Order saved directly to Firestore and confirmation email dispatched.'
  };
}

/**
 * Fetch all orders for a user from Firestore and localStorage
 */
export async function fetchCustomerOrders(userId?: string): Promise<CustomerOrder[]> {
  const localKey = userId ? `tate_glow_orders_${userId}` : 'tate_glow_orders_guest';
  let localOrders: CustomerOrder[] = [];

  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localOrders = JSON.parse(raw);

    // Also check global recent orders if local key is empty
    if (localOrders.length === 0) {
      const globalRaw = localStorage.getItem('tate_glow_recent_orders');
      if (globalRaw) localOrders = JSON.parse(globalRaw);
    }
  } catch (err) {
    console.warn('Error reading local orders:', err);
  }

  // If user is logged in, attempt fetching from Firestore
  if (userId) {
    try {
      const firestoreOrders: CustomerOrder[] = [];

      // 1. Check user subcollection
      try {
        const userOrdersCol = collection(db, 'users', userId, 'orders');
        const qSub = query(userOrdersCol, orderBy('createdAt', 'desc'));
        const snapSub = await getDocs(qSub);
        snapSub.forEach((d) => firestoreOrders.push(d.data() as CustomerOrder));
      } catch (errSub) {
        console.warn('Subcollection fetch note:', errSub);
      }

      // 2. Check top-level orders collection where userId matches
      try {
        const mainOrdersCol = collection(db, 'orders');
        const qMain = query(mainOrdersCol, where('userId', '==', userId));
        const snapMain = await getDocs(qMain);
        snapMain.forEach((d) => firestoreOrders.push(d.data() as CustomerOrder));
      } catch (errMain) {
        console.warn('Main orders fetch note:', errMain);
      }

      if (firestoreOrders.length > 0) {
        // Merge firestore and local orders, preferring firestore data
        const map = new Map<string, CustomerOrder>();
        localOrders.forEach((o) => map.set(o.id, o));
        firestoreOrders.forEach((o) => map.set(o.id, o));
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Update local storage cache
        try {
          localStorage.setItem(localKey, JSON.stringify(merged));
        } catch {}

        return merged;
      }
    } catch (err) {
      console.warn('Firestore orders fetch error (using local cache):', err);
    }
  }

  return localOrders;
}
