import { getAccessToken } from './firebaseAuth';
import { CartItem } from '../types/jewelry';
import { formatEGP } from '../utils/pricing';

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  bundleType?: string;
  glowPointsEarned?: number;
  glowPointsDiscount?: number;
  newPointsBalance?: number;
}

/**
 * Encodes a string into Base64URL without padding, RFC 4648 §5 compliant.
 */
function toBase64Url(str: string): string {
  // UTF-8 safe base64 encoding in browser
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.byteLength; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Get current authenticated user's Gmail profile
 */
export async function getGmailProfile(): Promise<GmailProfile> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated. Please sign in with Google.');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch profile (${res.status})`);
  }

  return res.json();
}

/**
 * Send an email using Gmail API
 */
export async function sendEmail({
  to,
  subject,
  bodyHtml,
  bodyText,
}: {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
}): Promise<{ id: string; threadId: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated. Please sign in with Google.');

  // RFC 2822 formatting
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const plainText = bodyText || bodyHtml.replace(/<[^>]+>/g, ' ');

  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
  const rawEmail = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    plainText,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyHtml,
    '',
    `--${boundary}--`,
  ].join('\r\n');

  const encoded = toBase64Url(rawEmail);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to send email (${res.status})`);
  }

  return res.json();
}

/**
 * List recent messages
 */
export async function listRecentMessages(query = '', maxResults = 5): Promise<GmailMessageSummary[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated.');

  const params = new URLSearchParams({
    maxResults: String(maxResults),
  });
  if (query) params.append('q', query);

  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to list messages (${res.status})`);
  }

  const data = await res.json();
  if (!data.messages || !Array.isArray(data.messages)) {
    return [];
  }

  // Fetch snippets & headers for the messages
  const detailed = await Promise.all(
    data.messages.slice(0, maxResults).map(async (msg: { id: string; threadId: string }) => {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!msgRes.ok) return { id: msg.id, threadId: msg.threadId };
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers || [];
        const subject = headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === 'from')?.value || '';
        const date = headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === 'date')?.value || '';
        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: msgData.snippet,
          subject,
          from,
          date,
        };
      } catch {
        return { id: msg.id, threadId: msg.threadId };
      }
    })
  );

  return detailed;
}

export const STORE_NOTIFICATION_EMAIL = 'thetateglow@gmail.com';

/**
 * Format and send an Order Confirmation & Notification email via Gmail
 * Sends merchant notification to thetateglow@gmail.com and customer receipt
 */
export async function sendOrderConfirmationEmail(order: OrderEmailData): Promise<{ id: string; threadId: string }> {
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0ede8;">
            <div style="font-weight: 600; color: #1c1917; font-size: 14px;">${item.product.name}</div>
            <div style="font-size: 12px; color: #78716c;">
              ${item.selectedSize ? `Size: ${item.selectedSize} · ` : ''}Pure Stainless Steel · Qty: ${item.quantity}
            </div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0ede8; text-align: right; font-weight: 600; color: #1c1917; font-size: 14px;">
            ${formatEGP(item.product.price * item.quantity)}
          </td>
        </tr>
      `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf9; margin: 0; padding: 24px; color: #1c1917; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e7e5e4; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .logo { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; color: #1c1917; text-align: center; }
        .slogan { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #92400e; text-align: center; margin-top: 4px; font-weight: 600; }
        .badge { display: inline-block; background: #fef3c7; color: #78350f; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; }
        .section-title { font-size: 12px; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 24px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">The Taté Glow</div>
        <div class="slogan">Your Daily Dose of Glow</div>
        <div style="text-align: center; margin: 20px 0 12px;">
          <span class="badge">Pure Stainless Steel · Order Confirmed</span>
        </div>
        
        <h2 style="font-size: 20px; font-weight: 600; text-align: center; margin: 8px 0 24px;">Order Confirmed: ${order.orderId}</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #57534e; text-align: center; margin-bottom: 24px;">
          Customer: <strong>${order.customerName}</strong> (${order.phone})<br/>
          Destination: ${order.city}, ${order.address}
        </p>

        <div style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="font-size: 13px; color: #78716c;">Order Reference:</div>
          <div style="font-size: 16px; font-weight: 700; color: #1c1917; font-family: monospace;">${order.orderId}</div>
          <div style="margin-top: 8px; font-size: 13px; color: #78716c;">Payment Method: <strong style="color: #1c1917;">${order.paymentMethod}</strong></div>
          ${
            order.paymentMethod.toLowerCase().includes('cash on delivery') || order.paymentMethod.includes('الدفع عند الاستلام')
              ? `
            <div style="margin-top: 12px; padding: 10px 14px; background: #fefce8; border: 1px solid #fde047; border-radius: 6px; font-size: 13px; color: #854d0e; line-height: 1.4;">
              💵 <strong>Cash on Delivery (Full Total Due):</strong> The courier must collect the <strong>Total Amount of ${formatEGP(order.total)}</strong> in cash upon delivery (includes all jewelry items and delivery fee).
            </div>
          `
              : ''
          }
        </div>

        <div class="section-title">Order Details</div>
        <table>
          ${itemsHtml}
        </table>

        <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #f5f5f4;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #78716c; margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span>${formatEGP(order.subtotal)}</span>
          </div>
          ${
            order.discount > 0
              ? `
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #15803d; font-weight: 600; margin-bottom: 6px;">
              <span>Bundle Discount (${order.bundleType || 'Active Offer'}):</span>
              <span>-${formatEGP(order.discount)}</span>
            </div>
          `
              : ''
          }
          ${
            order.glowPointsDiscount && order.glowPointsDiscount > 0
              ? `
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #b45309; font-weight: 600; margin-bottom: 6px;">
              <span>Glow Points Redeemed:</span>
              <span>-${formatEGP(order.glowPointsDiscount)}</span>
            </div>
          `
              : ''
          }
          <div style="display: flex; justify-content: space-between; font-size: 13px; color: #78716c; margin-bottom: 8px;">
            <span>Delivery:</span>
            <span>${order.deliveryFee === 0 ? 'FREE' : formatEGP(order.deliveryFee)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #1c1917; padding-top: 8px; border-top: 1px dashed #e7e5e4;">
            <span>Total:</span>
            <span>${formatEGP(order.total)}</span>
          </div>
          ${
            order.glowPointsEarned !== undefined
              ? `
            <div style="margin-top: 12px; padding: 10px 14px; background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #854d0e;">
              <span>✨ <strong>Glow Points Earned:</strong></span>
              <span style="font-weight: 700; color: #713f12;">+${order.glowPointsEarned.toLocaleString()} Points ${order.newPointsBalance !== undefined ? `(New Balance: ${order.newPointsBalance.toLocaleString()})` : ''}</span>
            </div>
          `
              : ''
          }
        </div>

        <div class="section-title">Delivery Address & Contact</div>
        <p style="font-size: 13px; line-height: 1.5; color: #44403c; margin: 0;">
          <strong>${order.customerName}</strong><br>
          ${order.address}, ${order.city}<br>
          Phone: ${order.phone}<br>
          ${order.customerEmail ? `Email: ${order.customerEmail}` : ''}
        </p>

        <div style="margin-top: 32px; padding: 16px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; font-size: 12px; color: #92400e; line-height: 1.5;">
          <strong>Pure Steel Promise:</strong> 100% waterproof, perfume-safe, and shower-proof. No tarnishing, zero upkeep needed.
        </div>

        <div style="margin-top: 32px; text-align: center; font-size: 11px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 20px;">
          The Taté Glow · Pure Stainless Steel Jewelry · thetateglow@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Send immediate order notification to thetateglow@gmail.com
  const storeRes = await sendEmail({
    to: STORE_NOTIFICATION_EMAIL,
    subject: `🔔 New Order Confirmed #${order.orderId} - ${order.customerName} (${formatEGP(order.total)})`,
    bodyHtml: html,
  });

  // 2. Also send confirmation receipt to customer if they provided an email distinct from store
  if (order.customerEmail && order.customerEmail.toLowerCase() !== STORE_NOTIFICATION_EMAIL.toLowerCase()) {
    try {
      await sendEmail({
        to: order.customerEmail,
        subject: `Your Taté Glow Order Confirmation #${order.orderId}`,
        bodyHtml: html,
      });
    } catch (err) {
      console.warn('Customer confirmation copy failed to send:', err);
    }
  }

  return storeRes;
}
