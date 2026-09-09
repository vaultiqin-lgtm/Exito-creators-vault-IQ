/**
 * Frontend Auth API Service
 * Handles API calls to backend Express routes for sending, resending, and verifying Gmail OTPs.
 */

let currentVerificationToken = "";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  token?: string;
  resendCooldownSeconds?: number;
  expiresInSeconds?: number;
  remainingAttempts?: number;
}

/**
 * Request backend to generate 6-digit OTP and deliver to specified Gmail address.
 */
export const requestGmailOtp = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await fetch("/api/auth/send-gmail-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (data.token) {
      currentVerificationToken = data.token;
    }
    return data;
  } catch (err: any) {
    console.error("[AUTH SERVICE API ERROR]", err);
    return {
      success: false,
      error: "Network error: Unable to connect to Vault IQ backend. Please check your connection.",
    };
  }
};

/**
 * Request backend to resend 6-digit OTP with a 60-second cooldown requirement.
 */
export const resendGmailOtp = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await fetch("/api/auth/resend-gmail-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (data.token) {
      currentVerificationToken = data.token;
    }
    return data;
  } catch (err: any) {
    console.error("[AUTH SERVICE API ERROR]", err);
    return {
      success: false,
      error: "Network error: Unable to connect to backend server.",
    };
  }
};

/**
 * Verify 6-digit OTP code against backend SHA-256 stored hash or stateless token.
 */
export const verifyGmailOtp = async (email: string, otp: string, token?: string): Promise<ApiResponse> => {
  try {
    const response = await fetch("/api/auth/verify-gmail-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, token: token || currentVerificationToken }),
    });

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error("[AUTH SERVICE API ERROR]", err);
    return {
      success: false,
      error: "Network error: Unable to verify OTP with backend server.",
    };
  }
};
