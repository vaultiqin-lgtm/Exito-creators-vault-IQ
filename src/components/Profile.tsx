import React, { useState, useEffect, useRef } from "react";
import { Expense, FinancialGoal } from "../types";
import {
  User,
  Smartphone,
  Mail,
  Camera,
  Edit3,
  TrendingDown,
  TrendingUp,
  Wallet,
  Check,
  ShieldCheck,
  Coins,
  Sparkles,
  Upload,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Save,
  KeyRound,
  Shield,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { updateUserProfileInFirestore } from "../firebase";

interface ProfileProps {
  username: string;
  userUid?: string;
  onEditProfile?: () => void;
  onUpgradeRedirect: () => void;
  expenses: Expense[];
  goals: FinancialGoal[];
}

// Preset avatars
const AVATAR_EMOJIS = ["🦁", "🦉", "🦄", "🦊", "🐼", "💰", "🏦", "📈", "🚀", "💼", "💎", "🎯"];

const GRADIENT_PRESETS = [
  { name: "Cyan Emerald", class: "bg-gradient-to-tr from-[#00C0F0] to-[#00E676] text-[#1C1D1B]" },
  { name: "Deep Cyber", class: "bg-gradient-to-tr from-[#0ea5e9] to-[#6366f1] text-white" },
  { name: "Neon Violet", class: "bg-gradient-to-tr from-[#7B2CBF] to-[#E0AAFF] text-white" },
  { name: "Dark Titanium", class: "bg-gradient-to-tr from-[#1C1D1B] to-[#3E403D] text-[#00C0F0]" },
  { name: "Emerald Mint", class: "bg-gradient-to-tr from-[#059669] to-[#34d399] text-white" },
  { name: "Golden Amber", class: "bg-gradient-to-tr from-[#d97706] to-[#fde047] text-[#1C1D1B]" },
];

export const Profile: React.FC<ProfileProps> = ({
  username,
  userUid,
  onEditProfile,
  onUpgradeRedirect,
  expenses = [],
  goals = [],
}) => {
  // Profile credential states
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarEmoji, setAvatarEmoji] = useState("🦁");
  const [avatarGradient, setAvatarGradient] = useState(GRADIENT_PRESETS[0].class);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isMobileVerified, setIsMobileVerified] = useState(false);

  // Auto-save notification badges
  const [lastSavedField, setLastSavedField] = useState<string>("");
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("All changes synced");
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Premium & Rewards states
  const [spentPoints, setSpentPoints] = useState(0);
  const [premiumStatus, setPremiumStatus] = useState("Free");

  // Selector popup state
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Profile OTP Modal States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyOtp, setVerifyOtp] = useState(["", "", "", "", "", ""]);
  const [verifyTimer, setVerifyTimer] = useState(0);
  const [verifySysOtp, setVerifySysOtp] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const isInitialLoad = useRef(true);

  // Countdown timer for profile verification OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (verifyTimer > 0) {
      interval = setInterval(() => {
        setVerifyTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [verifyTimer]);

  // Load user data on startup/mount
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("vault_iq_users") || "{}");
    const user = users[username];
    if (user) {
      setMobile(user.mobile || "9876543210");
      setEmail(user.email || `${username}@vaultiq.com`);
      setPassword(user.password || "VaultSecure@2026");
      setAvatarEmoji(user.avatarEmoji || "🦁");
      setAvatarGradient(user.avatarGradient || GRADIENT_PRESETS[0].class);
      setAvatarUrl(user.avatarUrl || "");
      setIsMobileVerified(!!user.mobileVerified);
    } else {
      setMobile("9876543210");
      setEmail(`${username}@vaultiq.com`);
      setPassword("VaultSecure@2026");
      setIsMobileVerified(false);
    }

    const savedSpent = localStorage.getItem(`vault_iq_spent_points_${username}`);
    if (savedSpent) {
      setSpentPoints(parseInt(savedSpent, 10));
    }

    const status = localStorage.getItem(`vault_iq_premium_status_${username}`);
    if (status) {
      setPremiumStatus(status);
    }

    setTimeout(() => {
      isInitialLoad.current = false;
    }, 500);
  }, [username]);

  // Unified persistent auto-save helper function
  const autoSaveCredentials = (fieldKey: string, updates: {
    mobile?: string;
    email?: string;
    password?: string;
    avatarUrl?: string;
    avatarEmoji?: string;
    avatarGradient?: string;
    mobileVerified?: boolean;
  }) => {
    if (!username) return;
    setIsAutoSaving(true);
    setAutoSaveStatus("Saving changes...");

    // 1. Update localStorage
    const users = JSON.parse(localStorage.getItem("vault_iq_users") || "{}");
    users[username] = {
      ...(users[username] || {}),
      ...updates,
      username,
    };
    localStorage.setItem("vault_iq_users", JSON.stringify(users));

    // 2. Update Firestore if UID exists
    const uid = userUid || localStorage.getItem("vault_iq_active_user_uid") || username.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    const firestorePayload: any = {};
    if (updates.email) firestorePayload.email = updates.email;
    if (updates.mobile) firestorePayload.mobile = updates.mobile;
    if (updates.avatarUrl !== undefined) firestorePayload.avatarUrl = updates.avatarUrl;
    if (updates.avatarEmoji !== undefined) firestorePayload.avatarEmoji = updates.avatarEmoji;
    if (updates.avatarGradient !== undefined) firestorePayload.avatarGradient = updates.avatarGradient;

    updateUserProfileInFirestore(uid, firestorePayload).catch((err) => {
      console.warn("Local storage updated; Firestore cloud sync notice:", err);
    });

    // 3. Dispatch update event for instant top-bar and app-wide sync
    try {
      window.dispatchEvent(new Event("vault_iq_user_updated"));
    } catch (e) {
      console.warn("Event dispatch notice:", e);
    }

    // 4. UI feedback
    setLastSavedField(fieldKey);
    setTimeout(() => {
      setIsAutoSaving(false);
      setAutoSaveStatus("✓ Changes saved automatically");
    }, 300);

    setTimeout(() => {
      setLastSavedField("");
    }, 2500);
  };

  // Handler: Change Mobile Number automatically
  const handleMobileChange = (newVal: string) => {
    const sanitized = newVal.replace(/\D/g, "").slice(0, 10);
    setMobile(sanitized);
    autoSaveCredentials("mobile", { mobile: sanitized });
  };

  // Handler: Change Email Address automatically
  const handleEmailChange = (newVal: string) => {
    setEmail(newVal);
    autoSaveCredentials("email", { email: newVal });
  };

  // Handler: Change Vault Password automatically
  const handlePasswordChange = (newVal: string) => {
    setPassword(newVal);
    autoSaveCredentials("password", { password: newVal });
  };

  // Handler: Local image file upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setAvatarUrl(resultStr);
      autoSaveCredentials("avatar", {
        avatarUrl: resultStr,
        avatarEmoji,
        avatarGradient,
      });
      setShowAvatarSelector(false);
    };
    reader.readAsDataURL(file);
  };

  // Handler: Remove photo (revert to emoji)
  const handleRemovePhoto = () => {
    setAvatarUrl("");
    autoSaveCredentials("avatar", {
      avatarUrl: "",
      avatarEmoji,
      avatarGradient,
    });
  };

  // Handler: Select Emoji / Gradient
  const handleSelectPresetAvatar = (emoji: string, gradientClass: string, url: string = "") => {
    setAvatarEmoji(emoji);
    setAvatarGradient(gradientClass);
    setAvatarUrl(url);
    autoSaveCredentials("avatar", {
      avatarEmoji: emoji,
      avatarGradient: gradientClass,
      avatarUrl: url,
    });
    setShowAvatarSelector(false);
  };

  // Phone OTP Verification Handlers
  const handleSendProfileOtp = () => {
    setVerifyError("");
    setVerifySuccess("");
    setVerifyTimer(60);
    setVerifyOtp(["", "", "", "", "", ""]);

    fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, username, purpose: "profile-verify" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVerifySysOtp(data.otp);
          setVerifySuccess(`Verification code dispatched. (Simulated OTP: ${data.otp})`);
        } else {
          setVerifyError(data.error || "Failed to dispatch verification code.");
        }
      })
      .catch((err) => {
        console.error("Send OTP error:", err);
        setVerifyError("OTP service connection error.");
      });
  };

  const handleVerifyProfileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    setVerifySuccess("");

    const enteredOtp = verifyOtp.join("");
    if (enteredOtp.length < 6) {
      setVerifyError("Please enter a 6-digit OTP.");
      return;
    }

    fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, username, otp: enteredOtp, purpose: "profile-verify" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVerifySuccess("Phone verified successfully!");
          setIsMobileVerified(true);
          autoSaveCredentials("mobileVerified", { mobileVerified: true });

          setTimeout(() => {
            setShowVerifyModal(false);
            setVerifySuccess("");
            setVerifyError("");
          }, 1500);
        } else {
          setVerifyError(data.error || "The code entered is incorrect.");
        }
      })
      .catch((err) => {
        console.error("Verify OTP error:", err);
        setVerifyError("Verification request timed out.");
      });
  };

  // Live Metrics calculations
  const totalLifetimeSpending = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalCurrentSavings = goals.reduce((sum, item) => sum + item.currentSavings, 0);
  const earnedPoints = Math.floor(totalCurrentSavings / 10000) * 1000;
  const currentPoints = Math.max(0, earnedPoints - spentPoints);

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="profile-view-container">
      {/* Page Heading & Auto-Save Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase mb-2">
            <Sparkles size={13} />
            <span>Vault ID Security Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 dark:text-white">
            Personal Identity & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Modify profile photo, phone, email, and vault password directly. All changes update and persist automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium self-start sm:self-auto shadow-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>{autoSaveStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Credentials Column (Direct Auto-Editing) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#2A2B29] rounded-4xl p-6 sm:p-8 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* User Avatar Section with Direct Edit Trigger */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#DEDDDA] dark:border-[#3E403D]/60 relative z-10">
            <div className="relative group shrink-0" id="avatar-container">
              <button
                type="button"
                onClick={() => setShowAvatarSelector(true)}
                className="relative block w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-[#1C1D1B] transition-transform hover:scale-105 group cursor-pointer focus:outline-none focus:ring-4 focus:ring-cyan-500/30"
                title="Click to customize avatar photo"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarUrl("")}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-sans ${avatarGradient}`}>
                    {avatarEmoji}
                  </div>
                )}

                {/* Edit overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={22} className="animate-pulse text-[#00C0F0]" />
                </div>
              </button>

              {/* Float Edit Button */}
              <button
                type="button"
                onClick={() => setShowAvatarSelector(true)}
                className="absolute bottom-1 right-1 p-2.5 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-full shadow-lg border-2 border-white dark:border-[#2A2B29] transition-transform hover:scale-110 cursor-pointer"
                title="Change Avatar Photo"
                id="btn-trigger-avatar-modal"
              >
                <Edit3 size={13} />
              </button>
            </div>

            <div className="text-center sm:text-left space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-gray-900 dark:text-white">
                  {username}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                  Active Member
                </span>
              </div>

              <div className="text-xs text-gray-400 font-mono">
                VAULT-ID: VIQ-{username.slice(0, 3).toUpperCase()}-{Math.floor(1000 + Math.random() * 9000)}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAvatarSelector(true)}
                  className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-xl text-xs font-semibold border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Camera size={13} /> Change Photo
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1"
                    title="Remove custom photo and reset to emoji"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Automatic Real-Time Editable Credential Inputs */}
          <div className="space-y-4 pt-1 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                Editable Account Credentials
              </span>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                Auto-saved on keystroke
              </span>
            </div>

            {/* 1. Mobile Number (Auto-Saved) */}
            <div className="p-4 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-2 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Smartphone size={15} className="text-[#00C0F0]" />
                  <span>Mobile Phone Number</span>
                </label>
                {lastSavedField === "mobile" && (
                  <span className="text-[10px] text-emerald-500 font-mono font-bold flex items-center gap-1 animate-fadeIn">
                    <CheckCircle2 size={12} /> Auto-Saved
                  </span>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-3 text-xs font-mono font-bold text-gray-400 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-3 py-2.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-sm font-mono font-semibold text-[#2D302D] dark:text-[#E4E3E0] outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                    id="profile-input-mobile"
                  />
                </div>

                {mobile && (
                  isMobileVerified ? (
                    <span className="px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
                      <Check size={13} /> Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowVerifyModal(true);
                        handleSendProfileOtp();
                      }}
                      className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] text-xs font-bold shadow-xs hover:shadow-cyan-500/25 transition-all cursor-pointer shrink-0"
                      id="btn-verify-profile-phone"
                    >
                      Verify OTP
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 2. Email Address (Auto-Saved) */}
            <div className="p-4 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-2 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail size={15} className="text-[#00C0F0]" />
                  <span>Official Email Address</span>
                </label>
                {lastSavedField === "email" && (
                  <span className="text-[10px] text-emerald-500 font-mono font-bold flex items-center gap-1 animate-fadeIn">
                    <CheckCircle2 size={12} /> Auto-Saved
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder={`${username}@vaultiq.com`}
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-sm font-semibold text-[#2D302D] dark:text-[#E4E3E0] outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                  id="profile-input-email"
                />
              </div>
            </div>

            {/* 3. Vault Secure Password (Auto-Saved) */}
            <div className="p-4 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-2 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Lock size={15} className="text-[#00C0F0]" />
                  <span>Vault Secure Password</span>
                </label>
                {lastSavedField === "password" && (
                  <span className="text-[10px] text-emerald-500 font-mono font-bold flex items-center gap-1 animate-fadeIn">
                    <CheckCircle2 size={12} /> Auto-Saved
                  </span>
                )}
              </div>

              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter vault password"
                  className="w-full pl-3 pr-10 py-2.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-sm font-mono font-semibold text-[#2D302D] dark:text-[#E4E3E0] outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                  id="profile-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Financial Ledger Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 sm:p-7 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#DEDDDA] dark:border-[#3E403D]/60 pb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Wallet className="text-[#00C0F0]" size={16} />
                <span>Live Ledger Summary</span>
              </h3>
              <button
                onClick={onUpgradeRedirect}
                className="px-3 py-1 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-xs hover:shadow-cyan-500/25 transition-all cursor-pointer"
                id="profile-upgrade-badge"
              >
                <Sparkles size={11} /> Upgrade
              </button>
            </div>

            {/* Financial Summary Metric Table */}
            <div className="border border-[#DEDDDA] dark:border-[#3E403D] rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse" id="financial-summary-table">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1C1D1B]/40 text-[10px] uppercase font-mono font-bold text-gray-400 border-b border-[#DEDDDA] dark:border-[#3E403D]">
                    <th className="p-3">Financial Metric</th>
                    <th className="p-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEDDDA] dark:divide-[#3E403D]">
                  {/* Premium Status */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-[#1C1D1B]/10 transition-colors">
                    <td className="p-3.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-cyan-500/10 text-[#00C0F0]">
                          <Sparkles size={14} />
                        </span>
                        <span>Vault Subscription</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right text-xs font-bold text-gray-900 dark:text-white font-mono">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                        premiumStatus !== "Free"
                          ? "bg-gradient-to-r from-[#00C0F0]/20 to-[#00E676]/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      }`}>
                        {premiumStatus}
                      </span>
                    </td>
                  </tr>

                  {/* Credit Rewards Points */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-[#1C1D1B]/10 transition-colors">
                    <td className="p-3.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                          <Coins size={14} />
                        </span>
                        <span>Accumulated Credit Points</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right text-sm font-bold text-amber-500 dark:text-amber-400 font-mono">
                      {currentPoints.toLocaleString()} PTS
                    </td>
                  </tr>

                  {/* Total Spending */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-[#1C1D1B]/10 transition-colors">
                    <td className="p-3.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                          <TrendingDown size={14} />
                        </span>
                        <span>Lifetime Spending</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right text-sm font-bold text-gray-900 dark:text-white font-mono">
                      ₹{totalLifetimeSpending.toLocaleString("en-IN")}
                    </td>
                  </tr>

                  {/* Total Savings */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-[#1C1D1B]/10 transition-colors">
                    <td className="p-3.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                          <TrendingUp size={14} />
                        </span>
                        <span>Total Current Savings</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{totalCurrentSavings.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quick Security Status */}
            <div className="p-3.5 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-2xl border border-cyan-500/20 flex items-center gap-3">
              <ShieldCheck className="text-[#00C0F0] shrink-0" size={20} />
              <div className="text-xs">
                <span className="font-bold text-gray-800 dark:text-gray-200 block">
                  DPDP 2023 End-to-End Encryption
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                  All profile updates are securely cached locally and synced to your encrypted vault.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          AVATAR CUSTOMIZATION MODAL DIALOGUE
         ========================================== */}
      <AnimatePresence>
        {showAvatarSelector && (
          <div className="fixed inset-0 bg-black/60 z-999 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#2A2B29] rounded-4xl border border-[#DEDDDA] dark:border-[#3E403D] p-6 space-y-6 shadow-2xl relative"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono font-bold uppercase">
                  <Sparkles size={11} /> Auto-Syncs
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">
                  Customize Profile Avatar
                </h3>
                <p className="text-xs text-gray-400">
                  Upload a photo from your device, choose an avatar character, or input an image URL.
                </p>
              </div>

              {/* 1. Device Upload Action Bar */}
              <div className="p-4 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-3">
                <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Device Photo Upload
                </span>
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  onChange={handlePhotoFileUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-cyan-500/25"
                    id="btn-upload-profile-photo"
                  >
                    <Upload size={14} /> Upload Local Image
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-rose-200 dark:border-rose-900/30"
                      id="btn-remove-profile-photo"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Emojis row */}
              <div className="space-y-2">
                <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Select Preset Character
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSelectPresetAvatar(emoji, avatarGradient, "")}
                      className={`h-11 rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                        avatarEmoji === emoji && !avatarUrl
                          ? "bg-cyan-500/15 border-2 border-cyan-500 scale-105"
                          : "bg-gray-50 dark:bg-[#1C1D1B]/40 hover:bg-gray-100 hover:scale-105 border border-transparent"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Gradient background selector */}
              <div className="space-y-2">
                <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Select Color Gradient
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {GRADIENT_PRESETS.map((grad) => (
                    <button
                      key={grad.name}
                      onClick={() => handleSelectPresetAvatar(avatarEmoji, grad.class, "")}
                      className={`p-2.5 rounded-xl text-[11px] font-semibold text-center transition-all cursor-pointer ${grad.class} ${
                        avatarGradient === grad.class && !avatarUrl
                          ? "ring-2 ring-cyan-500 scale-102"
                          : "hover:scale-102 opacity-90 hover:opacity-100"
                      }`}
                    >
                      {grad.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Image URL link */}
              <div className="space-y-2 pt-1 border-t border-dashed border-[#DEDDDA] dark:border-[#3E403D]">
                <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Or Paste Direct Image Web URL
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="flex-1 p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                  />
                  {avatarUrl && (
                    <button
                      onClick={() => handleSelectPresetAvatar(avatarEmoji, avatarGradient, avatarUrl)}
                      className="p-2.5 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl shadow-xs hover:scale-105 transition-all cursor-pointer"
                      title="Save Avatar URL"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarSelector(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Phone Verification Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-4xl p-6 max-w-sm w-full shadow-2xl space-y-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-500/10 text-[#00C0F0] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-cyan-500/20">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Phone Verification
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We have sent a 6-digit OTP code to +91 {mobile}
                </p>
              </div>

              {/* Success/Error displays */}
              {verifySuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                  {verifySuccess}
                </div>
              )}
              {verifyError && (
                <div className="p-3 bg-rose-50 border border-rose-500/30 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl text-xs font-semibold">
                  {verifyError}
                </div>
              )}

              <form onSubmit={handleVerifyProfileOtp} className="space-y-6">
                <div className="flex justify-between gap-2 max-w-70 mx-auto">
                  {verifyOtp.map((digit, index) => (
                    <input
                      key={index}
                      id={`profile-verify-otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        if (isNaN(Number(e.target.value))) return;
                        const newOtp = [...verifyOtp];
                        newOtp[index] = e.target.value.slice(-1);
                        setVerifyOtp(newOtp);

                        if (e.target.value && index < 5) {
                          const nextInput = document.getElementById(`profile-verify-otp-${index + 1}`);
                          nextInput?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !verifyOtp[index] && index > 0) {
                          const prevInput = document.getElementById(`profile-verify-otp-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      className="w-9 h-11 text-center text-lg font-mono font-bold bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border-2 border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:border-cyan-500 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    id="btn-confirm-verify-otp"
                  >
                    Confirm OTP Verification
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    {verifyTimer > 0 ? (
                      <span>Resend code in {verifyTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendProfileOtp}
                        className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                      >
                        Resend OTP Code
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowVerifyModal(false);
                      setVerifyError("");
                      setVerifySuccess("");
                    }}
                    className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-[#1C1D1B]/30 dark:hover:bg-[#1C1D1B]/55 text-gray-500 dark:text-gray-400 rounded-xl text-xs font-semibold cursor-pointer transition-all text-center"
                  >
                    Cancel Verification
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
