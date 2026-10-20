import { collection, doc, setDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebaseAuth';

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
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  statusLabelEn: string;
  statusLabelAr: string;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  glowPointsEarned?: number;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, { en: string; ar: string; color: string; step: number }> = {
  confirmed: {
    en: 'Order Confirmed',
    ar: 'تم تأكيد الطلب',
    color: 'bg-amber-100 text-amber-900 border-amber-200',
    step: 1
  },
  processing: {
    en: 'Packaging in Studio',
    ar: 'جاري التجهيز والتغليف',
    color: 'bg-blue-100 text-blue-900 border-blue-200',
    step: 2
  },
  shipped: {
    en: 'Out for Delivery (Courier)',
    ar: 'مع المندوب للشحن',
    color: 'bg-purple-100 text-purple-900 border-purple-200',
    step: 3
  },
  delivered: {
    en: 'Delivered Successfully',
    ar: 'تم التوصيل بنجاح',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    step: 4
  }
};

/**
 * Save an order to Firestore and localStorage
 */
export async function saveCustomerOrder(order: CustomerOrder, userId?: string): Promise<void> {
  // Always persist locally first for instant, offline resilience
  try {
    const storageKey = userId ? `tate_glow_orders_${userId}` : 'tate_glow_orders_guest';
    const existingRaw = localStorage.getItem(storageKey);
    const existing: CustomerOrder[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [order, ...existing.filter(o => o.id !== order.id)];
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Also update global recent orders list
    const globalRaw = localStorage.getItem('tate_glow_recent_orders');
    const globalOrders: CustomerOrder[] = globalRaw ? JSON.parse(globalRaw) : [];
    localStorage.setItem('tate_glow_recent_orders', JSON.stringify([order, ...globalOrders.filter(o => o.id !== order.id)].slice(0, 20)));
  } catch (err) {
    console.warn('Could not cache order in localStorage:', err);
  }

  // If user is authenticated, also save to Firestore
  if (userId) {
    try {
      const orderRef = doc(db, 'users', userId, 'orders', order.id);
      await setDoc(orderRef, {
        ...order,
        userId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Failed to save order to Firestore (offline fallback used):', err);
    }
  }
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
      const ordersCol = collection(db, 'users', userId, 'orders');
      const q = query(ordersCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const firestoreOrders: CustomerOrder[] = [];
        snapshot.forEach((d) => {
          firestoreOrders.push(d.data() as CustomerOrder);
        });

        // Merge firestore and local orders, preferring firestore data
        const map = new Map<string, CustomerOrder>();
        localOrders.forEach(o => map.set(o.id, o));
        firestoreOrders.forEach(o => map.set(o.id, o));
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
