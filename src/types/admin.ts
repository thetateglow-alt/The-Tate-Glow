import { JewelryCategory, Product } from './jewelry';

export interface ProductVariant {
  id: string;
  size: string;
  sku: string;
  stock: number;
  price?: number;
}

export interface AdminProduct extends Product {
  sku: string;
  costPrice?: number; // Cost for profit & valuation
  salePrice?: number;
  variants?: ProductVariant[];
  status: 'published' | 'draft' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
  updatedAt?: string;
}

export type InventoryMovementReason = 
  | 'order_placed'
  | 'restock'
  | 'inventory_correction'
  | 'damaged_goods'
  | 'sample_gift'
  | 'return_cancellation';

export interface InventoryLogRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: InventoryMovementReason;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  orderId?: string;
  adminEmail: string;
  createdAt: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'cod_pending' | 'refunded';
export type FulfillmentStatus = 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItemDetail {
  productId: string;
  name: string;
  nameAr?: string;
  sku?: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  image?: string;
}

export interface AdminOrderRecord {
  id: string; // e.g. TG-123456
  userId?: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  city: string;
  address: string;
  items: OrderItemDetail[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  shippingCarrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  statusHistory?: {
    status: FulfillmentStatus;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  glowPointsEarned?: number;
}

export interface CustomerProfile {
  id: string; // email or uid
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  glowPoints: number;
  status: 'active' | 'vip' | 'blocked';
  createdAt: string;
  lastOrderAt?: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // percentage (e.g. 15 for 15%) or fixed amount in EGP (e.g. 150)
  minPurchase: number; // in EGP
  maxUses?: number;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  active: boolean;
  categoryRestriction?: JewelryCategory | 'all';
  createdAt: string;
}

export interface HomepageContentConfig {
  announcementBar: {
    en: string;
    ar: string;
    active: boolean;
  };
  hero: {
    headlineEn: string;
    headlineAr: string;
    subtitleEn: string;
    subtitleAr: string;
    badgeEn: string;
    badgeAr: string;
    imageUrl?: string;
    ctaButtonTextEn: string;
    ctaButtonTextAr: string;
  };
  brandStory: {
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
  };
  featuredCategoryIds: string[];
  featuredProductIds: string[];
  updatedAt: string;
  updatedBy: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'manager' | 'staff';
  permissions: string[];
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  adminEmail: string;
  action: string; // 'CREATE_PRODUCT' | 'UPDATE_PRICE' | 'ADJUST_STOCK' | 'FULFILL_ORDER' | etc.
  resource: 'products' | 'orders' | 'inventory' | 'discounts' | 'content' | 'settings';
  resourceId: string;
  details: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalSalesGross: number;
  totalSalesNet: number;
  totalRefunds: number;
  totalOrdersCount: number;
  averageOrderValue: number;
  pendingFulfillmentCount: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  bestSellers: {
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
    image?: string;
    stock: number;
  }[];
  salesByDate: {
    date: string;
    orders: number;
    sales: number;
  }[];
}
