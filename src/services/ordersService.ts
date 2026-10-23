import { collection, doc, setDoc, getDoc, updateDoc, getDocs, orderBy, query } from 'firebase/firestore';
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
 * Submit order securely to the server/Cloud Function.
 * The browser NEVER sends prices, totals, or payment statuses.
 * The server validates product prices against Firestore, locks stock transactionally,
 * and sets status to 'pending payment' (or 'cod_pending').
 */
export async function submitSecureCheckout(payload: CheckoutRequestPayload): Promise<CheckoutResponsePayload> {
  const endpointUrl = '/api/checkout';
  let response: Response;

  try {
    response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (networkErr: any) {
    throw new Error(`Connection error: ${networkErr.message || 'Unable to reach checkout server.'}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    let errorDetail = `Order request failed with status ${response.status} (${response.statusText})`;
    if (isJson) {
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.error || errorJson.message || errorDetail;
      } catch {
        // Fallback to default message
      }
    } else {
      const text = await response.text();
      console.warn(`[Checkout] Non-JSON error response from ${endpointUrl}:`, text.slice(0, 300));
      errorDetail = `Server returned an invalid HTML error response (${response.status}) instead of JSON. Ensure ${endpointUrl} is routed to the application server.`;
    }
    throw new Error(errorDetail);
  }

  if (!isJson) {
    const text = await response.text();
    console.warn(`[Checkout] Unexpected non-JSON response from ${endpointUrl}:`, text.slice(0, 300));
    throw new Error(`Expected JSON response from checkout endpoint (${endpointUrl}), but received ${contentType || 'non-JSON content'}.`);
  }

  let data: CheckoutResponsePayload;
  try {
    data = await response.json();
  } catch (jsonErr: any) {
    throw new Error(`Failed to parse checkout server response: ${jsonErr.message}`);
  }

  if (!data.success) {
    throw new Error(data.message || 'Server rejected checkout validation.');
  }

  // Cache order locally for instantaneous client receipts
  try {
    const storageKey = payload.userId ? `tate_glow_orders_${payload.userId}` : 'tate_glow_orders_guest';
    const existingRaw = localStorage.getItem(storageKey);
    const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
    const clientOrderSummary = {
      id: data.orderId,
      userId: payload.userId,
      customerName: payload.customer.name,
      customerEmail: payload.customer.email,
      phone: payload.customer.phone,
      city: payload.customer.city,
      address: payload.customer.address,
      paymentMethod: payload.paymentMethodRequested === 'cod' ? 'Cash on Delivery' : 'Credit / Debit Card',
      items: payload.items,
      subtotal: data.subtotal,
      discount: data.discount,
      deliveryFee: data.deliveryFee,
      total: data.total,
      status: 'confirmed',
      paymentStatus: data.paymentStatus,
      fulfillmentStatus: data.fulfillmentStatus,
      createdAt: new Date().toISOString(),
      glowPointsEarned: data.glowPointsEarned
    };
    localStorage.setItem(storageKey, JSON.stringify([clientOrderSummary, ...existing.filter(o => o.id !== data.orderId)]));

    const globalRaw = localStorage.getItem('tate_glow_recent_orders');
    const globalOrders: any[] = globalRaw ? JSON.parse(globalRaw) : [];
    localStorage.setItem('tate_glow_recent_orders', JSON.stringify([clientOrderSummary, ...globalOrders.filter(o => o.id !== data.orderId)].slice(0, 20)));
  } catch (err) {
    console.warn('Local storage cache note:', err);
  }

  return data;
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
