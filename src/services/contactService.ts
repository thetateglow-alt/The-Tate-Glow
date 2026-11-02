import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseAuth';
import emailjs from '@emailjs/browser';
import { BRAND_CONFIG } from '../data/products';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSubmissionResult {
  success: boolean;
  inquiryId?: string;
  error?: string;
  emailDispatched?: boolean;
}

/**
 * Validates the contact form fields.
 */
export function validateContactForm(data: ContactFormData): { isValid: boolean; errors: Partial<Record<keyof ContactFormData, string>> } {
  const errors: Partial<Record<keyof ContactFormData, string>> = {};

  if (!data.name.trim()) {
    errors.name = 'Full name is required.';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Please enter a valid full name.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!data.subject.trim()) {
    errors.subject = 'Subject is required.';
  } else if (data.subject.trim().length < 3) {
    errors.subject = 'Subject should be at least 3 characters.';
  }

  if (!data.message.trim()) {
    errors.message = 'Message cannot be empty.';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Please provide a message with at least 10 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Submits contact inquiry to Firestore collection `contact_inquiries`
 * and sends an EmailJS notification if credentials are configured.
 */
export async function submitContactInquiry(data: ContactFormData): Promise<ContactSubmissionResult> {
  const validation = validateContactForm(data);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0] || 'Please complete all required fields.';
    return {
      success: false,
      error: firstError
    };
  }

  try {
    // 1. Store inquiry securely in Firestore
    const inquiriesRef = collection(db, 'contact_inquiries');
    const docRef = await addDoc(inquiriesRef, {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      status: 'new',
      brand: BRAND_CONFIG.name,
      createdAt: serverTimestamp(),
      submittedAtIso: new Date().toISOString()
    });

    // 2. Dispatch email notification via EmailJS if configured
    let emailDispatched = false;
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (serviceId && templateId && publicKey) {
      try {
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: data.name.trim(),
            customer_name: data.name.trim(),
            from_email: data.email.trim(),
            customer_email: data.email.trim(),
            subject: data.subject.trim(),
            message: data.message.trim(),
            brand_name: BRAND_CONFIG.name,
            inquiry_id: docRef.id,
            to_email: 'thetateglow@gmail.com',
            date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
          },
          publicKey
        );
        emailDispatched = true;
      } catch (emailErr) {
        console.warn('[ContactService] EmailJS dispatch note:', emailErr);
      }
    }

    return {
      success: true,
      inquiryId: docRef.id,
      emailDispatched
    };
  } catch (err: any) {
    console.error('[ContactService] Submission failed:', err);
    return {
      success: false,
      error: err?.message || 'Unable to submit your inquiry at this moment. Please email us directly.'
    };
  }
}

export interface ContactInquiryRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  brand?: string;
  submittedAtIso?: string;
}

/**
 * Fetches contact inquiries from Firestore for admin overview.
 */
export async function fetchContactInquiries(): Promise<ContactInquiryRecord[]> {
  try {
    const { getDocs, query, orderBy, limit } = await import('firebase/firestore');
    const inquiriesRef = collection(db, 'contact_inquiries');
    const q = query(inquiriesRef, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        subject: data.subject || '',
        message: data.message || '',
        status: data.status || 'new',
        brand: data.brand || '',
        submittedAtIso: data.submittedAtIso || ''
      };
    });
  } catch (err) {
    console.warn('[ContactService] Error fetching inquiries:', err);
    return [];
  }
}

