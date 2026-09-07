import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Grid,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { requestGmailOtp, resendGmailOtp, verifyGmailOtp } from "../services/authService";
import { AppLockMode } from "../types";

export type RecoveryTarget = "app_lock" | "safe_zone" | "account_password";

interface SecurityRecoveryProps {
  target: RecoveryTarget;
  username: string;
  onSuccess: (newCredential?: string, lockMode?: AppLockMode) => void;
  onCancel: () => void;
}

export const SecurityRecovery: React.FC<SecurityRecoveryProps> = ({
  target,
  username,
  onSuccess,
  onCancel,
}) => {
  // Step in recovery flow: 1 = Request OTP, 2 = Verify OTP, 3 = Set New Credentials, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // User details
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [enteredEmail, setEnteredEmail] = useState<string>("");
  const [maskedEmail, setMaskedEmail] = useState<string>("");

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0); // 60s
  const [expiryTimer, setExpiryTimer] = useState<number>(0); // 300s (5 minutes)
  const [verifyAttempts, setVerifyAttempts] = useState<number>(0);

  // New Credentials States
  // For App Lock
  const [selectedLockMode, setSelectedLockMode] = useState<AppLockMode>("pin4");
  const [newPin, setNewPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [newPattern, setNewPattern] = useState<number[]>([]);

  // For Safe Zone
  const [safeZoneLength, setSafeZoneLength] = useState<4 | 6>(4);
  const [newSafeZonePin, setNewSafeZonePin] = useState<string>("");
  const [confirmSafeZonePin, setConfirmSafeZonePin] = useState<string>("");

  // For Account Password
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Messages
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load registered Gmail on mount
  useEffect(() => {
    try {
      const usersRaw = localStorage.getItem("vault_iq_users");
      const users = usersRaw ? JSON.parse(usersRaw) : {};
      const userObj = users[username];

      let emailFound = "";
      if (userObj && userObj.email) {
        emailFound = userObj.email;
      } else if (username) {
        emailFound = `${username.toLowerCase()}@gmail.com`;
      }

      setRegisteredEmail(emailFound);
      setEnteredEmail(emailFound);

      // Create masked email (e.g. j***e@gmail.com)
      if (emailFound) {
        const parts = emailFound.split("@");
        if (parts.length === 2) {
          const namePart = parts[0];
          const domainPart = parts[1];
          if (namePart.length <= 2) {
            setMaskedEmail(`${namePart[0]}*@${domainPart}`);
          } else {
            const firstChar = namePart[0];
            const lastChar = namePart[namePart.length - 1];
            const asterisks = "*".repeat(Math.max(3, namePart.length - 2));
            setMaskedEmail(`${firstChar}${asterisks}${lastChar}@${domainPart}`);
          }
        } else {
          setMaskedEmail(emailFound);
        }
      }
    } catch (err) {
      console.error("Error loading user email for recovery:", err);
      const fallback = username ? `${username.toLowerCase()}@gmail.com` : "";
      setRegisteredEmail(fallback);
      setEnteredEmail(fallback);
      setMaskedEmail(fallback);
    }
  }, [username]);

  // Resend Cooldown Countdown (60s)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Expiry Timer Countdown (300s)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (expiryTimer > 0) {
      timer = setInterval(() => {
        setExpiryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [expiryTimer]);

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Step 1: Send OTP to entered Gmail
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");

    const emailToSend = enteredEmail.trim().toLowerCase();
    if (!emailToSend || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailToSend)) {
      setError("Please enter a valid Gmail / email address (e.g. user@gmail.com).");
      return;
    }

    setIsLoading(true);
    const response = await requestGmailOtp(emailToSend);
    setIsLoading(false);

    if (response.success) {
      // Create dynamic masked email for display
      const parts = emailToSend.split("@");
      if (parts.length === 2) {
        const namePart = parts[0];
        const domainPart = parts[1];
        if (namePart.length <= 2) {
          setMaskedEmail(`${namePart[0]}*@${domainPart}`);
        } else {
          const firstChar = namePart[0];
          const lastChar = namePart[namePart.length - 1];
          const asterisks = "*".repeat(Math.max(3, namePart.length - 2));
          setMaskedEmail(`${firstChar}${asterisks}${lastChar}@${domainPart}`);
        }
      } else {
        setMaskedEmail(emailToSend);
      }

      setStep(2);
      setOtpDigits(["", "", "", "", "", ""]);
      setResendCooldown(60);
      setExpiryTimer(300);
      setVerifyAttempts(0);
      setSuccess(
        response.message || `A 6-digit verification code has been dispatched to ${emailToSend}. Valid for 5 minutes.`
      );
      // Focus first OTP field
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    } else {
      setError(response.error || "Failed to dispatch verification code to your Gmail. Please try again.");
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setError("");
    setSuccess("");
    setIsLoading(true);

    const emailToSend = enteredEmail.trim().toLowerCase();
    const response = await resendGmailOtp(emailToSend);
    setIsLoading(false);

    if (response.success) {
      setOtpDigits(["", "", "", "", "", ""]);
      setResendCooldown(60);
      setExpiryTimer(300);
      setVerifyAttempts(0);
      setSuccess(response.message || `A new 6-digit code has been sent to ${emailToSend}.`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    } else {
      setError(response.error || "Failed to resend OTP. Please try again.");
    }
  };

  // Handle individual OTP digit change
  const handleOtpDigitChange = (index: number, value: string) => {
    // Check if user pasted a full 6-digit code
    const sanitized = value.replace(/\D/g, "");
    if (sanitized.length > 1) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6 && i < sanitized.length; i++) {
        newDigits[i] = sanitized[i];
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(sanitized.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = sanitized;
    setOtpDigits(newDigits);

    if (sanitized && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fullCode = otpDigits.join("");
    if (fullCode.length < 6) {
      setError("Please enter all 6 digits of the OTP verification code.");
      return;
    }

    if (expiryTimer <= 0) {
      setError("Verification code has expired. Please click Resend OTP.");
      return;
    }

    if (verifyAttempts >= 5) {
      setError("Maximum verification attempts (5/5) exceeded. Please request a new OTP code.");
      return;
    }

    setIsLoading(true);
    const emailToSend = enteredEmail.trim().toLowerCase() || registeredEmail.trim().toLowerCase();
    const response = await verifyGmailOtp(emailToSend, fullCode);
    setIsLoading(false);

    if (response.success) {
      setSuccess("Identity verified successfully via registered Gmail!");
      setTimeout(() => {
        setError("");
        setSuccess("");
        setStep(3);
      }, 1000);
    } else {
      const attempts = verifyAttempts + 1;
      setVerifyAttempts(attempts);
      if (attempts >= 5) {
        setError("Maximum verification attempts reached. Please request a new code.");
      } else {
        setError(response.error || `Invalid verification code. (Attempt ${attempts} of 5)`);
      }
    }
  };

  // Step 3: Save New Credentials
  const handleSaveNewCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (target === "app_lock") {
      if (selectedLockMode === "pin4") {
        if (!/^\d{4}$/.test(newPin)) {
          setError("4-Digit PIN must be exactly 4 numeric digits.");
          return;
        }
        if (newPin !== confirmPin) {
          setError("New PIN and Confirm PIN do not match.");
          return;
        }
        localStorage.setItem(`vault_iq_user_pin_${username}`, newPin);
        localStorage.setItem(`vault_iq_lock_mode_${username}`, "pin4");
        setSuccess("4-Digit PIN updated successfully!");
        setStep(4);
        setTimeout(() => onSuccess(newPin, "pin4"), 1500);
      } else if (selectedLockMode === "pin6") {
        if (!/^\d{6}$/.test(newPin)) {
          setError("6-Digit PIN must be exactly 6 numeric digits.");
          return;
        }
        if (newPin !== confirmPin) {
          setError("New PIN and Confirm PIN do not match.");
          return;
        }
        localStorage.setItem(`vault_iq_user_pin_${username}`, newPin);
        localStorage.setItem(`vault_iq_lock_mode_${username}`, "pin6");
        setSuccess("6-Digit PIN updated successfully!");
        setStep(4);
        setTimeout(() => onSuccess(newPin, "pin6"), 1500);
      } else if (selectedLockMode === "pattern") {
        if (newPattern.length < 3) {
          setError("Pattern sequence must connect at least 3 points.");
          return;
        }
        const patternStr = newPattern.join("-");
        localStorage.setItem(`vault_iq_user_pattern_${username}`, patternStr);
        localStorage.setItem(`vault_iq_lock_mode_${username}`, "pattern");
        setSuccess("Pattern Lock updated successfully!");
        setStep(4);
        setTimeout(() => onSuccess(patternStr, "pattern"), 1500);
      } else {
        // Disabled/None
        localStorage.setItem(`vault_iq_lock_mode_${username}`, "none");
        setSuccess("App Lock disabled successfully!");
        setStep(4);
        setTimeout(() => onSuccess("", "none"), 1500);
      }
    } else if (target === "safe_zone") {
      const requiredLen = safeZoneLength;
      const regex = requiredLen === 6 ? /^\d{6}$/ : /^\d{4}$/;
      if (!regex.test(newSafeZonePin)) {
        setError(`Safe Zone PIN must be exactly ${requiredLen} numeric digits.`);
        return;
      }
      if (newSafeZonePin !== confirmSafeZonePin) {
        setError("New PIN and Confirm PIN do not match.");
        return;
      }

      localStorage.setItem(`vault_iq_safe_zone_pin_${username}`, newSafeZonePin);
      localStorage.setItem(`vault_iq_safe_zone_pin_len_${username}`, requiredLen.toString());
      setSuccess(`Safe Zone ${requiredLen}-Digit PIN updated successfully!`);
      setStep(4);
      setTimeout(() => onSuccess(newSafeZonePin), 1500);
    } else {
      // Account Password
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const usersRaw = localStorage.getItem("vault_iq_users");
      const users = usersRaw ? JSON.parse(usersRaw) : {};
      let targetUserKey = username;
      if (!targetUserKey || !users[targetUserKey]) {
        const normalizedEntered = enteredEmail.trim().toLowerCase();
        const found = Object.keys(users).find(
          (k) => users[k].email?.toLowerCase() === normalizedEntered || k.toLowerCase() === normalizedEntered
        );
        if (found) targetUserKey = found;
      }

      if (targetUserKey && users[targetUserKey]) {
        users[targetUserKey].password = newPassword;
        localStorage.setItem("vault_iq_users", JSON.stringify(users));
      }

      setSuccess("Account password updated successfully!");
      setStep(4);
      setTimeout(() => onSuccess(newPassword), 1500);
    }
  };

  const getTargetTitle = () => {
    switch (target) {
      case "app_lock":
        return "App Access Security Lock";
      case "safe_zone":
        return "Cash & UPI Safe Zone Stash";
      case "account_password":
        return "Account Sign-In Password";
    }
  };

  return (
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      id="security-recovery-overlay"
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#2A2B29] rounded-4xl p-6 sm:p-8 border border-[#DEDDDA] dark:border-[#3E403D] shadow-2xl relative space-y-6 text-[#2D302D] dark:text-[#E4E3E0]"
      >
        {/* Top Header & Close Button */}
        <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-[#00C0F0]/15 to-[#00E676]/15 text-[#00C0F0] rounded-2xl border border-cyan-500/20">
              <KeyRound size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
                  Gmail Security Gateway
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <h2 className="text-lg font-display font-extrabold text-gray-900 dark:text-white">
                {getTargetTitle()}
              </h2>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Cancel Recovery"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between px-2">
          {[
            { num: 1, label: "Dispatch" },
            { num: 2, label: "Verify OTP" },
            { num: 3, label: "New Code" },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  step === item.num
                    ? "bg-linear-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] shadow-sm scale-110"
                    : step > item.num
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                }`}
              >
                {step > item.num ? "✓" : item.num}
              </div>
              <span
                className={`text-xs font-semibold ${
                  step === item.num
                    ? "text-cyan-600 dark:text-cyan-400"
                    : step > item.num
                    ? "text-emerald-500"
                    : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Status Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 bg-rose-50 dark:bg-rose-950/25 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 rounded-r-xl text-xs flex items-start gap-2"
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-r-xl text-xs flex items-start gap-2"
            >
              <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-500" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            STEP 1: ENTER GMAIL & DISPATCH OTP
           ======================================================== */}
        {step === 1 && (
          <motion.form
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSendOtp}
            className="space-y-5"
            id="security-recovery-step1-form"
          >
            <div className="p-4 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Mail className="text-cyan-500" size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Gmail Security Recovery
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/20">
                  {target === "app_lock" ? "App Security Lock" : target === "safe_zone" ? "Safe Zone Stash" : "Account Password"}
                </span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {target === "app_lock" && "Enter your registered Gmail address to receive a secure 6-digit OTP to reset your App Access Security PIN / Pattern:"}
                {target === "safe_zone" && "Enter your registered Gmail address to receive a secure 6-digit OTP to reset your Safe Zone Stash PIN:"}
                {target === "account_password" && "Enter your registered Gmail address to receive a secure 6-digit OTP to reset your Vault IQ account password:"}
              </p>

              {/* Editable Gmail Input Field */}
              <div className="space-y-1 pt-1">
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Registered Gmail Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={enteredEmail}
                    onChange={(e) => {
                      setEnteredEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. user@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] focus:border-cyan-500 text-gray-900 dark:text-white rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    id="input-recovery-gmail"
                    autoFocus
                  />
                </div>
              </div>

              {username && (
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 font-mono">
                  <span>User Account: <strong className="text-gray-700 dark:text-gray-200">{username}</strong></span>
                  {registeredEmail && registeredEmail !== enteredEmail && (
                    <button
                      type="button"
                      onClick={() => setEnteredEmail(registeredEmail)}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer text-[10px]"
                    >
                      Use Registered ({registeredEmail})
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !enteredEmail.trim()}
                className="flex-2 py-3 bg-linear-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs shadow-md hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                id="btn-dispatch-recovery-otp"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Dispatching Code...
                  </>
                ) : (
                  <>
                    Send OTP to Gmail <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {/* ========================================================
            STEP 2: ENTER & VERIFY 6-DIGIT GMAIL OTP
           ======================================================== */}
        {step === 2 && (
          <motion.form
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleVerifyOtp}
            className="space-y-5"
          >
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Enter 6-Digit Gmail OTP
              </h3>
              <p className="text-xs text-gray-400">
                Delivered to <strong className="text-cyan-500">{enteredEmail || maskedEmail}</strong>
              </p>
            </div>

            {/* 6-Digit OTP Boxes */}
            <div className="flex justify-center gap-2 py-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-11 h-13 text-center font-mono font-bold text-xl rounded-2xl border-2 transition-all outline-none ${
                    digit
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                      : "border-[#DEDDDA] dark:border-[#3E403D] bg-gray-50 dark:bg-[#1C1D1B]/40 text-gray-700 dark:text-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  }`}
                  id={`recovery-otp-box-${index}`}
                />
              ))}
            </div>

            {/* Live Timers & Resend Button */}
            <div className="flex items-center justify-between text-xs px-1 font-mono">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span>⏱️</span>
                <span>{expiryTimer > 0 ? formatTimer(expiryTimer) : "Expired"}</span>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer disabled:opacity-40 disabled:no-underline flex items-center gap-1"
              >
                <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="submit"
                disabled={isLoading || otpDigits.join("").length < 6}
                className="flex-2 py-3 bg-linear-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs shadow-md hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                id="btn-verify-recovery-otp"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    Verify & Proceed <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {/* ========================================================
            STEP 3: SET NEW CREDENTIALS (PIN / PASSWORD / PATTERN)
           ======================================================== */}
        {step === 3 && (
          <motion.form
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSaveNewCredentials}
            className="space-y-4"
          >
            {/* A. APP LOCK RECOVERY */}
            {target === "app_lock" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Select App Lock Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { mode: "pin4", label: "4-Digit PIN", icon: KeyRound },
                      { mode: "pin6", label: "6-Digit PIN", icon: KeyRound },
                      { mode: "pattern", label: "Pattern Lock", icon: Grid },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSel = selectedLockMode === item.mode;
                      return (
                        <button
                          key={item.mode}
                          type="button"
                          onClick={() => {
                            setSelectedLockMode(item.mode as AppLockMode);
                            setNewPin("");
                            setConfirmPin("");
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isSel
                              ? "bg-cyan-500/15 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold"
                              : "border-[#DEDDDA] dark:border-[#3E403D] bg-gray-50 dark:bg-[#1C1D1B]/40 text-gray-500"
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-[11px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(selectedLockMode === "pin4" || selectedLockMode === "pin6") && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        New {selectedLockMode === "pin6" ? "6" : "4"}-Digit Passcode PIN
                      </label>
                      <input
                        type="password"
                        maxLength={selectedLockMode === "pin6" ? 6 : 4}
                        required
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                        placeholder={`Enter ${selectedLockMode === "pin6" ? "6" : "4"} digits`}
                        className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl font-mono font-bold text-center tracking-widest text-lg outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Confirm {selectedLockMode === "pin6" ? "6" : "4"}-Digit Passcode PIN
                      </label>
                      <input
                        type="password"
                        maxLength={selectedLockMode === "pin6" ? 6 : 4}
                        required
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                        placeholder={`Re-enter ${selectedLockMode === "pin6" ? "6" : "4"} digits`}
                        className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl font-mono font-bold text-center tracking-widest text-lg outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                {selectedLockMode === "pattern" && (
                  <div className="space-y-3 flex flex-col items-center pt-1">
                    <p className="text-xs text-gray-400">
                      Tap dots sequentially to record new pattern (min 3 dots):
                    </p>
                    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D]">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((dot) => {
                        const isSelected = newPattern.includes(dot);
                        const orderIdx = newPattern.indexOf(dot);
                        return (
                          <button
                            key={dot}
                            type="button"
                            onClick={() => {
                              if (!newPattern.includes(dot)) {
                                setNewPattern([...newPattern, dot]);
                              }
                            }}
                            className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "bg-linear-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] border-cyan-400 shadow-md scale-105"
                                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 hover:border-cyan-400"
                            }`}
                          >
                            {isSelected ? orderIdx + 1 : "•"}
                          </button>
                        );
                      })}
                    </div>
                    {newPattern.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setNewPattern([])}
                        className="text-xs text-rose-500 hover:underline cursor-pointer"
                      >
                        Reset Path
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* B. SAFE ZONE STASH RECOVERY */}
            {target === "safe_zone" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSafeZoneLength(4);
                      setNewSafeZonePin("");
                      setConfirmSafeZonePin("");
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      safeZoneLength === 4
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-300"
                        : "border-[#DEDDDA] dark:border-[#3E403D] text-gray-400"
                    }`}
                  >
                    4-Digit PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSafeZoneLength(6);
                      setNewSafeZonePin("");
                      setConfirmSafeZonePin("");
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      safeZoneLength === 6
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-300"
                        : "border-[#DEDDDA] dark:border-[#3E403D] text-gray-400"
                    }`}
                  >
                    6-Digit PIN
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    New {safeZoneLength}-Digit Safe Zone PIN
                  </label>
                  <input
                    type="password"
                    maxLength={safeZoneLength}
                    required
                    value={newSafeZonePin}
                    onChange={(e) => setNewSafeZonePin(e.target.value.replace(/\D/g, ""))}
                    placeholder={`Enter ${safeZoneLength} digits`}
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl font-mono font-bold text-center tracking-widest text-lg outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Confirm {safeZoneLength}-Digit Safe Zone PIN
                  </label>
                  <input
                    type="password"
                    maxLength={safeZoneLength}
                    required
                    value={confirmSafeZonePin}
                    onChange={(e) => setConfirmSafeZonePin(e.target.value.replace(/\D/g, ""))}
                    placeholder={`Re-enter ${safeZoneLength} digits`}
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl font-mono font-bold text-center tracking-widest text-lg outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* C. ACCOUNT PASSWORD RECOVERY */}
            {target === "account_password" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    New Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-3 pr-10 py-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-sm outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-sm outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-linear-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer mt-2"
              id="btn-save-new-security-credential"
            >
              Save & Unlock Vault
            </button>
          </motion.form>
        )}

        {/* ========================================================
            STEP 4: SUCCESS CONGRATULATIONS
           ======================================================== */}
        {step === 4 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-6 text-center space-y-3"
          >
            <div className="w-14 h-14 bg-emerald-500/15 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Security Credentials Updated!
            </h3>
            <p className="text-xs text-gray-400">
              Your security configuration has been updated and verified. Unlocking your vault...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
