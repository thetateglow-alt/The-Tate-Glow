import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  Palette,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  Download,
  Filter,
  DollarSign,
  ChevronRight,
  Shield,
  FileText,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Truck,
  RotateCcw
} from 'lucide-react';
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
} from '../../types/admin';
import {
  fetchAdminProducts,
  saveAdminProduct,
  deleteAdminProduct,
  adjustInventoryStock,
  fetchInventoryLogs,
  fetchAdminOrders,
  updateAdminOrderStatus,
  fetchCustomerProfiles,
  deleteCustomerProfile,
  fetchDiscounts,
  saveDiscount,
  toggleDiscountActive,
  fetchHomepageContent,
  saveHomepageContent,
  fetchAdminUsers,
  addAdminUser,
  removeAdminUser,
  fetchAuditLogs,
  calculateDashboardMetrics,
  STORE_OWNER_EMAIL
} from '../../services/adminService';
import { formatEGP } from '../../utils/pricing';
import { JewelryCategory } from '../../types/jewelry';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onProductsUpdated?: () => void;
}

type AdminTab =
  | 'overview'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'discounts'
  | 'content'
  | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProductsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Core Data States
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [homepageContent, setHomepageContent] = useState<HomepageContentConfig | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLogRecord[]>([]);

  // Filter & Search States
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'this_month' | 'all'>('30d');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productStatusFilter, setProductStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all');
  const [orderFulfillmentFilter, setOrderFulfillmentFilter] = useState<string>('all');

  // Modals inside Admin
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRecord | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<AdminProduct | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(5);
  const [stockReason, setStockReason] = useState<InventoryMovementReason>('restock');
  const [stockReasonDesc, setStockReasonDesc] = useState('Shipment restock from studio');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [newDiscountCode, setNewDiscountCode] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    minPurchase: 500,
    expiresDays: 60
  });

  const adminEmail = currentUser?.email || STORE_OWNER_EMAIL;

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, ords, custs, discs, hp, admins, audits, invLogs] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminOrders(),
        fetchCustomerProfiles(),
        fetchDiscounts(),
        fetchHomepageContent(),
        fetchAdminUsers(),
        fetchAuditLogs(),
        fetchInventoryLogs()
      ]);

      setProducts(prods);
      setOrders(ords);
      setCustomers(custs);
      setDiscounts(discs);
      setHomepageContent(hp);
      setAdminUsers(admins);
      setAuditLogs(audits);
      setInventoryLogs(invLogs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      notify('Failed to load some dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Derived Metrics
  const metrics: DashboardMetrics = useMemo(() => {
    return calculateDashboardMetrics(orders, products, dateRange);
  }, [orders, products, dateRange]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = productSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
      const matchStatus = productStatusFilter === 'all' || p.status === productStatusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, productSearch, productCategoryFilter, productStatusFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
        (o.phone && o.phone.includes(q));

      const matchPay = orderPaymentFilter === 'all' || o.paymentStatus === orderPaymentFilter;
      const matchFulfill = orderFulfillmentFilter === 'all' || o.fulfillmentStatus === orderFulfillmentFilter;
      return matchSearch && matchPay && matchFulfill;
    });
  }, [orders, orderSearch, orderPaymentFilter, orderFulfillmentFilter]);

  // Product Form Handler
  const handleOpenAddProduct = () => {
    const defaultSku = `TG-${Math.floor(100 + Math.random() * 900)}`;
    setEditingProduct({
      id: '',
      sku: defaultSku,
      name: '',
      nameAr: '',
      category: 'necklace',
      categoryAr: 'سلاسل وقلادات',
      price: 650,
      originalPrice: 800,
      costPrice: 280,
      description: 'Handcrafted in medical-grade surgical stainless steel. 100% waterproof and hypoallergenic.',
      descriptionAr: 'مصنوعة يدوياً من الستانلس ستيل الطبي الخالص المقاوم للماء 100% والمضاد للحساسية.',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      details: ['Pure surgical stainless steel', '100% Waterproof & Sweatproof', 'Hypoallergenic & Nickel-safe'],
      specs: {
        material: 'Pure 316L Surgical Stainless Steel',
        finish: 'Natural High Polish Mirror',
        waterproof: '100% Waterproof',
        hypoallergenic: true,
        weight: '12g',
        sizes: ['40cm + 5cm', '45cm + 5cm']
      },
      stock: 15,
      rating: 5.0,
      reviewCount: 1,
      status: 'published',
      featured: true,
      isBestSeller: false
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const res = await saveAdminProduct(editingProduct, adminEmail);
    if (res.success) {
      notify('Product saved successfully');
      setIsProductModalOpen(false);
      await loadData();
      if (onProductsUpdated) onProductsUpdated();
    } else {
      notify(res.error || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const res = await deleteAdminProduct(productId, adminEmail);
    if (res.success) {
      notify('Product deleted');
      await loadData();
      if (onProductsUpdated) onProductsUpdated();
    } else {
      notify(res.error || 'Failed to delete product', 'error');
    }
  };

  // Stock Adjustment Handler
  const handleStockAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustProduct) return;

    const res = await adjustInventoryStock(
      stockAdjustProduct.id,
      stockAdjustProduct.name,
      stockAdjustProduct.sku || stockAdjustProduct.id.toUpperCase(),
      stockDelta,
      stockReason,
      stockReasonDesc,
      adminEmail
    );

    if (res.success) {
      notify(`Stock updated to ${res.newStock} units`);
      setIsStockModalOpen(false);
      await loadData();
      if (onProductsUpdated) onProductsUpdated();
    } else {
      notify(res.error || 'Stock update failed', 'error');
    }
  };

  // Order Status Update Handler
  const handleUpdateOrder = async (
    orderId: string,
    updates: {
      paymentStatus?: PaymentStatus;
      fulfillmentStatus?: FulfillmentStatus;
      shippingCarrier?: string;
      trackingNumber?: string;
      notes?: string;
    }
  ) => {
    const res = await updateAdminOrderStatus(orderId, updates, adminEmail);
    if (res.success) {
      notify(`Order #${orderId} updated successfully`);
      await loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, ...updates } : null);
      }
    } else {
      notify(res.error || 'Order update failed', 'error');
    }
  };

  // Create Discount Handler
  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: DiscountCode = {
      id: newDiscountCode.code.trim().toUpperCase(),
      code: newDiscountCode.code.trim().toUpperCase(),
      discountType: newDiscountCode.discountType,
      value: Number(newDiscountCode.value),
      minPurchase: Number(newDiscountCode.minPurchase),
      usedCount: 0,
      startsAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + newDiscountCode.expiresDays * 24 * 60 * 60 * 1000).toISOString(),
      active: true,
      createdAt: new Date().toISOString()
    };

    const res = await saveDiscount(payload, adminEmail);
    if (res.success) {
      notify(`Promo code ${payload.code} created`);
      setIsDiscountModalOpen(false);
      await loadData();
    } else {
      notify(res.error || 'Failed to create promo code', 'error');
    }
  };

  // Export CSV Helper
  const exportOrdersCSV = () => {
    if (orders.length === 0) {
      notify('No orders to export', 'error');
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'City', 'Payment Method', 'Payment Status', 'Fulfillment', 'Subtotal', 'Discount', 'Total EGP'];
    const rows = orders.map((o) => [
      o.id,
      o.createdAt ? o.createdAt.split('T')[0] : '',
      `"${o.customerName}"`,
      o.customerEmail,
      o.phone,
      o.city,
      `"${o.paymentMethod}"`,
      o.paymentStatus,
      o.fulfillmentStatus,
      o.subtotal,
      o.discountAmount || 0,
      o.total
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tate_glow_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Orders CSV downloaded');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-[#FAF8F5] w-full max-w-7xl h-[94vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        
        {/* Top Bar */}
        <header className="h-16 px-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg tracking-[0.2em] font-semibold text-white uppercase">
              The Taté Glow
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-400 text-stone-950">
              Admin Portal
            </span>
            <span className="text-xs text-stone-400 hidden sm:inline">
              · Authenticated as <strong className="text-stone-200">{adminEmail}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refresh Data"
              className="p-2 text-stone-400 hover:text-white rounded-md hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-md hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div className={`py-2 px-4 text-xs font-semibold flex items-center justify-between transition-all ${
            feedbackMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="opacity-80 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Dashboard Shell with Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navigation Sidebar */}
          <aside className="w-56 bg-stone-950 text-stone-300 p-3 flex flex-col gap-1 border-r border-stone-800 shrink-0 overflow-y-auto">
            {[
              { id: 'overview', label: 'Overview & Sales', icon: LayoutDashboard },
              { id: 'products', label: 'Product Catalog', icon: Package, badge: products.length },
              { id: 'inventory', label: 'Inventory & Stock', icon: Boxes, badge: metrics.lowStockItemsCount > 0 ? `${metrics.lowStockItemsCount} low` : undefined },
              { id: 'orders', label: 'Customer Orders', icon: ShoppingBag, badge: metrics.pendingFulfillmentCount > 0 ? metrics.pendingFulfillmentCount : undefined },
              { id: 'customers', label: 'Customer Profiles', icon: Users, badge: customers.length },
              { id: 'discounts', label: 'Discounts & Promos', icon: Tag },
              { id: 'content', label: 'Homepage Content', icon: Palette },
              { id: 'security', label: 'Staff & Audit Logs', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-stone-800 text-white font-semibold shadow-xs text-amber-300'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      typeof tab.badge === 'string' ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="mt-auto pt-4 border-t border-stone-800/80 text-[11px] text-stone-500 px-2 space-y-1">
              <p>The Taté Glow Operations</p>
              <p className="text-[10px] font-mono text-stone-600">v2.4 · Pure 316L Jewelry</p>
            </div>
          </aside>

          {/* Main Content Workspace */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* 1. OVERVIEW & ANALYTICS TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Header & Date Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-950">
                      Operations Overview
                    </h2>
                    <p className="text-xs text-stone-500">
                      Real-time revenue, order fulfillment, and jewelry stock indicators.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-medium">Filter:</span>
                    {(['7d', '30d', 'this_month', 'all'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                          dateRange === range
                            ? 'bg-stone-900 text-white font-semibold'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === 'this_month' ? 'This Month' : 'All Time'}
                      </button>
                    ))}
                    <button
                      onClick={exportOrdersCSV}
                      className="ml-2 px-3 py-1.5 rounded text-xs font-semibold bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-1">
                    <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                      Net Sales (Orders)
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold font-serif text-stone-950 tabular-nums">
                        {formatEGP(metrics.totalSalesNet, 'en')}
                      </span>
                      <span className="text-xs font-medium text-emerald-600 flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                        Active
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      Gross: {formatEGP(metrics.totalSalesGross, 'en')} · Discounts: -{formatEGP(metrics.totalRefunds, 'en')}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-1">
                    <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                      Total Orders
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold font-serif text-stone-950 tabular-nums">
                        {metrics.totalOrdersCount}
                      </span>
                      <span className="text-xs text-stone-500 font-mono">
                        AOV: {formatEGP(metrics.averageOrderValue, 'en')}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      {metrics.pendingFulfillmentCount} awaiting dispatch
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-1">
                    <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                      Active Catalog
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold font-serif text-stone-950 tabular-nums">
                        {products.length} Pieces
                      </span>
                      <span className="text-xs text-stone-600">
                        {products.reduce((acc, p) => acc + (p.stock ?? 0), 0)} Total Units
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      100% Surgical Stainless Steel
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border shadow-2xs space-y-1 ${
                    metrics.lowStockItemsCount > 0
                      ? 'bg-amber-50/80 border-amber-200'
                      : 'bg-white border-stone-200'
                  }`}>
                    <span className="text-[11px] font-medium text-amber-900 uppercase tracking-wider">
                      Low Stock Alerts
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold font-serif text-amber-950 tabular-nums">
                        {metrics.lowStockItemsCount} Items
                      </span>
                      {metrics.lowStockItemsCount > 0 ? (
                        <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Needs Restock
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600">Healthy</span>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-500">
                      {metrics.outOfStockItemsCount} currently sold out
                    </p>
                  </div>
                </div>

                {/* Split: Best Sellers Leaderboard & Quick Action Center */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Best Sellers (2 cols) */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
                        Top Performing Jewelry Pieces
                      </h3>
                      <button
                        onClick={() => setActiveTab('products')}
                        className="text-xs text-stone-500 hover:text-stone-950 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>View All Products</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {metrics.bestSellers.map((item, idx) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between p-3 rounded-lg border border-stone-100 hover:bg-stone-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-center font-mono font-bold text-xs text-stone-400">
                              #{idx + 1}
                            </span>
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded bg-stone-100 shrink-0"
                              />
                            )}
                            <div>
                              <h4 className="text-xs font-medium text-stone-900">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-stone-500">
                                Stock: {item.stock} units remaining
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-stone-950 tabular-nums block">
                              {formatEGP(item.revenue, 'en')}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {item.unitsSold} sold
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action Center (1 col) */}
                  <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
                      Quick Management
                    </h3>

                    <div className="space-y-2.5">
                      <button
                        onClick={handleOpenAddProduct}
                        className="w-full p-3 rounded-lg bg-stone-950 text-white text-xs font-medium hover:bg-stone-800 transition-colors flex items-center justify-between cursor-pointer shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-amber-400" />
                          <span>Add New Jewelry Piece</span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('inventory');
                        }}
                        className="w-full p-3 rounded-lg bg-white border border-stone-200 text-stone-800 text-xs font-medium hover:bg-stone-50 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Boxes className="w-4 h-4 text-stone-600" />
                          <span>Adjust Inventory Levels</span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                      </button>

                      <button
                        onClick={() => {
                          setNewDiscountCode({
                            code: 'SPRING15',
                            discountType: 'percentage',
                            value: 15,
                            minPurchase: 500,
                            expiresDays: 30
                          });
                          setIsDiscountModalOpen(true);
                        }}
                        className="w-full p-3 rounded-lg bg-white border border-stone-200 text-stone-800 text-xs font-medium hover:bg-stone-50 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-stone-600" />
                          <span>Create Promo Code</span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                      </button>

                      <button
                        onClick={() => setActiveTab('content')}
                        className="w-full p-3 rounded-lg bg-white border border-stone-200 text-stone-800 text-xs font-medium hover:bg-stone-50 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-stone-600" />
                          <span>Edit Homepage Banner & Copy</span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                      </button>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-lg text-xs text-stone-600 space-y-1 border border-stone-200/60 mt-4">
                      <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Security & Access Enforced</span>
                      </p>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Changes are saved to live Firestore and verified by security rules. Stock decrements occur transactionally upon order submission.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PRODUCT CATALOG MANAGEMENT TAB */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-stone-950">
                      Jewelry Product Catalog ({filteredProducts.length})
                    </h2>
                    <p className="text-xs text-stone-500">
                      Manage product details, pricing, SKUs, imagery, and variant sizing.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2 bg-stone-950 text-white rounded text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Add New Jewelry Piece</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by title, SKU, or specs..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-500"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="necklace">Necklaces & Chains</option>
                    <option value="bracelet">Bracelets & Cuffs</option>
                    <option value="ring">Rings & Bands</option>
                    <option value="earrings">Earrings & Hoops</option>
                  </select>

                  <select
                    value={productStatusFilter}
                    onChange={(e) => setProductStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Piece</th>
                          <th className="py-3 px-3">SKU</th>
                          <th className="py-3 px-3">Category</th>
                          <th className="py-3 px-3">Price</th>
                          <th className="py-3 px-3">Stock</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-10 h-10 object-cover rounded bg-stone-100 shrink-0"
                                />
                                <div>
                                  <h4 className="font-semibold text-stone-900 text-xs">
                                    {p.name}
                                  </h4>
                                  <span className="text-[10px] text-stone-500 font-serif italic">
                                    {p.nameAr || ''}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-stone-700">
                              {p.sku || p.id.toUpperCase()}
                            </td>
                            <td className="py-3 px-3 capitalize text-stone-600">
                              {p.category}
                            </td>
                            <td className="py-3 px-3 font-semibold text-stone-900 tabular-nums">
                              {formatEGP(p.price, 'en')}
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="line-through text-stone-400 text-[10px] ml-1">
                                  {formatEGP(p.originalPrice, 'en')}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                (p.stock ?? 0) <= 0
                                  ? 'bg-red-100 text-red-800'
                                  : (p.stock ?? 0) <= 5
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {p.stock ?? 0} units
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                p.status === 'published'
                                  ? 'bg-stone-900 text-white'
                                  : p.status === 'draft'
                                  ? 'bg-stone-200 text-stone-700'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {p.status || 'published'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setStockAdjustProduct(p);
                                  setStockDelta(5);
                                  setIsStockModalOpen(true);
                                }}
                                title="Adjust Stock"
                                className="p-1.5 text-stone-600 hover:text-stone-950 rounded hover:bg-stone-100 cursor-pointer"
                              >
                                <Boxes className="w-3.5 h-3.5 inline" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                title="Edit Product"
                                className="p-1.5 text-stone-600 hover:text-stone-950 rounded hover:bg-stone-100 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 inline" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                title="Delete"
                                className="p-1.5 text-stone-400 hover:text-red-700 rounded hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. INVENTORY & STOCK MANAGEMENT TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-stone-950">
                      Inventory Valuation & Movement Audit
                    </h2>
                    <p className="text-xs text-stone-500">
                      Track physical jewelry stock movements, restock shipments, and threshold warnings.
                    </p>
                  </div>
                </div>

                {/* Valuation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                    <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
                      Total Units in Stock
                    </span>
                    <span className="text-2xl font-bold font-serif text-stone-950 tabular-nums">
                      {products.reduce((acc, p) => acc + (p.stock ?? 0), 0)} Units
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                    <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
                      Inventory Retail Value
                    </span>
                    <span className="text-2xl font-bold font-serif text-stone-950 tabular-nums">
                      {formatEGP(
                        products.reduce((acc, p) => acc + (p.stock ?? 0) * p.price, 0),
                        'en'
                      )}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                    <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block mb-1">
                      Inventory Cost Valuation
                    </span>
                    <span className="text-2xl font-bold font-serif text-stone-950 tabular-nums">
                      {formatEGP(
                        products.reduce((acc, p) => acc + (p.stock ?? 0) * (p.costPrice || p.price * 0.45), 0),
                        'en'
                      )}
                    </span>
                  </div>
                </div>

                {/* Inventory Table with Quick Adjustment Button */}
                <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                      Stock Level Management
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Jewelry Piece</th>
                          <th className="py-3 px-3">SKU</th>
                          <th className="py-3 px-3">Current Stock</th>
                          <th className="py-3 px-3">Threshold</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-4 text-right">Adjust Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-stone-50/60">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img src={p.image} alt={p.name} className="w-9 h-9 object-cover rounded" />
                              <span className="font-medium text-stone-900">{p.name}</span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold">{p.sku || p.id.toUpperCase()}</td>
                            <td className="py-3 px-3 font-bold tabular-nums text-sm">{p.stock ?? 0}</td>
                            <td className="py-3 px-3 text-stone-500">5 units</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                (p.stock ?? 0) <= 0
                                  ? 'bg-red-100 text-red-800'
                                  : (p.stock ?? 0) <= 5
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {(p.stock ?? 0) <= 0 ? 'Out of Stock' : (p.stock ?? 0) <= 5 ? 'Low Stock' : 'In Stock'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setStockAdjustProduct(p);
                                  setStockDelta(10);
                                  setIsStockModalOpen(true);
                                }}
                                className="px-3 py-1 bg-stone-900 text-white rounded text-xs font-medium hover:bg-stone-800 cursor-pointer"
                              >
                                Adjust Stock
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Inventory Movements Log */}
                <div className="bg-white rounded-xl border border-stone-200 shadow-2xs p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                    Recent Stock Movement Ledger
                  </h3>
                  {inventoryLogs.length === 0 ? (
                    <p className="text-xs text-stone-400 py-3">No inventory adjustments recorded yet.</p>
                  ) : (
                    <div className="divide-y divide-stone-100 text-xs">
                      {inventoryLogs.slice(0, 10).map((log) => (
                        <div key={log.id} className="py-2.5 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-stone-900">{log.productName}</span>
                            <span className="text-stone-400 text-[11px] ml-2 font-mono">({log.sku})</span>
                            <p className="text-[11px] text-stone-500">{log.reason} · by {log.adminEmail}</p>
                          </div>
                          <div className="text-right">
                            <span className={`font-bold tabular-nums ${
                              log.quantityChange > 0 ? 'text-emerald-700' : 'text-stone-900'
                            }`}>
                              {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange} units
                            </span>
                            <span className="block text-[10px] text-stone-400">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. ORDERS MANAGEMENT TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-stone-950">
                      Customer Orders ({filteredOrders.length})
                    </h2>
                    <p className="text-xs text-stone-500">
                      Inspect order items, courier delivery statuses, payment verification, and customer details.
                    </p>
                  </div>

                  <button
                    onClick={exportOrdersCSV}
                    className="px-3.5 py-2 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Orders CSV</span>
                  </button>
                </div>

                {/* Search & Filters */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search order ID, customer name, phone..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-500"
                    />
                  </div>

                  <select
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none"
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="cod_pending">Cash on Delivery (Pending)</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>

                  <select
                    value={orderFulfillmentFilter}
                    onChange={(e) => setOrderFulfillmentFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none"
                  >
                    <option value="all">All Fulfillment Statuses</option>
                    <option value="unfulfilled">Unfulfilled</option>
                    <option value="processing">Packaging in Studio</option>
                    <option value="shipped">Out with Courier</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Orders List Table */}
                <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Order ID & Date</th>
                          <th className="py-3 px-3">Customer</th>
                          <th className="py-3 px-3">City & Address</th>
                          <th className="py-3 px-3">Payment</th>
                          <th className="py-3 px-3">Fulfillment</th>
                          <th className="py-3 px-3">Total Due</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-stone-400">
                              No orders found matching the filter.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-stone-50/60">
                              <td className="py-3 px-4">
                                <span className="font-mono font-bold text-stone-900 block">{o.id}</span>
                                <span className="text-[10px] text-stone-400">
                                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Recent'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-semibold text-stone-900 block">{o.customerName}</span>
                                <span className="text-[10px] text-stone-500">{o.phone}</span>
                              </td>
                              <td className="py-3 px-3 text-stone-600">
                                <span className="font-medium text-stone-800 block">{o.city}</span>
                                <span className="text-[10px] text-stone-400 truncate max-w-[150px] block">{o.address}</span>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  o.paymentStatus === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.paymentStatus === 'refunded'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {o.paymentStatus || 'cod_pending'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  o.fulfillmentStatus === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.fulfillmentStatus === 'shipped'
                                    ? 'bg-purple-100 text-purple-800'
                                    : o.fulfillmentStatus === 'cancelled'
                                    ? 'bg-stone-200 text-stone-700'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {o.fulfillmentStatus || 'processing'}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-bold text-stone-950 tabular-nums">
                                {formatEGP(o.total, 'en')}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => setSelectedOrder(o)}
                                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. CUSTOMER PROFILES TAB */}
            {activeTab === 'customers' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-stone-950">
                    Customer Directory ({customers.length})
                  </h2>
                  <p className="text-xs text-stone-500">
                    Verified customer profiles, accumulated loyalty Glow Points, and purchase history.
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-3">Contact</th>
                          <th className="py-3 px-3">City</th>
                          <th className="py-3 px-3">Orders</th>
                          <th className="py-3 px-3">Total Spent</th>
                          <th className="py-3 px-3">Glow Points</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {customers.map((c) => (
                          <tr key={c.id} className="hover:bg-stone-50/60">
                            <td className="py-3 px-4">
                              <span className="font-semibold text-stone-900 block">{c.name}</span>
                              <span className="text-[10px] text-stone-400">{c.email}</span>
                            </td>
                            <td className="py-3 px-3 text-stone-600 font-mono">{c.phone || 'N/A'}</td>
                            <td className="py-3 px-3 text-stone-600">{c.city || 'Cairo'}</td>
                            <td className="py-3 px-3 font-semibold">{c.totalOrders}</td>
                            <td className="py-3 px-3 font-bold text-stone-950 tabular-nums">
                              {formatEGP(c.totalSpent, 'en')}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">
                                {c.glowPoints} pts
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Anonymize customer ${c.name} per privacy request?`)) {
                                    await deleteCustomerProfile(c.id, adminEmail);
                                    notify('Customer data anonymized');
                                    await loadData();
                                  }
                                }}
                                className="text-stone-400 hover:text-red-700 text-[11px] font-medium"
                              >
                                Anonymize
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. DISCOUNTS TAB */}
            {activeTab === 'discounts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-stone-950">
                      Promo & Discount Codes
                    </h2>
                    <p className="text-xs text-stone-500">
                      Configure coupon codes, minimum spend rules, and expiry dates.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsDiscountModalOpen(true)}
                    className="px-3.5 py-2 bg-stone-950 text-white rounded text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Create Promo Code</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discounts.map((disc) => (
                    <div
                      key={disc.id}
                      className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm tracking-wider px-2.5 py-1 rounded bg-stone-900 text-amber-300">
                          {disc.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          disc.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {disc.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 space-y-1">
                        <p className="font-semibold text-stone-900 text-sm">
                          {disc.discountType === 'percentage' ? `${disc.value}% OFF` : `${disc.value} EGP OFF`}
                        </p>
                        <p>Min Purchase: {formatEGP(disc.minPurchase, 'en')}</p>
                        <p className="text-[11px] text-stone-400">
                          Expires: {new Date(disc.expiresAt).toLocaleDateString()} · Used {disc.usedCount} times
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        <button
                          onClick={async () => {
                            await toggleDiscountActive(disc.code, !disc.active, adminEmail);
                            notify(`Promo code ${disc.code} is now ${!disc.active ? 'Active' : 'Inactive'}`);
                            await loadData();
                          }}
                          className="text-xs font-semibold text-stone-700 hover:text-stone-950 cursor-pointer"
                        >
                          {disc.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. HOMEPAGE CONTENT TAB */}
            {activeTab === 'content' && homepageContent && (
              <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-stone-950">
                    Homepage Copy & Campaign Content
                  </h2>
                  <p className="text-xs text-stone-500">
                    Update the announcement bar, headline, and story without redeploying code.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-stone-800 block mb-1">
                      Top Announcement Bar (English)
                    </label>
                    <input
                      type="text"
                      value={homepageContent.announcementBar?.en || ''}
                      onChange={(e) =>
                        setHomepageContent((prev) =>
                          prev
                            ? {
                                ...prev,
                                announcementBar: { ...prev.announcementBar, en: e.target.value }
                              }
                            : null
                        )
                      }
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-800 block mb-1">
                      Top Announcement Bar (Arabic)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={homepageContent.announcementBar?.ar || ''}
                      onChange={(e) =>
                        setHomepageContent((prev) =>
                          prev
                            ? {
                                ...prev,
                                announcementBar: { ...prev.announcementBar, ar: e.target.value }
                              }
                            : null
                        )
                      }
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-stone-800 block mb-1">
                        Hero Main Headline (EN)
                      </label>
                      <input
                        type="text"
                        value={homepageContent.hero?.headlineEn || ''}
                        onChange={(e) =>
                          setHomepageContent((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  hero: { ...prev.hero, headlineEn: e.target.value }
                                }
                              : null
                          )
                        }
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-stone-800 block mb-1">
                        Hero Main Headline (AR)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={homepageContent.hero?.headlineAr || ''}
                        onChange={(e) =>
                          setHomepageContent((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  hero: { ...prev.hero, headlineAr: e.target.value }
                                }
                              : null
                          )
                        }
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-stone-800 block mb-1">
                      Hero Subtitle / Description (EN)
                    </label>
                    <textarea
                      rows={2}
                      value={homepageContent.hero?.subtitleEn || ''}
                      onChange={(e) =>
                        setHomepageContent((prev) =>
                          prev
                            ? {
                                ...prev,
                                hero: { ...prev.hero, subtitleEn: e.target.value }
                              }
                            : null
                        )
                      }
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={async () => {
                        const res = await saveHomepageContent(homepageContent, adminEmail);
                        if (res.success) {
                          notify('Homepage content saved successfully');
                          if (onProductsUpdated) onProductsUpdated();
                        } else {
                          notify('Failed to save homepage content', 'error');
                        }
                      }}
                      className="px-6 py-2.5 bg-stone-950 text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
                    >
                      Publish Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 8. SECURITY & AUDIT LOGS TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-stone-950">
                    Administrator Security & Audit Logs
                  </h2>
                  <p className="text-xs text-stone-500">
                    Authorized staff credentials and immutable operation history.
                  </p>
                </div>

                {/* Admins Table */}
                <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                    Authorized Admin Users
                  </h3>
                  <div className="divide-y divide-stone-100 text-xs">
                    {adminUsers.map((u) => (
                      <div key={u.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-stone-900">{u.name}</span>
                          <span className="text-stone-400 ml-2">({u.email})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-amber-300">
                            {u.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Trail */}
                <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                    System Audit Trail (Last 100 Actions)
                  </h3>
                  <div className="divide-y divide-stone-100 text-xs max-h-96 overflow-y-auto">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="py-2 flex items-start justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-semibold text-stone-900 text-[11px] block">
                            [{log.action}] on {log.resource}
                          </span>
                          <p className="text-[11px] text-stone-600 leading-relaxed">{log.details}</p>
                          <span className="text-[10px] text-stone-400">Actor: {log.adminEmail}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD / EDIT PRODUCT MODAL */}
      {/* ======================================================== */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-60 bg-stone-950/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-stone-300">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="font-serif font-semibold text-stone-900 text-base">
                {editingProduct.id ? 'Edit Jewelry Piece' : 'Add New Jewelry Piece'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-900" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Product Title (EN)*</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Product Title (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingProduct.nameAr || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameAr: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">SKU Identifier*</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Category*</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as JewelryCategory })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs capitalize"
                  >
                    <option value="necklace">Necklaces & Chains</option>
                    <option value="bracelet">Bracelets & Cuffs</option>
                    <option value="ring">Rings & Bands</option>
                    <option value="earrings">Earrings & Hoops</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Physical Stock*</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stock ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Retail Price (EGP)*</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Compare/Strike Price</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Cost Price (EGP)</label>
                  <input
                    type="number"
                    value={editingProduct.costPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">Image Asset URL*</label>
                <input
                  type="url"
                  required
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">Description (EN)*</label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded text-stone-900"
                  />
                  <span>Featured Collection Piece</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isBestSeller}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                    className="rounded text-stone-900"
                  />
                  <span>Mark as Best Seller</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-950 hover:bg-stone-800 text-white rounded font-semibold cursor-pointer shadow-xs"
                >
                  Save Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STOCK ADJUSTMENT MODAL */}
      {/* ======================================================== */}
      {isStockModalOpen && stockAdjustProduct && (
        <div className="fixed inset-0 z-60 bg-stone-950/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-5 border border-stone-300 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-semibold text-stone-900 text-base">
                Adjust Stock: {stockAdjustProduct.name}
              </h3>
              <button onClick={() => setIsStockModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-900" />
              </button>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-3">
              <div>
                <span className="text-stone-500 block mb-1">Current Stock Level:</span>
                <span className="text-xl font-bold font-serif text-stone-950">
                  {stockAdjustProduct.stock ?? 0} units
                </span>
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  Stock Change (+ to add, - to reduce):
                </label>
                <input
                  type="number"
                  required
                  value={stockDelta}
                  onChange={(e) => setStockDelta(Number(e.target.value))}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">Movement Reason Category:</label>
                <select
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value as InventoryMovementReason)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                >
                  <option value="restock">Studio Restock / Received Shipment</option>
                  <option value="inventory_correction">Inventory Count Correction</option>
                  <option value="damaged_goods">Damaged / Flawed Piece Removed</option>
                  <option value="sample_gift">Brand Gift / PR Sample</option>
                  <option value="return_cancellation">Customer Return</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">Internal Note / Reason:</label>
                <input
                  type="text"
                  required
                  value={stockReasonDesc}
                  onChange={(e) => setStockReasonDesc(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-950 text-white rounded font-semibold cursor-pointer shadow-xs"
                >
                  Apply Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ORDER DETAILS MODAL */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 bg-stone-950/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-stone-300">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-serif font-semibold text-stone-900 text-base">
                  Order #{selectedOrder.id}
                </h3>
                <span className="text-[11px] text-stone-500 font-mono">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ''}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-900" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Customer Contact */}
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/80 space-y-1">
                <span className="font-semibold text-stone-900 block">Recipient: {selectedOrder.customerName}</span>
                <p className="text-stone-600">Phone: {selectedOrder.phone} · Email: {selectedOrder.customerEmail || 'None'}</p>
                <p className="text-stone-600">Address: {selectedOrder.address}, {selectedOrder.city}</p>
              </div>

              {/* Status Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-stone-200">
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Payment Status:</label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => handleUpdateOrder(selectedOrder.id, { paymentStatus: e.target.value as PaymentStatus })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded font-semibold text-xs"
                  >
                    <option value="paid">Paid</option>
                    <option value="cod_pending">Cash on Delivery (Pending)</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Fulfillment Status:</label>
                  <select
                    value={selectedOrder.fulfillmentStatus}
                    onChange={(e) => handleUpdateOrder(selectedOrder.id, { fulfillmentStatus: e.target.value as FulfillmentStatus })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded font-semibold text-xs"
                  >
                    <option value="unfulfilled">Unfulfilled</option>
                    <option value="processing">Packaging in Studio</option>
                    <option value="shipped">Out for Delivery (Courier)</option>
                    <option value="delivered">Delivered Successfully</option>
                    <option value="cancelled">Cancelled (Restock)</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block">
                  Purchased Items ({selectedOrder.items?.length || 0})
                </span>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-stone-50 rounded border border-stone-200/60">
                      <div className="flex items-center gap-3">
                        {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />}
                        <div>
                          <p className="font-medium text-stone-900">{item.name}</p>
                          <p className="text-[10px] text-stone-400">
                            {item.selectedSize ? `${item.selectedSize} · ` : ''}Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold tabular-nums text-stone-900">
                        {formatEGP(item.price * item.quantity, 'en')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-3 bg-stone-900 text-stone-200 rounded-lg space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatEGP(selectedOrder.subtotal, 'en')}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>Discount:</span>
                    <span>-{formatEGP(selectedOrder.discountAmount, 'en')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Courier:</span>
                  <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : formatEGP(selectedOrder.deliveryFee, 'en')}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1.5 border-t border-stone-800 text-sm">
                  <span>Total Amount Due:</span>
                  <span>{formatEGP(selectedOrder.total, 'en')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE DISCOUNT MODAL */}
      {/* ======================================================== */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-60 bg-stone-950/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-5 border border-stone-300 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-semibold text-stone-900 text-base">
                Create Promo / Discount Code
              </h3>
              <button onClick={() => setIsDiscountModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-900" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-3">
              <div>
                <label className="font-semibold text-stone-800 block mb-1">Coupon Code*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GLOW20"
                  value={newDiscountCode.code}
                  onChange={(e) => setNewDiscountCode({ ...newDiscountCode, code: e.target.value })}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Type</label>
                  <select
                    value={newDiscountCode.discountType}
                    onChange={(e) => setNewDiscountCode({ ...newDiscountCode, discountType: e.target.value as any })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (EGP)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-800 block mb-1">Discount Value*</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newDiscountCode.value}
                    onChange={(e) => setNewDiscountCode({ ...newDiscountCode, value: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">Minimum Order Value (EGP)*</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newDiscountCode.minPurchase}
                  onChange={(e) => setNewDiscountCode({ ...newDiscountCode, minPurchase: Number(e.target.value) })}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-950 text-white rounded font-semibold cursor-pointer shadow-xs"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
