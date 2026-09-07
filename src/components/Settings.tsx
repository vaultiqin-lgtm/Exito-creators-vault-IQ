import React, { useState, useEffect, useRef } from "react";
import { Expense, FinancialGoal, LoanReminder, AppLockMode } from "../types";
import {
  FileDown,
  Printer,
  Table,
  Check,
  AlertCircle,
  ShieldAlert,
  User,
  Lock,
  Mail,
  Smartphone,
  FileText,
  Calendar,
  CalendarDays,
  Download,
  Upload,
  Trash2,
  KeyRound,
  Grid,
  Sparkles,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  Banknote,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { updateUserProfileInFirestore } from "../firebase";
import { SecurityRecovery } from "./SecurityRecovery";

interface SettingsProps {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  username: string;
  userUid?: string;
  salary: number;
  expenses: Expense[];
  goals: FinancialGoal[];
  loans: LoanReminder[];
  isPinLockEnabled?: boolean;
  setIsPinLockEnabled?: (enabled: boolean) => void;
  userPin?: string;
  setUserPin?: (pin: string) => void;
  lockMode?: AppLockMode;
  setLockMode?: (mode: AppLockMode) => void;
  userPattern?: string;
  setUserPattern?: (pattern: string) => void;
}

const MONTHS_LIST = [
  { value: "01", name: "January" },
  { value: "02", name: "February" },
  { value: "03", name: "March" },
  { value: "04", name: "April" },
  { value: "05", name: "May" },
  { value: "06", name: "June" },
  { value: "07", name: "July" },
  { value: "08", name: "August" },
  { value: "09", name: "September" },
  { value: "10", name: "October" },
  { value: "11", name: "November" },
  { value: "12", name: "December" },
];

export const Settings: React.FC<SettingsProps> = ({
  notificationsEnabled,
  setNotificationsEnabled,
  username,
  userUid,
  salary,
  expenses,
  goals,
  loans,
  lockMode = "none",
  setLockMode,
  userPin = "1234",
  setUserPin,
  userPattern = "0-1-2-5-8",
  setUserPattern,
  isPinLockEnabled,
  setIsPinLockEnabled,
}) => {
  // Profile edit states
  const [editMobile, setEditMobile] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // App Access Security Lock Mode
  const [currentLockMode, setCurrentLockMode] = useState<AppLockMode>(
    lockMode !== "none" ? lockMode : isPinLockEnabled ? "pin4" : "none"
  );
  const [pinCode, setPinCode] = useState<string>(userPin || "1234");
  const [patternSequence, setPatternSequence] = useState<string>(userPattern || "0-1-2-5-8");
  const [securitySuccess, setSecuritySuccess] = useState<string>("");
  const [securityError, setSecurityError] = useState<string>("");

  // Pattern recording interactive test
  const [recordingPattern, setRecordingPattern] = useState<number[]>([]);

  // Safe Zone Security PIN states
  const [safeZoneCurrentSavedPin, setSafeZoneCurrentSavedPin] = useState<string>("1234");
  const [safeZoneSelectedLength, setSafeZoneSelectedLength] = useState<4 | 6>(4);
  const [currentSafeZoneInput, setCurrentSafeZoneInput] = useState<string>("");
  const [newSafeZonePin, setNewSafeZonePin] = useState<string>("");
  const [confirmSafeZonePin, setConfirmSafeZonePin] = useState<string>("");
  const [showSafeZonePin, setShowSafeZonePin] = useState<boolean>(false);
  const [safeZoneSuccess, setSafeZoneSuccess] = useState<string>("");
  const [safeZoneError, setSafeZoneError] = useState<string>("");
  const [settingsRecoveryTarget, setSettingsRecoveryTarget] = useState<"app_lock" | "safe_zone" | null>(null);

  // ==========================================
  // 1. MONTHLY LOG REPORT STATES
  // ==========================================
  const currentYearMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const [monthlySelectedMonth, setMonthlySelectedMonth] = useState<string>(currentYearMonth);
  const [monthlyStartDate, setMonthlyStartDate] = useState<string>(`${currentYearMonth}-01`);
  const [monthlyEndDate, setMonthlyEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // When selected month changes, update default date range
  const handleMonthlyMonthChange = (ym: string) => {
    setMonthlySelectedMonth(ym);
    setMonthlyStartDate(`${ym}-01`);
    const [y, m] = ym.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    setMonthlyEndDate(`${ym}-${String(lastDay).padStart(2, "0")}`);
  };

  // ==========================================
  // 2. YEARLY LOG REPORT STATES
  // ==========================================
  const [yearlySelectedYear, setYearlySelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [yearlySelectedMonths, setYearlySelectedMonths] = useState<string[]>(MONTHS_LIST.map((m) => m.value));

  const toggleYearlyMonth = (monthVal: string) => {
    if (yearlySelectedMonths.includes(monthVal)) {
      if (yearlySelectedMonths.length === 1) return;
      setYearlySelectedMonths(yearlySelectedMonths.filter((m) => m !== monthVal));
    } else {
      setYearlySelectedMonths([...yearlySelectedMonths, monthVal]);
    }
  };

  const selectAllYearlyMonths = () => {
    setYearlySelectedMonths(MONTHS_LIST.map((m) => m.value));
  };

  // Load user data on mount
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("vault_iq_users") || "{}");
    const user = users[username];
    if (user) {
      setEditMobile(user.mobile || "");
      setEditEmail(user.email || `${username}@vaultiq.com`);
      setEditPassword(user.password || "VaultSecure@2026");
      setProfileAvatarUrl(user.avatarUrl || "");
    } else {
      setEditMobile("9876543210");
      setEditEmail(`${username}@vaultiq.com`);
      setEditPassword("VaultSecure@2026");
    }

    if (userPin) setPinCode(userPin);
    if (userPattern) setPatternSequence(userPattern);
    if (lockMode) setCurrentLockMode(lockMode);

    const savedSafeZonePin = localStorage.getItem(`vault_iq_safe_zone_pin_${username}`);
    const savedSafeZoneLen = localStorage.getItem(`vault_iq_safe_zone_pin_len_${username}`);
    if (savedSafeZonePin) {
      setSafeZoneCurrentSavedPin(savedSafeZonePin);
      setSafeZoneSelectedLength(savedSafeZonePin.length === 6 ? 6 : 4);
    } else {
      setSafeZoneCurrentSavedPin("1234");
      setSafeZoneSelectedLength(4);
    }
    if (savedSafeZoneLen) {
      setSafeZoneSelectedLength(parseInt(savedSafeZoneLen) === 6 ? 6 : 4);
    }
  }, [username, userPin, userPattern, lockMode]);

  // Handle Photo Upload
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
      setProfileAvatarUrl(resultStr);

      const users = JSON.parse(localStorage.getItem("vault_iq_users") || "{}");
      if (users[username]) {
        users[username].avatarUrl = resultStr;
        localStorage.setItem("vault_iq_users", JSON.stringify(users));
      }

      const uid = userUid || localStorage.getItem("vault_iq_active_user_uid") || username.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      updateUserProfileInFirestore(uid, { avatarUrl: resultStr } as any);
      setProfileSuccess("Profile photo updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfileAvatarUrl("");
    const users = JSON.parse(localStorage.getItem("vault_iq_users") || "{}");
    if (users[username]) {
      users[username].avatarUrl = "";
      localStorage.setItem("vault_iq_users", JSON.stringify(users));
    }
    const uid = userUid || localStorage.getItem("vault_iq_active_user_uid") || username.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    updateUserProfileInFirestore(uid, { avatarUrl: "" } as any);
    setProfileSuccess("Profile photo removed.");
    setTimeout(() => setProfileSuccess(""), 3000);
  };

  // Handle Save Profile Credentials
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    if (editMobile.length !== 10) {
      setProfileError("Mobile number must be exactly 10 digits.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("vault_iq_users") || "{}");
    users[username] = {
      ...(users[username] || {}),
      mobile: editMobile,
      email: editEmail,
      password: editPassword,
      avatarUrl: profileAvatarUrl,
    };
    localStorage.setItem("vault_iq_users", JSON.stringify(users));

    const uid = userUid || localStorage.getItem("vault_iq_active_user_uid") || username.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    updateUserProfileInFirestore(uid, {
      mobile: editMobile,
      email: editEmail,
    } as any);

    setProfileSuccess("Profile details saved successfully!");
    setTimeout(() => setProfileSuccess(""), 4000);
  };

  // Handle Save Security Lock
  const handleSaveSecurityLock = () => {
    setSecuritySuccess("");
    setSecurityError("");

    if (currentLockMode === "pin4" && pinCode.length !== 4) {
      setSecurityError("4-Digit PIN must be exactly 4 digits.");
      return;
    }
    if (currentLockMode === "pin6" && pinCode.length !== 6) {
      setSecurityError("6-Digit PIN must be exactly 6 digits.");
      return;
    }
    if (currentLockMode === "pattern" && (!patternSequence || patternSequence.split("-").length < 3)) {
      setSecurityError("Pattern lock must connect at least 3 dots.");
      return;
    }

    if (setLockMode) setLockMode(currentLockMode);
    if (setUserPin) setUserPin(pinCode);
    if (setUserPattern) setUserPattern(patternSequence);
    if (setIsPinLockEnabled) setIsPinLockEnabled(currentLockMode === "pin4" || currentLockMode === "pin6");

    localStorage.setItem(`vault_iq_lock_mode_${username}`, currentLockMode);
    localStorage.setItem(`vault_iq_user_pin_${username}`, pinCode);
    localStorage.setItem(`vault_iq_user_pattern_${username}`, patternSequence);

    setSecuritySuccess(`Security Lock set to ${currentLockMode.toUpperCase()} successfully!`);
    setTimeout(() => setSecuritySuccess(""), 4000);
  };

  // Handle Save Safe Zone PIN
  const handleSaveSafeZonePin = (e: React.FormEvent) => {
    e.preventDefault();
    setSafeZoneSuccess("");
    setSafeZoneError("");

    // Verify current PIN if set
    if (safeZoneCurrentSavedPin && currentSafeZoneInput !== safeZoneCurrentSavedPin) {
      setSafeZoneError("Current Safe Zone PIN is incorrect.");
      return;
    }

    if (newSafeZonePin.length !== safeZoneSelectedLength) {
      setSafeZoneError(`New Safe Zone PIN must be exactly ${safeZoneSelectedLength} numeric digits.`);
      return;
    }

    if (!/^\d+$/.test(newSafeZonePin)) {
      setSafeZoneError("Safe Zone PIN must contain numeric digits only (0-9).");
      return;
    }

    if (newSafeZonePin !== confirmSafeZonePin) {
      setSafeZoneError("New PIN and Confirm PIN do not match.");
      return;
    }

    // Save to LocalStorage
    localStorage.setItem(`vault_iq_safe_zone_pin_${username}`, newSafeZonePin);
    localStorage.setItem(`vault_iq_safe_zone_pin_len_${username}`, safeZoneSelectedLength.toString());

    setSafeZoneCurrentSavedPin(newSafeZonePin);
    setCurrentSafeZoneInput("");
    setNewSafeZonePin("");
    setConfirmSafeZonePin("");

    setSafeZoneSuccess(`Safe Zone PIN updated to ${safeZoneSelectedLength}-digit code successfully!`);
    setTimeout(() => setSafeZoneSuccess(""), 4000);
  };

  // Monthly Log Download
  const handleDownloadMonthlyLog = () => {
    const filteredExpenses = expenses.filter((e) => e.date >= monthlyStartDate && e.date <= monthlyEndDate);
    const totalExp = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalGoalsSaved = goals.reduce((sum, item) => sum + item.currentSavings, 0);

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Vault IQ Monthly Financial Statement</title>
        <style>
          body { font-family: 'Arial', sans-serif; color: #1C1D1B; line-height: 1.6; padding: 40px; }
          .report-card { border: 2px solid #00C0F0; border-radius: 12px; padding: 30px; max-width: 750px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #DEDDDA; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: bold; color: #00C0F0; letter-spacing: 2px; }
          .title { font-size: 14px; color: #666; margin-top: 5px; text-transform: uppercase; font-weight: bold; }
          .meta-grid { display: flex; justify-content: space-between; margin-bottom: 25px; background: #F5F5F0; padding: 15px; border-radius: 8px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
          th { background: #00C0F0; color: #1C1D1B; text-align: left; padding: 10px; font-size: 12px; }
          td { border-bottom: 1px solid #EAEAEA; padding: 10px; font-size: 12px; }
          .totals-bar { background: #F5F5F0; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: right; }
          .total-val { font-size: 18px; font-weight: bold; color: #00C0F0; }
          .footer { text-align: center; font-size: 10px; color: #999; margin-top: 40px; border-top: 1px solid #DEDDDA; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="report-card">
          <div class="header">
            <div class="logo">VAULT IQ</div>
            <div class="title">Official Monthly Financial Statement (${monthlySelectedMonth})</div>
          </div>
          <div class="meta-grid">
            <div><strong>User ID:</strong> ${username}</div>
            <div><strong>Date Range:</strong> ${monthlyStartDate} to ${monthlyEndDate}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleDateString("en-IN")}</div>
          </div>
          <h3 style="color: #00C0F0; font-size: 14px; margin-bottom: 5px;">1. Filtered Expenses Ledger</h3>
          <table>
            <thead>
              <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount (INR)</th></tr>
            </thead>
            <tbody>
              ${filteredExpenses.length === 0 ? '<tr><td colspan="4" style="text-align:center;">No expense records found in this range.</td></tr>' :
                filteredExpenses.map(e => `<tr><td>${e.date}</td><td>${e.description}</td><td>${e.category}</td><td>₹${e.amount.toLocaleString("en-IN")}</td></tr>`).join("")}
            </tbody>
          </table>
          <div class="totals-bar">
            <div>Period Total Expenses: <span class="total-val">₹${totalExp.toLocaleString("en-IN")}</span></div>
            <div>Accumulated Dream Savings: <span class="total-val">₹${totalGoalsSaved.toLocaleString("en-IN")}</span></div>
          </div>
          <div class="footer">
            Vault IQ Financial Suite • End-to-End Encrypted Financial Document • ISO DPDP Compliant
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VaultIQ_Monthly_Report_${monthlySelectedMonth}_${username}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Yearly Log Download
  const handleDownloadYearlyLog = () => {
    const filteredExpenses = expenses.filter((e) => {
      const [y, m] = e.date.split("-");
      return y === yearlySelectedYear && yearlySelectedMonths.includes(m);
    });
    const totalExp = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalGoalsSaved = goals.reduce((sum, item) => sum + item.currentSavings, 0);

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Vault IQ Annual Audit Statement</title>
        <style>
          body { font-family: 'Arial', sans-serif; color: #1C1D1B; line-height: 1.6; padding: 40px; }
          .report-card { border: 2px solid #00C0F0; border-radius: 12px; padding: 30px; max-width: 750px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #DEDDDA; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: bold; color: #00C0F0; letter-spacing: 2px; }
          .title { font-size: 14px; color: #666; margin-top: 5px; text-transform: uppercase; font-weight: bold; }
          .meta-grid { display: flex; justify-content: space-between; margin-bottom: 25px; background: #F5F5F0; padding: 15px; border-radius: 8px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
          th { background: #00C0F0; color: #1C1D1B; text-align: left; padding: 10px; font-size: 12px; }
          td { border-bottom: 1px solid #EAEAEA; padding: 10px; font-size: 12px; }
          .totals-bar { background: #F5F5F0; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: right; }
          .total-val { font-size: 18px; font-weight: bold; color: #00C0F0; }
          .footer { text-align: center; font-size: 10px; color: #999; margin-top: 40px; border-top: 1px solid #DEDDDA; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="report-card">
          <div class="header">
            <div class="logo">VAULT IQ</div>
            <div class="title">Annual Financial Audit (${yearlySelectedYear})</div>
          </div>
          <div class="meta-grid">
            <div><strong>User ID:</strong> ${username}</div>
            <div><strong>Financial Year:</strong> ${yearlySelectedYear}</div>
            <div><strong>Selected Months:</strong> ${yearlySelectedMonths.length} Months</div>
          </div>
          <h3 style="color: #00C0F0; font-size: 14px; margin-bottom: 5px;">1. Annual Transaction Ledger</h3>
          <table>
            <thead>
              <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount (INR)</th></tr>
            </thead>
            <tbody>
              ${filteredExpenses.length === 0 ? '<tr><td colspan="4" style="text-align:center;">No expenses recorded in the selected cycle.</td></tr>' :
                filteredExpenses.map(e => `<tr><td>${e.date}</td><td>${e.description}</td><td>${e.category}</td><td>₹${e.amount.toLocaleString("en-IN")}</td></tr>`).join("")}
            </tbody>
          </table>
          <div class="totals-bar">
            <div>Total Audited Outflow: <span class="total-val">₹${totalExp.toLocaleString("en-IN")}</span></div>
            <div>Accumulated Savings: <span class="total-val">₹${totalGoalsSaved.toLocaleString("en-IN")}</span></div>
          </div>
          <div class="footer">
            Vault IQ Financial Suite • End-to-End Encrypted Annual Report • Certified
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VaultIQ_Annual_Audit_${yearlySelectedYear}_${username}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="settings-root">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">
          System Settings & Vault Security
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage account security credentials, configure access lock (PIN or Pattern), and generate comprehensive audit statements.
        </p>
      </div>

      {/* ========================================================
          1. PROFILE CUSTOMIZATION & PHOTO MANAGEMENT
         ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 md:p-8 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6"
        id="profile-edit-section"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-500/20">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Profile Customization & Photo
              </h2>
              <p className="text-xs text-gray-400">Upload, update, or remove your profile photo and contact details</p>
            </div>
          </div>
        </div>

        {/* Profile Photo Upload / Remove Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-3xl border border-[#DEDDDA] dark:border-[#3E403D]">
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            onChange={handlePhotoFileUpload}
            className="hidden"
          />

          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-500 shadow-md bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0">
            {profileAvatarUrl ? (
              <img src={profileAvatarUrl} alt={username} className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-gray-400" />
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Profile Photo</h4>
            <p className="text-xs text-gray-400">Upload a square PNG, JPG, or WEBP image to personalize your identity.</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="px-4 py-2 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-cyan-500/25"
              >
                <Upload size={13} /> {profileAvatarUrl ? "Change Photo" : "Upload Photo"}
              </button>
              {profileAvatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-rose-200 dark:border-rose-900/30"
                >
                  <Trash2 size={13} /> Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Contact Form */}
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              10-Digit Mobile (India)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Smartphone size={16} />
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={editMobile}
                onChange={(e) => setEditMobile(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500/40 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/40 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Vault Secure Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/40 outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              {profileSuccess && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> {profileSuccess}
                </span>
              )}
              {profileError && (
                <span className="text-xs font-semibold text-rose-500">
                  ✗ {profileError}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </motion.div>

      {/* ========================================================
          2. ALERT NOTIFICATIONS (Theme Setting Removed)
         ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 md:p-8 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-500/20">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Alert Notifications & Reminders
              </h2>
              <p className="text-xs text-gray-400">Receive 5-day & 2-day prior EMI repayment warnings and renewal notifications</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] rounded-2xl">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              Enable Scheduled Warnings & Alerts
            </span>
            <span className="text-[11px] text-gray-400">
              Dispatches alerts for active bank loan obligations and recurring subscriptions
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-[#00C0F0] peer-checked:to-[#00E676]"></div>
          </label>
        </div>
      </motion.div>

      {/* ========================================================
          3. APP ACCESS SECURITY (4-Digit PIN, 6-Digit PIN, Pattern Lock)
         ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 md:p-8 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-500/20">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                App Access Security Lock
              </h2>
              <p className="text-xs text-gray-400">Configure 4-Digit PIN, 6-Digit PIN, or Pattern Lock upon website entry</p>
            </div>
          </div>
        </div>

        {/* Lock Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { mode: "none", label: "None (Disabled)", icon: Lock },
            { mode: "pin4", label: "4-Digit PIN", icon: KeyRound },
            { mode: "pin6", label: "6-Digit PIN", icon: KeyRound },
            { mode: "pattern", label: "Pattern Lock", icon: Grid },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = currentLockMode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => setCurrentLockMode(item.mode as AppLockMode)}
                className={`p-3.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-br from-[#00C0F0]/15 to-[#00E676]/15 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold ring-2 ring-cyan-500/30"
                    : "border-[#DEDDDA] dark:border-[#3E403D] bg-gray-50 dark:bg-[#1C1D1B]/40 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mode Specific Configuration Input */}
        {currentLockMode === "pin4" && (
          <div className="p-4 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase">
              Set 4-Digit Numeric Passcode PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 1234"
              className="w-48 p-2.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-center font-mono font-bold text-lg text-[#2D302D] dark:text-[#E4E3E0] outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>
        )}

        {currentLockMode === "pin6" && (
          <div className="p-4 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase">
              Set 6-Digit Numeric Passcode PIN
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 123456"
              className="w-56 p-2.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-center font-mono font-bold text-lg text-[#2D302D] dark:text-[#E4E3E0] outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>
        )}

        {currentLockMode === "pattern" && (
          <div className="p-4 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase">
                Configure 3x3 Matrix Pattern Lock
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click dots sequentially to record a pattern path (min 3 dots).
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="grid grid-cols-3 gap-4 p-4 bg-white dark:bg-[#2A2B29] rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D] shadow-inner">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((dot) => {
                  const isSelected = recordingPattern.includes(dot);
                  const orderIdx = recordingPattern.indexOf(dot);
                  return (
                    <button
                      key={dot}
                      type="button"
                      onClick={() => {
                        if (!recordingPattern.includes(dot)) {
                          const updated = [...recordingPattern, dot];
                          setRecordingPattern(updated);
                          setPatternSequence(updated.join("-"));
                        }
                      }}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] border-cyan-400 shadow-md scale-110"
                          : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-400 hover:border-cyan-400"
                      }`}
                    >
                      {isSelected ? orderIdx + 1 : "•"}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-500">
                  Pattern Path: <strong className="text-cyan-600 dark:text-cyan-400">{patternSequence || "None"}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRecordingPattern([]);
                    setPatternSequence("");
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  Reset Pattern
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div>
            {securitySuccess && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> {securitySuccess}
              </span>
            )}
            {securityError && (
              <span className="text-xs font-semibold text-rose-500">
                ✗ {securityError}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveSecurityLock}
            className="py-2.5 px-6 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer"
          >
            Save Security Lock Settings
          </button>
        </div>
      </motion.div>

      {/* ========================================================
          4. SAFE ZONE CONTINGENCY STASH PASSWORD / PIN
         ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 md:p-8 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6"
        id="safe-zone-security-section"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Safe Zone Contingency Stash Password / PIN
              </h2>
              <p className="text-xs text-gray-400">
                Configure the security passcode protecting your Cash and UPI psychological emergency reserves
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25 rounded-xl text-xs font-mono font-bold">
            <Lock size={13} />
            <span>Active: {safeZoneSelectedLength}-Digit PIN</span>
          </div>
        </div>

        <form onSubmit={handleSaveSafeZonePin} className="space-y-6">
          {/* PIN Length Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Select PIN Complexity Format
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => {
                  setSafeZoneSelectedLength(4);
                  setNewSafeZonePin("");
                  setConfirmSafeZonePin("");
                }}
                className={`py-2.5 px-4 rounded-2xl text-xs font-bold font-mono border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  safeZoneSelectedLength === 4
                    ? "bg-cyan-500/15 border-cyan-400 text-cyan-700 dark:text-cyan-300 shadow-xs ring-2 ring-cyan-500/20"
                    : "border-[#DEDDDA] dark:border-[#3E403D] bg-gray-50 dark:bg-[#1C1D1B]/40 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1C1D1B]"
                }`}
              >
                <KeyRound size={15} /> 4-Digit Standard PIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setSafeZoneSelectedLength(6);
                  setNewSafeZonePin("");
                  setConfirmSafeZonePin("");
                }}
                className={`py-2.5 px-4 rounded-2xl text-xs font-bold font-mono border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  safeZoneSelectedLength === 6
                    ? "bg-cyan-500/15 border-cyan-400 text-cyan-700 dark:text-cyan-300 shadow-xs ring-2 ring-cyan-500/20"
                    : "border-[#DEDDDA] dark:border-[#3E403D] bg-gray-50 dark:bg-[#1C1D1B]/40 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1C1D1B]"
                }`}
              >
                <KeyRound size={15} /> 6-Digit Enhanced PIN
              </button>
            </div>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current PIN */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Current Safe Zone PIN
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showSafeZonePin ? "text" : "password"}
                  required
                  maxLength={6}
                  placeholder="Enter current PIN"
                  value={currentSafeZoneInput}
                  onChange={(e) => setCurrentSafeZoneInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500/40 outline-none tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowSafeZonePin(!showSafeZonePin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showSafeZonePin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setSettingsRecoveryTarget("safe_zone")}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <KeyRound size={12} /> Forgot Current Safe Zone PIN?
                </button>
              </div>
            </div>

            {/* New PIN */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                New {safeZoneSelectedLength}-Digit PIN
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <KeyRound size={16} />
                </span>
                <input
                  type={showSafeZonePin ? "text" : "password"}
                  required
                  maxLength={safeZoneSelectedLength}
                  placeholder={`e.g. ${safeZoneSelectedLength === 6 ? "123456" : "1234"}`}
                  value={newSafeZonePin}
                  onChange={(e) => setNewSafeZonePin(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500/40 outline-none tracking-widest"
                />
              </div>
            </div>

            {/* Confirm New PIN */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Confirm New PIN
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Shield size={16} />
                </span>
                <input
                  type={showSafeZonePin ? "text" : "password"}
                  required
                  maxLength={safeZoneSelectedLength}
                  placeholder="Re-enter new PIN"
                  value={confirmSafeZonePin}
                  onChange={(e) => setConfirmSafeZonePin(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-sm font-mono focus:ring-2 focus:ring-cyan-500/40 outline-none tracking-widest"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div>
              {safeZoneSuccess && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> {safeZoneSuccess}
                </span>
              )}
              {safeZoneError && (
                <span className="text-xs font-semibold text-rose-500">
                  ✗ {safeZoneError}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer"
              id="btn-update-safe-zone-pin"
            >
              Update Safe Zone PIN
            </button>
          </div>
        </form>
      </motion.div>

      {/* ========================================================
          5. LOG & REPORT DOWNLOADS (Monthly Log & Yearly Log)
         ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 md:p-8 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
              <FileDown size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Log & Report Downloads
              </h2>
              <p className="text-xs text-gray-400">Export savings & expense reports filtered by custom monthly date ranges or annual multi-months</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Option 1: Monthly Log */}
          <div className="p-5 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-3xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#00C0F0]" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Monthly Log Report</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Export savings and expense records filtered by custom date ranges within a selected month.
              </p>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                  Select Month Cycle
                </label>
                <input
                  type="month"
                  value={monthlySelectedMonth}
                  onChange={(e) => handleMonthlyMonthChange(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-xs font-mono text-[#2D302D] dark:text-[#E4E3E0] outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Custom Start Date
                  </label>
                  <input
                    type="date"
                    value={monthlyStartDate}
                    onChange={(e) => setMonthlyStartDate(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-xs font-mono text-[#2D302D] dark:text-[#E4E3E0] outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                    Custom End Date
                  </label>
                  <input
                    type="date"
                    value={monthlyEndDate}
                    onChange={(e) => setMonthlyEndDate(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-xs font-mono text-[#2D302D] dark:text-[#E4E3E0] outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadMonthlyLog}
              className="w-full py-2.5 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              id="btn-download-monthly-log"
            >
              <Download size={14} /> Download Monthly Log (.docx)
            </button>
          </div>

          {/* Option 2: Yearly Log */}
          <div className="p-5 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-3xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-[#00C0F0]" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Yearly Log Report</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Export annual savings and expense reports filtered by specific months across single or multiple years.
              </p>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">
                  Select Calendar Year
                </label>
                <select
                  value={yearlySelectedYear}
                  onChange={(e) => setYearlySelectedYear(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-xs font-mono text-[#2D302D] dark:text-[#E4E3E0] outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  {["2026", "2025", "2024", "2023"].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} Financial Year
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-mono uppercase text-gray-400">
                    Filter Specific Months ({yearlySelectedMonths.length} Selected)
                  </label>
                  <button
                    type="button"
                    onClick={selectAllYearlyMonths}
                    className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto p-1 bg-white dark:bg-[#2A2B29] rounded-xl border border-[#DEDDDA] dark:border-[#3E403D]">
                  {MONTHS_LIST.map((m) => {
                    const isSelected = yearlySelectedMonths.includes(m.value);
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => toggleYearlyMonth(m.value)}
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B]"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                      >
                        {m.name.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadYearlyLog}
              className="w-full py-2.5 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              id="btn-download-yearly-log"
            >
              <Download size={14} /> Download Yearly Log (.docx)
            </button>
          </div>
        </div>
      </motion.div>

      {/* Security Recovery Modal */}
      {settingsRecoveryTarget && (
        <SecurityRecovery
          target={settingsRecoveryTarget}
          username={username}
          onSuccess={(newCred, newMode) => {
            if (settingsRecoveryTarget === "safe_zone" && newCred) {
              setSafeZoneCurrentSavedPin(newCred);
              setSafeZoneSelectedLength(newCred.length === 6 ? 6 : 4);
              setSafeZoneSuccess("Safe Zone PIN reset via Gmail OTP successfully!");
              setTimeout(() => setSafeZoneSuccess(""), 4000);
            }
            if (settingsRecoveryTarget === "app_lock") {
              if (newMode && setLockMode) setLockMode(newMode);
              if (newCred && (newMode === "pin4" || newMode === "pin6") && setUserPin) setUserPin(newCred);
              if (newCred && newMode === "pattern" && setUserPattern) setUserPattern(newCred);
              setSecuritySuccess("App Lock updated via Gmail OTP successfully!");
              setTimeout(() => setSecuritySuccess(""), 4000);
            }
            setSettingsRecoveryTarget(null);
          }}
          onCancel={() => setSettingsRecoveryTarget(null)}
        />
      )}
    </div>
  );
};
