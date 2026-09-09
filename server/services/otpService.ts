import crypto from "node:crypto";

interface OtpRecord {
  hashedOtp: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

interface RequestRateRecord {
  timestamps: number[];
}

// In-memory secure state stores
const activeOtpStore = new Map<string, OtpRecord>();
const requestRateStore = new Map<string, RequestRateRecord>();

const runtimeProcess = (globalThis as typeof globalThis & {
  process?: {
    env?: Record<string, string | undefined>;
  };
}).process;

const OTP_SECRET =
  runtimeProcess?.env?.OTP_SECRET ||
  "vault_iq_secure_otp_salt_key_2026";

const MAX_HOURLY_REQUESTS = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const OTP_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Validates email format using RFC 5322 regex standard.
 */
export const isValidEmailFormat = (email: string): boolean => {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(normalized);
};

/**
 * Hashes an OTP code using SHA-256 with a secret salt.
 * Ensures raw OTP is never stored in plain text anywhere on backend/memory.
 */
export const hashOtp = (email: string, otp: string): string => {
  const normalizedEmail = email.trim().toLowerCase();
  return crypto
    .createHash("sha256")
    .update(`${normalizedEmail}:${otp}:${OTP_SECRET}`)
    .digest("hex");
};

/**
 * Generates a cryptographically secure 6-digit numeric OTP code using crypto.randomInt.
 */
export const generateCryptographicOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Enforces rate limits (maximum 5 OTP send requests per hour per email).
 */
export const checkRequestRateLimit = (email: string): { allowed: boolean; remaining: number; retryAfterSecs?: number } => {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  let record = requestRateStore.get(normalizedEmail);
  if (!record) {
    record = { timestamps: [] };
    requestRateStore.set(normalizedEmail, record);
  }

  // Filter out request timestamps older than 1 hour
  record.timestamps = record.timestamps.filter((ts) => ts > oneHourAgo);

  if (record.timestamps.length >= MAX_HOURLY_REQUESTS) {
    const oldestRequest = record.timestamps[0];
    const retryAfterSecs = Math.ceil((oldestRequest + 60 * 60 * 1000 - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSecs: Math.max(retryAfterSecs, 1),
    };
  }

  return {
    allowed: true,
    remaining: MAX_HOURLY_REQUESTS - record.timestamps.length,
  };
};

/**
 * Records a new OTP send request for rate limiting.
 */
export const registerOtpRequest = (email: string): void => {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();
  let record = requestRateStore.get(normalizedEmail);
  if (!record) {
    record = { timestamps: [] };
    requestRateStore.set(normalizedEmail, record);
  }
  record.timestamps.push(now);
};

/**
 * Stores hashed OTP for an email with a 5-minute expiration.
 * Overwrites any previous active OTP for the same email (ensures single active OTP per email).
 */
export const storeHashedOtp = (email: string, rawOtp: string): void => {
  const normalizedEmail = email.trim().toLowerCase();
  const hashed = hashOtp(normalizedEmail, rawOtp);
  const now = Date.now();

  activeOtpStore.set(normalizedEmail, {
    hashedOtp: hashed,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    createdAt: now,
  });
};

/**
 * Creates a stateless signed cryptographic token for serverless verification resilience.
 */
export const createVerificationToken = (email: string, rawOtp: string, expiresAt: number): string => {
  const normalizedEmail = email.trim().toLowerCase();
  const payload = `${normalizedEmail}:${rawOtp}:${expiresAt}:${OTP_SECRET}`;
  const hmac = crypto.createHash("sha256").update(payload).digest("hex");
  return Buffer.from(`${expiresAt}.${hmac}`).toString("base64");
};

/**
 * Verifies OTP against stateless signed token when serverless instances switch.
 */
export const verifyWithToken = (email: string, rawOtp: string, token: string): boolean => {
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const [expiresAtStr, hmac] = raw.split(".");
    const expiresAt = Number(expiresAtStr);
    if (!expiresAt || Date.now() > expiresAt) return false;
    const normalizedEmail = email.trim().toLowerCase();
    const expectedPayload = `${normalizedEmail}:${rawOtp}:${expiresAt}:${OTP_SECRET}`;
    const expectedHmac = crypto.createHash("sha256").update(expectedPayload).digest("hex");
    return hmac === expectedHmac;
  } catch (e) {
    return false;
  }
};

/**
 * Verifies user submitted OTP against hashed stored record or stateless verification token.
 * Handles single-use deletion, expiry, and attempt limits.
 */
export const verifySubmittedOtp = (
  email: string,
  userSubmittedOtp: string,
  token?: string
): { success: boolean; error?: string; remainingAttempts?: number } => {
  const normalizedEmail = email.trim().toLowerCase();
  const record = activeOtpStore.get(normalizedEmail);

  if (!record) {
    // If no in-memory record exists (e.g. serverless instance switch), verify using stateless token
    if (token && verifyWithToken(normalizedEmail, userSubmittedOtp, token)) {
      return { success: true };
    }
    return {
      success: false,
      error: "No active verification code session found for this email. Please request a new OTP.",
    };
  }

  const now = Date.now();

  // Check 5-minute expiration
  if (now > record.expiresAt) {
    activeOtpStore.delete(normalizedEmail); // Delete expired OTP
    return {
      success: false,
      error: "The verification code has expired (5-minute limit). Please request a new OTP.",
    };
  }

  // Check attempt limit
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    activeOtpStore.delete(normalizedEmail); // Delete session locked for security
    return {
      success: false,
      error: "Maximum verification attempts (5/5) exceeded. Session locked for security. Please request a new OTP.",
    };
  }

  // Hash submitted OTP for comparison
  const submittedHash = hashOtp(normalizedEmail, userSubmittedOtp);

  if (submittedHash !== record.hashedOtp) {
    // Also check token if provided
    if (token && verifyWithToken(normalizedEmail, userSubmittedOtp, token)) {
      activeOtpStore.delete(normalizedEmail);
      return { success: true };
    }

    record.attempts += 1;
    const remainingAttempts = MAX_VERIFY_ATTEMPTS - record.attempts;

    if (remainingAttempts <= 0) {
      activeOtpStore.delete(normalizedEmail);
      return {
        success: false,
        error: "Maximum verification attempts (5/5) exceeded. Session locked for security. Please request a new OTP.",
        remainingAttempts: 0,
      };
    }

    return {
      success: false,
      error: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
      remainingAttempts,
    };
  }

  // Single-use: Delete OTP immediately upon successful verification to prevent reuse
  activeOtpStore.delete(normalizedEmail);

  return {
    success: true,
  };
};

/**
 * Deletes an active OTP session manually if needed.
 */
export const clearOtpSession = (email: string): void => {
  const normalizedEmail = email.trim().toLowerCase();
  activeOtpStore.delete(normalizedEmail);
};
