import emailjs from '@emailjs/browser';
import { BRAND_CONFIG } from '../data/products';

export interface EmailJsOrderItem {
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
}

export interface EmailJsOrderData {
  orderId: string;
  orderDate?: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: string;
  items: EmailJsOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  bundleType?: string;
  glowPointsEarned?: number;
  glowPointsDiscount?: number;
}

export interface EmailJsSendResult {
  success: boolean;
  message?: string;
  status?: number;
  error?: any;
}

/**
 * Checks if EmailJS environment variables are configured.
 */
export function isEmailJsConfigured(): boolean {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  return Boolean(serviceId && templateId && publicKey);
}

/**
 * Formats currency in Egyptian Pounds (EGP)
 */
function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('en-US')} ${BRAND_CONFIG.currency}`;
}

/**
 * Formats order items into a clean textual summary for EmailJS email templates.
 */
function formatItemsText(items: EmailJsOrderItem[]): string {
  return items
    .map((item, index) => {
      const sizeStr = item.selectedSize ? ` (Size: ${item.selectedSize})` : '';
      return `${index + 1}. ${item.name}${sizeStr} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`;
    })
    .join('\n');
}

/**
 * Formats order items into an HTML table snippet if the template uses {{{items_html}}}.
 */
function formatItemsHtml(items: EmailJsOrderItem[]): string {
  const rows = items
    .map(item => {
      const sizeStr = item.selectedSize ? `<br/><span style="color:#78716c;font-size:12px;">Size: ${item.selectedSize}</span>` : '';
      return `
        <tr style="border-bottom: 1px solid #e7e5e4;">
          <td style="padding: 10px 8px; font-size: 13px; color: #1c1917;">
            <strong>${item.name}</strong>${sizeStr}
          </td>
          <td style="padding: 10px 8px; font-size: 13px; color: #44403c; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px 8px; font-size: 13px; color: #1c1917; text-align: right; font-weight: 600;">
            ${formatCurrency(item.price * item.quantity)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <thead>
        <tr style="background-color: #f5f5f4; border-bottom: 1px solid #d6d3d1;">
          <th style="padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #57534e;">Item</th>
          <th style="padding: 8px; text-align: center; font-size: 11px; text-transform: uppercase; color: #57534e;">Qty</th>
          <th style="padding: 8px; text-align: right; font-size: 11px; text-transform: uppercase; color: #57534e;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/**
 * Sends an order confirmation and itemized receipt email using EmailJS directly from the browser.
 * Compatible with static GitHub Pages hosting (no backend required).
 */
export async function sendOrderReceiptViaEmailJS(order: EmailJsOrderData): Promise<EmailJsSendResult> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

  const orderDateStr = order.orderDate || new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const itemsSummary = formatItemsText(order.items);
  const itemsHtml = formatItemsHtml(order.items);

  // Standardized template parameters matching standard EmailJS ecommerce receipt templates
  const templateParams: Record<string, any> = {
    // Order Identifiers
    order_id: order.orderId,
    order_number: order.orderId,
    order_date: orderDateStr,

    // Recipient & Customer Details
    to_name: order.customerName,
    customer_name: order.customerName,
    to_email: order.customerEmail,
    customer_email: order.customerEmail,
    customer_phone: order.phone,
    phone: order.phone,
    delivery_address: `${order.address}, ${order.city}`,
    address: order.address,
    city: order.city,

    // Financial Breakdown
    items_summary: itemsSummary,
    items_html: itemsHtml,
    subtotal: formatCurrency(order.subtotal),
    discount: order.discount > 0 ? `-${formatCurrency(order.discount)}` : '0 EGP',
    delivery_fee: order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee),
    shipping: order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee),
    total: formatCurrency(order.total),
    total_amount: formatCurrency(order.total),
    currency: BRAND_CONFIG.currency,
    payment_method: order.paymentMethod,

    // Loyalty & Brand
    bundle_type: order.bundleType || 'Standard',
    glow_points_earned: order.glowPointsEarned || 0,
    brand_name: BRAND_CONFIG.name,
    store_email: 'thetateglow@gmail.com'
  };

  if (!serviceId || !templateId || !publicKey) {
    console.info(
      `[EmailJS] Notification: VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, or VITE_EMAILJS_PUBLIC_KEY is not configured in .env. ` +
      `The order #${order.orderId} was saved to Firestore. Add EmailJS variables to enable live client-side receipt emails on GitHub Pages.`
    );
    return {
      success: true,
      message: 'EmailJS credentials not configured; order confirmed and logged.'
    };
  }

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.info(`[EmailJS] Order receipt sent successfully for #${order.orderId}:`, response.status, response.text);
    return {
      success: true,
      status: response.status,
      message: response.text
    };
  } catch (err: any) {
    console.warn(`[EmailJS] Failed to send order receipt email for #${order.orderId}:`, err);
    return {
      success: false,
      error: err,
      message: err?.text || err?.message || 'EmailJS dispatch encountered an error'
    };
  }
}
