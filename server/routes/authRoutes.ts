import express from "express";
import {
  isValidEmailFormat,
  checkRequestRateLimit,
  registerOtpRequest,
  generateCryptographicOtp,
  storeHashedOtp,
  verifySubmittedOtp,
  createVerificationToken,
} from "../services/otpService.js";
import { sendOtpEmail } from "../services/emailService.js";

const router = express.Router();

// Cooldown tracking map (60 seconds between resends per email)
const resendCooldownMap = new Map<string, number>();

/**
 * POST /api/auth/send-gmail-otp
 * Validates email format, enforces 5/hr rate limit, generates 6-digit OTP,
 * hashes & stores OTP securely, and sends HTML email via Nodemailer.
 * 
 * CRITICAL SECURITY REQUIREMENT: OTP IS NEVER DISPLAYED OR RETURNED IN API RESPONSE.
 */
router.post("/send-gmail-otp", async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmailFormat(email)) {
      res.status(400).json({
        success: false,
        error: "Please enter a valid Gmail / email address (e.g. user@gmail.com).",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check hourly rate limit (Max 5 requests per hour)
    const rateCheck = checkRequestRateLimit(normalizedEmail);
    if (!rateCheck.allowed) {
      const minutesLeft = Math.ceil((rateCheck.retryAfterSecs || 3600) / 60);
      res.status(429).json({
        success: false,
        error: `Rate limit exceeded (maximum 5 OTP requests per hour per email). Please try again in ${minutesLeft} minute(s).`,
      });
      return;
    }

    // Generate secure random 6-digit OTP
    const rawOtp = generateCryptographicOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Store hashed OTP in memory (5-minute expiration, max 1 active per email)
    storeHashedOtp(normalizedEmail, rawOtp);
    const verificationToken = createVerificationToken(normalizedEmail, rawOtp, expiresAt);

    // Register request timestamp for rate limiting
    registerOtpRequest(normalizedEmail);
    resendCooldownMap.set(normalizedEmail, Date.now());

    // Deliver REAL OTP via Nodemailer email service to Gmail inbox
    const emailResult = await sendOtpEmail(normalizedEmail, rawOtp);

    if (!emailResult.success) {
      res.status(500).json({
        success: false,
        error: emailResult.error || "Failed to deliver OTP to your Gmail address. Please verify your email.",
      });
      return;
    }

    console.log(`[AUTH ROUTE] Successfully generated & sent Gmail OTP to ${normalizedEmail}. (Raw OTP excluded from HTTP response for security).`);

    // SECURE RESPONSE: Return metadata & stateless verification token (never raw OTP)
    res.json({
      success: true,
      message: `A secure 6-digit OTP has been sent to ${normalizedEmail}. Please check your inbox or spam folder.`,
      expiresInSeconds: 300,
      resendCooldownSeconds: 60,
      token: verificationToken,
    });
  } catch (err: any) {
    console.error("[AUTH ROUTE ERROR /send-gmail-otp]", err);
    res.status(500).json({
      success: false,
      error: "An unexpected internal server error occurred while processing OTP dispatch.",
    });
  }
});

/**
 * POST /api/auth/resend-gmail-otp
 * Resends OTP code while enforcing a 60-second cooldown period.
 */
router.post("/resend-gmail-otp", async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmailFormat(email)) {
      res.status(400).json({
        success: false,
        error: "Please enter a valid Gmail / email address.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const lastSentTime = resendCooldownMap.get(normalizedEmail) || 0;
    const elapsedSecs = Math.floor((Date.now() - lastSentTime) / 1000);

    // Enforce 60-second cooldown
    if (elapsedSecs < 60) {
      const waitSecs = 60 - elapsedSecs;
      res.status(429).json({
        success: false,
        error: `Please wait ${waitSecs} second(s) before requesting a new OTP.`,
      });
      return;
    }

    // Check hourly rate limit
    const rateCheck = checkRequestRateLimit(normalizedEmail);
    if (!rateCheck.allowed) {
      const minutesLeft = Math.ceil((rateCheck.retryAfterSecs || 3600) / 60);
      res.status(429).json({
        success: false,
        error: `Hourly limit reached (5 OTPs per hour). Please retry in ${minutesLeft} minute(s).`,
      });
      return;
    }

    // Generate new secure 6-digit OTP
    const rawOtp = generateCryptographicOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Store hashed OTP & create stateless token
    storeHashedOtp(normalizedEmail, rawOtp);
    const verificationToken = createVerificationToken(normalizedEmail, rawOtp, expiresAt);

    // Update timestamps
    registerOtpRequest(normalizedEmail);
    resendCooldownMap.set(normalizedEmail, Date.now());

    // Send real email to inbox
    const emailResult = await sendOtpEmail(normalizedEmail, rawOtp);

    if (!emailResult.success) {
      res.status(500).json({
        success: false,
        error: emailResult.error || "Failed to resend OTP email. Please try again.",
      });
      return;
    }

    res.json({
      success: true,
      message: `A new 6-digit OTP has been sent to ${normalizedEmail}.`,
      expiresInSeconds: 300,
      resendCooldownSeconds: 60,
      token: verificationToken,
    });
  } catch (err: any) {
    console.error("[AUTH ROUTE ERROR /resend-gmail-otp]", err);
    res.status(500).json({
      success: false,
      error: "Internal error while resending OTP email.",
    });
  }
});

/**
 * POST /api/auth/verify-gmail-otp
 * Verifies submitted 6-digit OTP code against stored SHA-256 hash or stateless token.
 * Enforces single-use deletion, 5-minute expiration, and 5 max attempts.
 */
router.post("/verify-gmail-otp", async (req: express.Request, res: express.Response) => {
  try {
    const { email, otp, token } = req.body;

    if (!email || !isValidEmailFormat(email)) {
      res.status(400).json({
        success: false,
        error: "A valid email address is required.",
      });
      return;
    }

    if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
      res.status(400).json({
        success: false,
        error: "Please enter all 6 digits of the OTP code.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const verification = verifySubmittedOtp(normalizedEmail, otp.trim(), token);

    if (!verification.success) {
      res.status(400).json({
        success: false,
        error: verification.error || "OTP verification failed.",
        remainingAttempts: verification.remainingAttempts,
      });
      return;
    }

    console.log(`[AUTH ROUTE SUCCESS] Successfully verified Gmail OTP for ${normalizedEmail}!`);

    res.json({
      success: true,
      message: "Gmail OTP verified successfully!",
      email: normalizedEmail,
    });
  } catch (err: any) {
    console.error("[AUTH ROUTE ERROR /verify-gmail-otp]", err);
    res.status(500).json({
      success: false,
      error: "An internal server error occurred during OTP verification.",
    });
  }
});

export default router;
