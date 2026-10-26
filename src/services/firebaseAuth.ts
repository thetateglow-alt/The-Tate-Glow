import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signInAnonymously,
  linkWithCredential,
  linkWithPopup,
  EmailAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

export const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
  'https://www.googleapis.com/auth/gmail.addons.current.message.action',
  'https://www.googleapis.com/auth/gmail.addons.current.message.metadata',
  'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
];

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();
GMAIL_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory (never localStorage per guidelines).
let cachedAccessToken: string | null = null;

/**
 * Creates or updates the user's profile document in the 'users' collection in Firestore.
 */
export async function syncUserProfile(user: User, isGuestOverride?: boolean): Promise<UserProfileData> {
  const isGuest = isGuestOverride !== undefined ? isGuestOverride : Boolean(user.isAnonymous);
  const nowIso = new Date().toISOString();
  const userRef = doc(db, 'users', user.uid);

  try {
    const existingSnap = await getDoc(userRef);
    let profileData: UserProfileData;

    if (existingSnap.exists()) {
      const current = existingSnap.data() as UserProfileData;
      profileData = {
        uid: user.uid,
        name: user.displayName || current.name || (isGuest ? 'Guest' : 'Customer'),
        email: user.email || current.email || '',
        photoURL: user.photoURL || current.photoURL || '',
        isGuest,
        createdAt: current.createdAt || nowIso,
        updatedAt: nowIso,
      };
      await setDoc(userRef, profileData, { merge: true });
    } else {
      profileData = {
        uid: user.uid,
        name: user.displayName || (isGuest ? 'Guest Shopper' : 'Customer'),
        email: user.email || '',
        photoURL: user.photoURL || '',
        isGuest,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      await setDoc(userRef, profileData);
    }

    return profileData;
  } catch (err) {
    console.warn('[Firestore] Note syncing user profile document:', err);
    return {
      uid: user.uid,
      name: user.displayName || (isGuest ? 'Guest Shopper' : 'Customer'),
      email: user.email || '',
      photoURL: user.photoURL || '',
      isGuest,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  }
}

/**
 * Migrates local guest orders and caches to a new registered account upon linking.
 */
export function migrateGuestOrdersToUser(newUserUid: string) {
  try {
    const guestOrdersRaw = localStorage.getItem('tate_glow_orders_guest');
    if (guestOrdersRaw) {
      const guestOrders = JSON.parse(guestOrdersRaw);
      const userKey = `tate_glow_orders_${newUserUid}`;
      const existingUserOrdersRaw = localStorage.getItem(userKey);
      const existingUserOrders = existingUserOrdersRaw ? JSON.parse(existingUserOrdersRaw) : [];

      const merged = [...guestOrders, ...existingUserOrders];
      const unique = Array.from(new Map(merged.map((o: any) => [o.id, o])).values());
      localStorage.setItem(userKey, JSON.stringify(unique));
    }
  } catch (err) {
    console.warn('Guest orders migration note:', err);
  }
}

/**
 * Initialize auth state listener and handle potential redirect result.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Check if returning from a redirect sign in
  getRedirectResult(auth)
    .then(async (result) => {
      if (result?.user) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          cachedAccessToken = credential.accessToken;
        }
        await syncUserProfile(result.user, false);
      }
    })
    .catch((err) => {
      console.warn('Redirect auth check note:', err);
    });

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // Sync user profile in background
      syncUserProfile(user).catch(() => {});
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken || '');
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Signs in with Google using signInWithPopup, falling back to signInWithRedirect if blocked.
 * If the current user is an anonymous guest, links the account so orders/cart carry over!
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const currentUser = auth.currentUser;

    let user: User;
    let token = '';

    // If currently an anonymous guest, link with Google!
    if (currentUser && currentUser.isAnonymous) {
      try {
        const linkResult = await linkWithPopup(currentUser, googleProvider);
        user = linkResult.user;
        const cred = GoogleAuthProvider.credentialFromResult(linkResult);
        token = cred?.accessToken || '';
        migrateGuestOrdersToUser(user.uid);
      } catch (linkErr: any) {
        // If the Google account is already linked to another user, sign in to that account directly
        if (linkErr.code === 'auth/credential-already-in-use' || linkErr.code === 'auth/email-already-in-use') {
          const result = await signInWithPopup(auth, googleProvider);
          user = result.user;
          const cred = GoogleAuthProvider.credentialFromResult(result);
          token = cred?.accessToken || '';
          migrateGuestOrdersToUser(user.uid);
        } else if (linkErr.code === 'auth/popup-blocked') {
          await signInWithRedirect(auth, googleProvider);
          return null;
        } else {
          throw linkErr;
        }
      }
    } else {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        user = result.user;
        const credential = GoogleAuthProvider.credentialFromResult(result);
        token = credential?.accessToken || '';
      } catch (popupErr: any) {
        if (popupErr.code === 'auth/popup-blocked') {
          console.info('[Auth] Popup blocked by browser; falling back to redirect flow.');
          await signInWithRedirect(auth, googleProvider);
          return null;
        }
        throw popupErr;
      }
    }

    cachedAccessToken = token;
    await syncUserProfile(user, false);
    return { user, accessToken: token };
  } catch (error: unknown) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign in with Email and Password.
 * If the current session is anonymous, attempts to link or sign in and preserve local guest data.
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const currentUser = auth.currentUser;

  if (currentUser && currentUser.isAnonymous) {
    try {
      const cred = EmailAuthProvider.credential(cleanEmail, pass);
      const linkResult = await linkWithCredential(currentUser, cred);
      migrateGuestOrdersToUser(linkResult.user.uid);
      await syncUserProfile(linkResult.user, false);
      return linkResult.user;
    } catch (linkErr: any) {
      if (linkErr.code === 'auth/credential-already-in-use' || linkErr.code === 'auth/email-already-in-use') {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        migrateGuestOrdersToUser(res.user.uid);
        await syncUserProfile(res.user, false);
        return res.user;
      }
      throw linkErr;
    }
  }

  const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  await syncUserProfile(res.user, false);
  return res.user;
}

/**
 * Sign up with Email, Password, and Display Name.
 * If currently anonymous, links the account to preserve cart and guest orders.
 */
export async function signUpWithEmail(email: string, pass: string, displayName: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = displayName.trim() || 'Customer';
  const currentUser = auth.currentUser;

  if (currentUser && currentUser.isAnonymous) {
    try {
      const cred = EmailAuthProvider.credential(cleanEmail, pass);
      const linkResult = await linkWithCredential(currentUser, cred);
      await updateProfile(linkResult.user, { displayName: cleanName });
      migrateGuestOrdersToUser(linkResult.user.uid);
      await syncUserProfile(linkResult.user, false);
      return linkResult.user;
    } catch (linkErr: any) {
      if (linkErr.code !== 'auth/credential-already-in-use' && linkErr.code !== 'auth/email-already-in-use') {
        throw linkErr;
      }
      // If already in use, fall back to standard create/sign in
    }
  }

  const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  await updateProfile(res.user, { displayName: cleanName });
  await syncUserProfile(res.user, false);
  return res.user;
}

/**
 * Signs in anonymously as a guest shopper.
 * Allows browsing, adding to cart, and placing orders with zero friction.
 */
export async function continueAsGuest(): Promise<User> {
  const res = await signInAnonymously(auth);
  await syncUserProfile(res.user, true);
  return res.user;
}

/**
 * Sends a password reset email to the specified address.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, cleanEmail);
}

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Sends a Firebase verification email to the signed-in user.
 */
export const sendVerificationEmail = async (user?: User | null): Promise<void> => {
  const targetUser = user || auth.currentUser;
  if (!targetUser) {
    throw new Error('No user is currently signed in to receive a verification email.');
  }
  await sendEmailVerification(targetUser);
};

/**
 * Reloads the current user's profile to retrieve refreshed token/emailVerified state.
 */
export const reloadCurrentUser = async (user?: User | null): Promise<User | null> => {
  const targetUser = user || auth.currentUser;
  if (targetUser) {
    await targetUser.reload();
    return auth.currentUser;
  }
  return null;
};

/**
 * Translates Firebase Auth error codes into clean, user-friendly messages.
 */
export function formatAuthError(err: any, lang: 'en' | 'ar' = 'en'): string {
  const code = err?.code || '';

  const messages: Record<string, { en: string; ar: string }> = {
    'auth/invalid-credential': {
      en: 'Incorrect email or password. Please verify your credentials.',
      ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مجدداً.',
    },
    'auth/wrong-password': {
      en: 'Incorrect password. Please try again or reset your password.',
      ar: 'كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى أو استعادة كلمة المرور.',
    },
    'auth/user-not-found': {
      en: 'No account found with this email. Please check the spelling or sign up.',
      ar: 'لا يوجد حساب مسجل بهذا البريد. يرجى التحقق أو إنشاء حساب جديد.',
    },
    'auth/email-already-in-use': {
      en: 'An account with this email already exists. Please sign in instead.',
      ar: 'هذا البريد مسجل مسبقاً. يرجى تسجيل الدخول بدلاً من ذلك.',
    },
    'auth/weak-password': {
      en: 'Password should be at least 6 characters long.',
      ar: 'يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل.',
    },
    'auth/invalid-email': {
      en: 'Please enter a valid email address.',
      ar: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
    },
    'auth/popup-closed-by-user': {
      en: 'Sign-in window was closed before completion. Please try again.',
      ar: 'تم إغلاق نافذة تسجيل الدخول قبل اكتمالها. يرجى المحاولة مرة أخرى.',
    },
    'auth/cancelled-popup-request': {
      en: 'Sign-in was cancelled. Please try again.',
      ar: 'تم إلغاء عملية تسجيل الدخول. يرجى المحاولة مجدداً.',
    },
    'auth/popup-blocked': {
      en: 'Pop-up was blocked by your browser. Please allow pop-ups for this site.',
      ar: 'تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة.',
    },
    'auth/network-request-failed': {
      en: 'Network connection issue. Please check your internet connection.',
      ar: 'تعذر الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة ثانية.',
    },
    'auth/too-many-requests': {
      en: 'Too many attempts. Access to this account has been temporarily disabled. Reset your password or try later.',
      ar: 'محاولات كثيرة جداً. تم تعطيل المحاولة مؤقتاً لحماية حسابك. حاول لاحقاً.',
    },
    'auth/credential-already-in-use': {
      en: 'This credential is already linked to another existing account.',
      ar: 'بيانات الاعتماد هذه مرتبطة مسبقاً بحساب آخر.',
    },
    'auth/operation-not-allowed': {
      en: 'This sign-in provider is not enabled in Firebase Authentication.',
      ar: 'طريقة تسجيل الدخول هذه غير مفعلة في إعدادات فايربيس.',
    },
  };

  if (code && messages[code]) {
    return messages[code][lang];
  }

  return err?.message || (lang === 'ar' ? 'حدث خطأ غير متوقع. يرجى المحاولة ثانية.' : 'An unexpected error occurred. Please try again.');
}
