import React, { useState, useEffect, useRef } from "react";
import { Logo } from "./Logo";
import { KeyRound, Smartphone, User, Lock, ArrowRight, Eye, EyeOff, Mail, Loader2, AlertTriangle, ShieldCheck, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  initRecaptchaVerifier,
  sendFirebasePhoneOtp,
  getFirebaseErrorMessage,
  ConfirmationResult,
  syncFirebaseUserAfterOtp,
} from "../firebase";
import {
  requestGmailOtp,
  resendGmailOtp,
  verifyGmailOtp,
} from "../services/authService";
import { jsx } from "react/jsx-runtime";

interface AuthProps {
  onLoginSuccess: (username: string) => void;
  initialMode?: AuthMode;
  onBackToLanding?: () => void;
}

export type AuthMode =
  | "login"
  | "signup"
  | "forgot"
  | "forgot-otp-verify"
  | "otp-verify"
  | "reset-password"
  | "login-otp-verify"
  | "signup-otp-verify"
  | "gmail-login"
  | "gmail-otp-verify";

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess, initialMode = "login", onBackToLanding }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form States
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Mobile login / Forgot states
  const [loginMobile, setLoginMobile] = useState("");
  const [forgotMobile, setForgotMobile] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Firebase OTP & Security States
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0); // 30-second cooldown
  const [expiryTimer, setExpiryTimer] = useState(0); // 300-second (5-minute) expiry
  const [demoMockCode, setDemoMockCode] = useState<string | null>(null);

  // Secure Gmail OTP States
  const [gmailEmail, setGmailEmail] = useState("");
  const [gmailOtp, setGmailOtp] = useState(["", "", "", "", "", ""]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailResendCooldown, setGmailResendCooldown] = useState(0); // 60-second cooldown
  const [gmailExpiryTimer, setGmailExpiryTimer] = useState(0); // 300-second (5-minute) expiry
  const [gmailVerifyAttempts, setGmailVerifyAttempts] = useState(0);

  // Alert & Info States
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const recaptchaVerifierRef = useRef<any>(null);

  // Clean up reCAPTCHA verifier on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
      if (typeof window !== "undefined" && (window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  // 30-second Resend Cooldown Timer for Phone OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // 5-Minute (300s) OTP Expiry Countdown Timer for Phone OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (expiryTimer > 0) {
      interval = setInterval(() => {
        setExpiryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [expiryTimer]);

  // 60-second Resend Cooldown Timer for Gmail OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (gmailResendCooldown > 0) {
      interval = setInterval(() => {
        setGmailResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gmailResendCooldown]);

  // 5-Minute (300s) Expiry Countdown Timer for Gmail OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (gmailExpiryTimer > 0) {
      interval = setInterval(() => {
        setGmailExpiryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gmailExpiryTimer]);

  // ============================
  // GMAIL OTP HANDLERS
  // ============================

  // Dispatch Gmail OTP
  const handleSendGmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedEmail = gmailEmail.trim().toLowerCase();
    if (!trimmedEmail || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail)) {
      setError("Please enter a valid Gmail / email address (e.g., user@gmail.com).");
      return;
    }

    setGmailLoading(true);
    setGmailVerifyAttempts(0);

    const response = await requestGmailOtp(trimmedEmail);
    setGmailLoading(false);

    if (response.success) {
      setMode("gmail-otp-verify");
      setGmailOtp(["", "", "", "", "", ""]);
      setGmailResendCooldown(60); // Enforce 60s resend cooldown requirement
      setGmailExpiryTimer(300); // Enforce 5-minute expiry requirement
      setSuccess(response.message || `A 6-digit OTP code has been delivered to ${trimmedEmail}. Valid for 5 minutes.`);
    } else {
      setError(response.error || "Failed to send Gmail OTP. Please try again.");
    }
  };

  // Resend Gmail OTP with 60s cooldown
  const handleResendGmailOtp = async () => {
    setError("");
    setSuccess("");
    setGmailLoading(true);

    const trimmedEmail = gmailEmail.trim().toLowerCase();
    const response = await resendGmailOtp(trimmedEmail);
    setGmailLoading(false);

    if (response.success) {
      setGmailOtp(["", "", "", "", "", ""]);
      setGmailResendCooldown(60);
      setGmailExpiryTimer(300);
      setGmailVerifyAttempts(0);
      setSuccess(response.message || `A new 6-digit OTP code has been dispatched to ${trimmedEmail}.`);
    } else {
      setError(response.error || "Failed to resend Gmail OTP. Please try again.");
    }
  };

  // Verify Gmail OTP Code
  const handleVerifyGmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const enteredOtp = gmailOtp.join("");
    if (enteredOtp.length < 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    if (gmailExpiryTimer <= 0) {
      setError("The verification code has expired (5-minute limit). Please click Resend OTP Code.");
      return;
    }

    if (gmailVerifyAttempts >= 5) {
      setError("Maximum verification attempts (5/5) exceeded to prevent brute-force attacks. Please request a new OTP.");
      return;
    }

    setGmailLoading(true);

    const trimmedEmail = gmailEmail.trim().toLowerCase();
    const response = await verifyGmailOtp(trimmedEmail, enteredOtp);

    if (response.success) {
      setSuccess("Gmail OTP Verified successfully! Synchronizing with Firebase Auth & Firestore...");

      try {
        const displayName = trimmedEmail.split("@")[0];
        // Save user record to Firestore 'users' collection & sync Auth
        await syncFirebaseUserAfterOtp(trimmedEmail, displayName);

        // Store user in local active session
        localStorage.setItem("vault_iq_active_user", displayName);

        setGmailLoading(false);
        setSuccess("Authentication successful! Welcome to Vault IQ.");
        setTimeout(() => {
          onLoginSuccess(displayName);
        }, 1000);
      } catch (err: any) {
        setGmailLoading(false);
        setError("Failed to synchronize user session with Firebase. Please try again.");
      }
    } else {
      setGmailLoading(false);
      const newAttempts = gmailVerifyAttempts + 1;
      setGmailVerifyAttempts(newAttempts);
      setError(response.error || `Invalid verification code. (Attempt ${newAttempts} of 5)`);
    }
  };

  const handleGmailOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...gmailOtp];
    newOtp[index] = val.slice(-1);
    setGmailOtp(newOtp);

    // Auto-focus next digit input
    if (val && index < 5) {
      const nextInput = document.getElementById(`gmail-otp-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Load mock users from localStorage
  const getUsers = () => {
    const usersRaw = localStorage.getItem("vault_iq_users");
    return usersRaw ? JSON.parse(usersRaw) : {};
  };

  const saveUser = (userObj: any) => {
    const currentUsers = getUsers();
    currentUsers[userObj.username] = {
      username: userObj.username,
      mobile: userObj.mobile,
      email: userObj.email || `${userObj.username}@vaultiq.com`,
      password: userObj.password,
      mobileVerified: userObj.mobileVerified ?? true,
    };
    localStorage.setItem("vault_iq_users", JSON.stringify(currentUsers));
  };

  /**
   * Helper: Initialize invisible reCAPTCHA for Firebase Phone Auth
   */
  const getOrCreateRecaptcha = () => {
    try {
      const verifier = initRecaptchaVerifier("recaptcha-container");
      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (err) {
      console.warn("reCAPTCHA verifier initialization notice:", err);
      return null;
    }
  };

  /**
   * Helper: Send 6-digit OTP using Firebase Authentication
   */
  const dispatchFirebaseOtp = async (targetMobile: string, targetMode: AuthMode, successPrefix?: string) => {
    setError("");
    setSuccess("");
    setOtpLoading(true);
    setVerifyAttempts(0);
    setDemoMockCode(null);

    const verifier = getOrCreateRecaptcha();
    if (!verifier) {
      setOtpLoading(false);
      setError("reCAPTCHA initialization failed. Please refresh and try again.");
      return;
    }

    const result = await sendFirebasePhoneOtp(targetMobile, verifier);

    setOtpLoading(false);

    if (result.success && result.confirmationResult) {
      setConfirmationResult(result.confirmationResult);
      setOtp(["", "", "", "", "", ""]);
      setResendCooldown(30); // 30s resend cooldown requirement
      setExpiryTimer(300); // 5-minute (300s) expiry requirement

      if (result.mockOtp) {
        setDemoMockCode(result.mockOtp);
        setSuccess(
          `${successPrefix || "Security verification code sent to"} +91 ${targetMobile}. (Demo code: ${result.mockOtp})`
        );
      } else {
        setSuccess(
          `${successPrefix || "Security verification code sent via Firebase SMS to"} +91 ${targetMobile}. Valid for 5 minutes.`
        );
      }
      setMode(targetMode);
    } else {
      setError(result.error || "Failed to dispatch Firebase OTP code. Please retry.");
    }
  };

  /**
   * Helper: Confirm entered 6-digit OTP using Firebase Auth
   */
  const verifyFirebaseOtp = async (onVerified: () => void) => {
    setError("");
    setSuccess("");

    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    if (expiryTimer <= 0) {
      setError("The verification code has expired (5-minute limit). Please click Resend OTP.");
      return;
    }

    if (verifyAttempts >= 5) {
      setError("Maximum verification attempts (5/5) exceeded to prevent brute-force attacks. Please request a new OTP code.");
      return;
    }

    if (!confirmationResult) {
      setError("No active Firebase verification session. Please request a new OTP code.");
      return;
    }

    setOtpLoading(true);

    try {
      // Confirm OTP using Firebase Auth confirmation object
      const userCredential = await confirmationResult.confirm(enteredOtp);
      console.log("[FIREBASE AUTH SUCCESS] OTP Verified! UID:", userCredential?.user?.uid);

      setOtpLoading(false);
      setSuccess("OTP Verified successfully via Firebase Authentication!");
      onVerified();
    } catch (err: any) {
      setOtpLoading(false);
      const newAttempts = verifyAttempts + 1;
      setVerifyAttempts(newAttempts);

      const errorMessage = getFirebaseErrorMessage(err);
      if (newAttempts >= 5) {
        setError(`Security lock: ${errorMessage} Maximum attempts (5/5) reached. Request a new OTP.`);
      } else {
        setError(`${errorMessage} (Attempt ${newAttempts} of 5)`);
      }
    }
  };

  // ============================
  // HANDLERS FOR AUTH MODES
  // ============================

  // LOGIN Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const currentUsers = getUsers();
    const user = currentUsers[username];

    if (!user || user.password !== password) {
      setError("Invalid username or password.");
      return;
    }

    // Require Firebase Phone OTP Verification before granting access
    setLoginMobile(user.mobile);
    await dispatchFirebaseOtp(user.mobile, "login-otp-verify", "Login 2FA code sent to");
  };

  // VERIFY LOGIN OTP Handler
  const handleVerifyLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    verifyFirebaseOtp(() => {
      setTimeout(() => {
        onLoginSuccess(username);
      }, 1000);
    });
  };

  // SIGNUP Handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !mobile.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit Indian Mobile Number.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const currentUsers = getUsers();
    if (currentUsers[username]) {
      setError("Username is already taken.");
      return;
    }

    const mobileExists = Object.values(currentUsers).some((u: any) => u.mobile === mobile);
    if (mobileExists) {
      setError("This mobile number is already linked to another account.");
      return;
    }

    await dispatchFirebaseOtp(mobile, "signup-otp-verify", "Verification code sent to");
  };

  // VERIFY SIGNUP OTP Handler
  const handleVerifySignupOtp = (e: React.FormEvent) => {
    e.preventDefault();
    verifyFirebaseOtp(() => {
      saveUser({ username, mobile, email, password, mobileVerified: true });
      setTimeout(() => {
        setMode("login");
        setError("");
        setSuccess("Account registered successfully! Please sign in.");
      }, 1200);
    });
  };

  // FORGOT PASSWORD Handler
  const triggerForgotOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{10}$/.test(forgotMobile)) {
      setError("Please enter a valid 10-digit Indian Mobile Number.");
      return;
    }

    const currentUsers = getUsers();
    const foundUser = Object.values(currentUsers).find((u: any) => u.mobile === forgotMobile) as any;

    if (!foundUser) {
      setError("This mobile number is not registered under any account.");
      return;
    }

    await dispatchFirebaseOtp(forgotMobile, "otp-verify", "Recovery code sent to");
  };

  // VERIFY FORGOT OTP Handler
  const handleVerifyForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    verifyFirebaseOtp(() => {
      setTimeout(() => {
        setMode("reset-password");
      }, 1000);
    });
  };

  // RESET PASSWORD Handler
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const currentUsers = getUsers();
    const foundUser = Object.values(currentUsers).find((u: any) => u.mobile === forgotMobile) as any;

    if (!foundUser) {
      setError("User account not found.");
      return;
    }

    currentUsers[foundUser.username].password = newPassword;
    localStorage.setItem("vault_iq_users", JSON.stringify(currentUsers));

    setSuccess("Password updated successfully! Redirecting to login...");
    setTimeout(() => {
      setForgotMobile("");
      setNewPassword("");
      setConfirmPassword("");
      setOtp(["", "", "", "", "", ""]);
      setMode("login");
      setSuccess("");
    }, 1200);
  };

  // Handle single character OTP digit input with auto-focus
  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-focus next field
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Format expiry timer as MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isOtpComplete = otp.join("").length === 6;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] dark:bg-[#1C1D1B] transition-colors duration-300 p-4">
      {/* Container for Firebase invisible reCAPTCHA */}
      <div id="recaptcha-container"></div>

      <div className="absolute top-4 right-4">
        <span className="text-xs font-mono text-[#5A5A40]/65 dark:text-[#C2C2A3]/65 tracking-widest uppercase flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
          FIREBASE SECURE GATEWAY
        </span>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#2A2B29] rounded-4xl shadow-sm border border-[#DEDDDA] dark:border-[#3E403D] overflow-hidden p-8 md:p-10 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#5A5A40] dark:bg-[#C2C2A3]"></div>

        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Back to Landing Page"
            id="auth-back-to-landing"
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>
        )}

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" className="mb-2" />
          <h2 className="text-xs font-semibold tracking-[0.15em] text-[#5A5A40]/70 dark:text-[#C2C2A3]/70 uppercase mt-2 text-center">
            {mode === "login" && "Sign In To Your Vault"}
            {mode === "gmail-login" && "Secure Gmail OTP Sign In"}
            {mode === "gmail-otp-verify" && "Verify Gmail Verification Code"}
            {mode === "login-otp-verify" && "Two-Factor Firebase Verification"}
            {mode === "signup" && "Create Digital Vault"}
            {mode === "signup-otp-verify" && "Verify Phone Number"}
            {(mode === "forgot" || mode === "forgot-otp-verify" || mode === "otp-verify" || mode === "reset-password") && "Access Recovery System"}
          </h2>
        </div>

        {/* Error / Success Notifications */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3.5 bg-rose-50 border-l-4 border-rose-500 text-rose-800 dark:bg-rose-950/20 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3.5 bg-[#5A5A40]/10 border-l-4 border-[#5A5A40] text-[#5A5A40] dark:bg-[#C2C2A3]/10 dark:text-[#C2C2A3] rounded-xl text-xs font-medium"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forms Container */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {/* 1. LOGIN MODE */}
            {mode === "login" && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                onSubmit={handleLogin}
                className="space-y-5"
                id="login-form"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1.5 tracking-wider">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1.5 tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setMode("forgot");
                    }}
                    className="text-xs font-semibold text-[#5A5A40] dark:text-[#C2C2A3] hover:underline transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#5A5A40] hover:bg-[#4E5440] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-login-submit"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Dispatched Firebase OTP...
                    </>
                  ) : (
                    <>
                      Unlock Vault <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Divider & Gmail OTP Login option */}
                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-[#DEDDDA] dark:border-[#3E403D]"></div>
                  <span className="shrink mx-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">OR</span>
                  <div className="grow border-t border-[#DEDDDA] dark:border-[#3E403D]"></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setMode("gmail-login");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1C1D1B] hover:bg-[#2A2B29] dark:bg-[#F5F5F0] dark:hover:bg-[#E4E3E0] text-white dark:text-[#1C1D1B] font-medium rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer text-xs"
                  id="btn-gmail-otp-login-mode"
                >
                  <Mail size={16} className="text-emerald-500" />
                  Sign In with Gmail OTP
                </button>

                <div className="text-center pt-4 border-t border-[#DEDDDA] dark:border-[#3E403D]/60">
                  <span className="text-xs text-gray-400">New to Vault IQ? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setMode("signup");
                    }}
                    className="text-xs font-bold text-[#5A5A40] dark:text-[#C2C2A3] hover:underline transition-colors cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </motion.form>
            )}

            {/* 2. SIGNUP MODE */}
            {mode === "signup" && (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                onSubmit={handleSignup}
                className="space-y-4"
                id="signup-form"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1 tracking-wider">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Choose username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1 tracking-wider">
                    Mobile No. (UPI Linked)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500 font-mono text-sm font-semibold select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-12 pr-4 py-2.5 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1 tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1 tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#5A5A40] hover:bg-[#4E5440] text-white font-medium rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-signup-submit"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Requesting Firebase OTP...
                    </>
                  ) : (
                    <>
                      Register Account <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="text-center pt-4 border-t border-[#DEDDDA] dark:border-[#3E403D]/60">
                  <span className="text-xs text-gray-400">Already have a vault? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setMode("login");
                    }}
                    className="text-xs font-bold text-[#5A5A40] dark:text-[#C2C2A3] hover:underline transition-colors cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              </motion.form>
            )}

            {/* 3. FORGOT PASSWORD MODE */}
            {mode === "forgot" && (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={triggerForgotOtpRequest}
                className="space-y-5"
                id="forgot-form"
              >
                <div className="text-center">
                  <Smartphone className="w-12 h-12 text-[#5A5A40] dark:text-[#C2C2A3] mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                    Firebase OTP Password Recovery
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Enter your registered UPI-linked Mobile No. Firebase will send a 6-digit OTP to verify your identity.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1.5 tracking-wider">
                    Mobile No. (UPI Linked)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500 font-mono text-sm font-semibold select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={forgotMobile}
                      onChange={(e) => setForgotMobile(e.target.value.replace(/\D/g, ""))}
                      className="w-full pl-12 pr-4 py-2.5 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all text-sm font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#5A5A40] hover:bg-[#4E5440] text-white font-medium rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-request-otp"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending Firebase OTP...
                    </>
                  ) : (
                    <>
                      Send Firebase OTP <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setMode("login");
                    }}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}

            {/* 4. OTP VERIFICATION FOR SIGNUP / LOGIN / FORGOT */}
            {(mode === "login-otp-verify" || mode === "signup-otp-verify" || mode === "otp-verify") && (
              <motion.form
                key={`${mode}-form`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={
                  mode === "login-otp-verify"
                    ? handleVerifyLoginOtp
                    : mode === "signup-otp-verify"
                      ? handleVerifySignupOtp
                      : handleVerifyForgotOtp
                }
                className="space-y-6"
                id="otp-verify-form"
              >
                <div className="text-center">
                  <KeyRound className="w-12 h-12 text-[#5A5A40] dark:text-[#C2C2A3] mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                    {mode === "login-otp-verify" && "Two-Factor Login Verification"}
                    {mode === "signup-otp-verify" && "Verify Your Mobile Number"}
                    {mode === "otp-verify" && "Enter Recovery Verification Code"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Firebase Auth has sent a 6-digit verification code to:{" "}
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      +91 {mode === "login-otp-verify" ? loginMobile : mode === "signup-otp-verify" ? mobile : forgotMobile}
                    </span>
                  </p>

                  {/* 5-minute Expiry Timer Display */}
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-[#1C1D1B] rounded-full text-[11px] font-mono text-gray-600 dark:text-gray-400">
                    <span>Code expires in:</span>
                    <span className={`font-bold ${expiryTimer < 60 ? "text-rose-500 animate-pulse" : "text-[#5A5A40] dark:text-[#C2C2A3]"}`}>
                      {formatTimer(expiryTimer)}
                    </span>
                  </div>
                </div>

                {/* 6-Digit Inputs */}
                <div className="flex justify-between gap-2 max-w-70 mx-auto">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-digit-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                          const prevInput = document.getElementById(`otp-digit-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      className="w-10 h-12 text-center text-lg font-mono font-bold bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border-2 border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  ))}
                </div>

                {/* Submit button & Resend options */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="submit"
                    disabled={!isOtpComplete || otpLoading || verifyAttempts >= 5 || expiryTimer <= 0}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#5A5A40] hover:bg-[#4E5440] text-white font-medium rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    id="btn-verify-otp"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying Code...
                      </>
                    ) : (
                      <>Verify Code</>
                    )}
                  </button>

                  {/* Resend OTP button with 30s cooldown */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                    {resendCooldown > 0 ? (
                      <span>Resend code in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        disabled={otpLoading}
                        onClick={async () => {
                          const targetPhone =
                            mode === "login-otp-verify"
                              ? loginMobile
                              : mode === "signup-otp-verify"
                                ? mobile
                                : forgotMobile;
                          await dispatchFirebaseOtp(targetPhone, mode, "New verification code sent to");
                        }}
                        className="text-[#5A5A40] dark:text-[#C2C2A3] font-semibold hover:underline cursor-pointer disabled:opacity-50"
                      >
                        Resend OTP Code
                      </button>
                    )}
                  </div>

                  {/* Back Link */}
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setMode(mode === "login-otp-verify" ? "login" : mode === "signup-otp-verify" ? "signup" : "forgot");
                    }}
                    className="text-xs text-gray-500 hover:text-[#5A5A40] dark:hover:text-[#C2C2A3] hover:underline cursor-pointer mt-1"
                  >
                    Back to previous form
                  </button>
                </div>
              </motion.form>
            )}

            {/* 5. RESET PASSWORD MODE */}
            {mode === "reset-password" && (
              <motion.form
                key="reset-password-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
                id="reset-password-form"
              >
                <div className="text-center mb-2">
                  <Lock className="w-12 h-12 text-[#5A5A40] dark:text-[#C2C2A3] mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                    Set New Password
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Create a secure, fresh password for your account.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1.5 tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1.5 tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#5A5A40] hover:bg-[#4E5440] text-white font-medium rounded-xl shadow-md transition-all cursor-pointer"
                  id="btn-update-password"
                >
                  Update & Login
                </button>
              </motion.form>
            )}

            {/* 6. GMAIL OTP LOGIN REQUEST MODE */}
            {mode === "gmail-login" && (
              <motion.form
                key="gmail-login-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                onSubmit={handleSendGmailOtp}
                className="space-y-5"
                id="gmail-login-form"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
                    <Mail size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                    Secure Gmail OTP Sign In
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Enter your Gmail address. We will deliver a cryptographically secure 6-digit OTP code directly to your inbox.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1.5 tracking-wider">
                    Gmail Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={gmailEmail}
                      onChange={(e) => setGmailEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={gmailLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#5A5A40] hover:bg-[#4E5440] text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-send-gmail-otp-submit"
                >
                  {gmailLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Dispatching OTP to Inbox...
                    </>
                  ) : (
                    <>
                      Send Gmail OTP <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="text-center pt-3 border-t border-[#DEDDDA] dark:border-[#3E403D]/60">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setMode("login");
                    }}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    Back to Password Login
                  </button>
                </div>
              </motion.form>
            )}

            {/* 7. GMAIL OTP VERIFICATION MODE */}
            {mode === "gmail-otp-verify" && (
              <motion.form
                key="gmail-otp-verify-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleVerifyGmailOtp}
                className="space-y-6"
                id="gmail-otp-verify-form"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
                    <KeyRound size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                    Enter Gmail 6-Digit OTP
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    OTP delivered to inbox:{" "}
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {gmailEmail}
                    </span>
                  </p>

                  {/* 5-minute Expiry Countdown Display */}
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-[#1C1D1B] rounded-full text-[11px] font-mono text-gray-600 dark:text-gray-400">
                    <span>Code expires in:</span>
                    <span className={`font-bold ${gmailExpiryTimer < 60 ? "text-rose-500 animate-pulse" : "text-[#5A5A40] dark:text-[#C2C2A3]"}`}>
                      {formatTimer(gmailExpiryTimer)}
                    </span>
                  </div>
                </div>

                {/* 6-Digit Inputs */}
                <div className="flex justify-between gap-2 max-w-70 mx-auto">
                  {gmailOtp.map((digit, index) => (
                    <input
                      key={index}
                      id={`gmail-otp-digit-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleGmailOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !gmailOtp[index] && index > 0) {
                          const prevInput = document.getElementById(`gmail-otp-digit-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      className="w-10 h-12 text-center text-lg font-mono font-bold bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border-2 border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none transition-all focus:ring-1 focus:ring-[#5A5A40]"
                    />
                  ))}
                </div>

                {/* Submit button & Resend options */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="submit"
                    disabled={gmailOtp.join("").length < 6 || gmailLoading || gmailVerifyAttempts >= 5 || gmailExpiryTimer <= 0}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#5A5A40] hover:bg-[#4E5440] text-white font-medium rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    id="btn-verify-gmail-otp"
                  >
                    {gmailLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying Code...
                      </>
                    ) : (
                      <>Verify Code & Sign In</>
                    )}
                  </button>

                  {/* Resend OTP button with 60s cooldown */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                    {gmailResendCooldown > 0 ? (
                      <span>Resend code in {gmailResendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        disabled={gmailLoading}
                        onClick={handleResendGmailOtp}
                        className="text-[#5A5A40] dark:text-[#C2C2A3] font-semibold hover:underline cursor-pointer disabled:opacity-50"
                      >
                        Resend OTP Code
                      </button>
                    )}
                  </div>

                  {/* Back Link */}
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setMode("gmail-login");
                    }}
                    className="text-xs text-gray-500 hover:text-[#5A5A40] dark:hover:text-[#C2C2A3] hover:underline cursor-pointer mt-1"
                  >
                    Change Email / Back
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
