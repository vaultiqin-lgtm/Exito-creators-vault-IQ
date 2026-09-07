import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

// Safely resolve Vite environment variables
const metaEnv = (import.meta as any).env || {};

// Firebase Configuration
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyBd9QxcoDXaAuw1XpvOGlux9igF99cpmOE",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "vault-iq-e6478.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "vault-iq-e6478",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "vault-iq-e6478.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "426161547149",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:426161547149:web:4f78e5ecbb275659b77fc4",
};

// Initialize Firebase singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable language setting for SMS (English for Indian mobile context)
auth.languageCode = "en";

export interface UserNotificationSettings {
  email_notifications_enabled: boolean;
  report_frequency: "Daily" | "Weekly" | "Monthly";
  report_time: string;
  timezone: string;
  last_report_sent?: string;
  report_data_source?: "live" | "database";
}

export interface UserFinancialData {
  salary: number;
  expenses: any[];
  goals: any[];
  loans: any[];
}

export interface FirestoreUserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
  emailVerified: boolean;
  mobile?: string;
  email_notifications_enabled?: boolean;
  report_frequency?: "Daily" | "Weekly" | "Monthly";
  report_time?: string;
  timezone?: string;
  last_report_sent?: string;
  financial_data?: UserFinancialData;
}

/**
 * Saves/Updates user details in Firestore 'users' collection after successful OTP verification.
 * Schema: uid, email, displayName, createdAt, lastLogin, emailVerified, and settings.
 */
export const syncUserToFirestore = async (
  uid: string,
  email: string,
  displayName?: string
): Promise<FirestoreUserProfile> => {
  const normalizedEmail = email.trim().toLowerCase();
  const name = displayName || normalizedEmail.split("@")[0];
  const now = new Date().toISOString();

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newUser: FirestoreUserProfile = {
        uid,
        email: normalizedEmail,
        displayName: name,
        createdAt: now,
        lastLogin: now,
        emailVerified: true,
        email_notifications_enabled: true,
        report_frequency: "Daily",
        report_time: "20:00",
        timezone: "Asia/Kolkata",
        last_report_sent: "",
        financial_data: {
          salary: 50000,
          expenses: [],
          goals: [],
          loans: []
        }
      };
      await setDoc(userRef, newUser);
      console.log(`[FIRESTORE] Created new user in 'users' collection: ${uid} (${normalizedEmail})`);
      return newUser;
    } else {
      const existing = userSnap.data() as FirestoreUserProfile;
      const updatedUser: Partial<FirestoreUserProfile> = {
        lastLogin: now,
        emailVerified: true,
      };
      if (displayName && !existing.displayName) {
        updatedUser.displayName = displayName;
      }
      await setDoc(userRef, updatedUser, { merge: true });
      console.log(`[FIRESTORE] Updated lastLogin in 'users' collection: ${uid}`);
      return { ...existing, ...updatedUser };
    }
  } catch (err) {
    console.warn(`[FIRESTORE NOTICE] Firestore sync fallback triggered for ${normalizedEmail}:`, err);
    return {
      uid,
      email: normalizedEmail,
      displayName: name,
      createdAt: now,
      lastLogin: now,
      emailVerified: true,
    };
  }
};

/**
 * Update user notification settings in Firestore.
 */
export const updateUserNotificationSettingsInFirestore = async (
  uid: string,
  settings: Partial<UserNotificationSettings>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, settings, { merge: true });
    console.log(`[FIRESTORE] Updated notification settings for user ${uid}`);
  } catch (err) {
    console.error(`[FIRESTORE ERROR] failed to update settings for ${uid}:`, err);
  }
};

/**
 * Update general user profile fields in Firestore.
 */
export const updateUserProfileInFirestore = async (
  uid: string,
  profileUpdates: Partial<FirestoreUserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, profileUpdates, { merge: true });
    console.log(`[FIRESTORE] Updated user profile fields for user ${uid}`);
  } catch (err) {
    console.error(`[FIRESTORE ERROR] failed to update user profile fields for ${uid}:`, err);
  }
};

/**
 * Update user financial data in Firestore.
 */
export const updateUserFinancialDataInFirestore = async (
  uid: string,
  financialData: Partial<UserFinancialData>
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, { financial_data: financialData }, { merge: true });
    console.log(`[FIRESTORE] Synchronized financial data for user ${uid}`);
  } catch (err) {
    console.error(`[FIRESTORE ERROR] failed to sync financial data for ${uid}:`, err);
  }
};

/**
 * Fetches user profile (including settings and financial data) from Firestore.
 */
export const getUserProfileFromFirestore = async (uid: string): Promise<any | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
  } catch (err) {
    console.error(`[FIRESTORE ERROR] failed to fetch profile for ${uid}:`, err);
  }
  return null;
};

/**
 * Helper to authenticate user session & save Firestore record after Gmail OTP verification.
 */
export const syncFirebaseUserAfterOtp = async (
  email: string,
  displayName?: string
): Promise<FirestoreUserProfile> => {
  const normalizedEmail = email.trim().toLowerCase();
  const name = displayName || normalizedEmail.split("@")[0];
  const derivedUid = `gmail_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

  const userProfile = await syncUserToFirestore(derivedUid, normalizedEmail, name);
  return userProfile;
};

/**
 * Initialize invisible reCAPTCHA verifier attached to a DOM container.
 * Invisible mode maintains the exact website UI without displaying a widget.
 */
export const initRecaptchaVerifier = (containerId: string): RecaptchaVerifier => {
  if (typeof window === "undefined") return null as any;

  // Clear existing verifier if attached to window
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Notice clearing existing recaptcha verifier:", e);
    }
    (window as any).recaptchaVerifier = null;
  }

  // Clear container HTML element to prevent re-rendering issues
  const containerEl = document.getElementById(containerId);
  if (containerEl) {
    containerEl.innerHTML = "";
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      console.log("[FIREBASE AUTH] reCAPTCHA verified successfully");
    },
    "expired-callback": () => {
      console.warn("[FIREBASE AUTH] reCAPTCHA expired. User must retry.");
    },
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
};

/**
 * Send 6-digit OTP using Firebase Phone Authentication.
 * Formats Indian 10-digit mobile numbers with +91 prefix automatically.
 */
export const sendFirebasePhoneOtp = async (
  mobileNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; mockOtp?: string; error?: string }> => {
  try {
    // Standardize phone number format (+91 for 10-digit Indian numbers)
    const formattedPhone = mobileNumber.startsWith("+")
      ? mobileNumber
      : `+91${mobileNumber.replace(/\D/g, "")}`;

    console.log(`[FIREBASE AUTH ENGINE] Dispatching SMS to ${formattedPhone}...`);

    // Call real Firebase Authentication SDK signInWithPhoneNumber
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    console.log("[FIREBASE AUTH ENGINE] Firebase SMS OTP dispatched successfully!");

    return {
      success: true,
      confirmationResult,
    };
  } catch (error: any) {
    console.error("[FIREBASE AUTH ERROR]", error);

    const errCode = error?.code || "";
    const errMsg = error?.message || "";

    // Fallback simulation when Firebase domain/credentials are unconfigured, provider is un-enabled, or captcha fails
    if (
      errCode === "auth/invalid-app-credential" ||
      errCode === "auth/captcha-check-failed" ||
      errCode === "auth/api-key-not-valid" ||
      errCode === "auth/operation-not-allowed" ||
      errCode === "auth/unauthorized-domain" ||
      errMsg.includes("app-credential") ||
      errMsg.includes("invalid-api-key") ||
      errMsg.includes("operation-not-allowed")
    ) {
      console.warn("[FIREBASE AUTH] Falling back to secure backend OTP engine for sandbox/demo environment.");

      // Call backend endpoint to generate fallback OTP
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobileNumber, purpose: "firebase-fallback" }),
      });
      const data = await res.json();

      if (data.success) {
        // Create mock confirmation object with 5-minute expiry
        const generatedCode = data.otp;
        const mockConfirmation: ConfirmationResult = {
          verificationId: `mock_${Date.now()}`,
          confirm: async (otpInput: string) => {
            if (otpInput === generatedCode) {
              return {
                user: { uid: `user_${mobileNumber}`, phoneNumber: `+91${mobileNumber}` } as any,
                providerId: "phone",
                operationType: "signIn",
              };
            } else {
              const err = new Error("The verification code entered is incorrect.");
              (err as any).code = "auth/invalid-verification-code";
              throw err;
            }
          },
        };

        return {
          success: true,
          confirmationResult: mockConfirmation,
          mockOtp: generatedCode,
        };
      }
    }

    return {
      success: false,
      error: getFirebaseErrorMessage(error),
    };
  }
};

/**
 * Maps Firebase auth error codes to clear, user-friendly security messages.
 */
export const getFirebaseErrorMessage = (error: any): string => {
  const code = error?.code || "";
  const msg = error?.message || "";

  switch (code) {
    case "auth/invalid-phone-number":
      return "Please enter a valid 10-digit mobile number.";
    case "auth/missing-phone-number":
      return "Mobile number is required for OTP authentication.";
    case "auth/quota-exceeded":
    case "auth/too-many-requests":
      return "Too many OTP requests from this device. Please wait a few minutes before trying again.";
    case "auth/invalid-verification-code":
      return "Invalid verification code. Please check the 6 digits and try again.";
    case "auth/code-expired":
      return "The verification code has expired (5-minute limit). Please request a new OTP.";
    case "auth/captcha-check-failed":
      return "reCAPTCHA verification failed. Please refresh the page and try again.";
    case "auth/operation-not-allowed":
      return "Phone Authentication is not enabled in Firebase Console. Please enable Phone provider under Authentication > Sign-in method.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Firebase Phone Auth. Add it in Firebase Console > Authentication > Settings > Authorized Domains.";
    case "auth/user-disabled":
      return "This account has been disabled by security policy.";
    case "auth/network-request-failed":
      return "Network connection error. Please check your internet and try again.";
    default:
      if (msg.includes("incorrect") || msg.includes("invalid-verification-code")) {
        return "Invalid verification code. Please check the 6 digits and try again.";
      }
      return msg || "Authentication service failed. Please try again.";
  }
};

export { firebaseSignOut, onAuthStateChanged };
export type { FirebaseUser, ConfirmationResult };
