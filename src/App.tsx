import React, { useState, useEffect } from "react";
import {
  ActiveTab,
  Theme,
  Expense,
  FinancialGoal,
  LoanReminder,
  GroupBill,
  AppLockMode,
} from "./types";
import { Auth } from "./components/Auth";
import { DashboardLayout } from "./components/Dashboard";
import { SalarySplitter } from "./components/SalarySplitter";
import { GoalSetter } from "./components/GoalSetter";
import { Reminder } from "./components/Reminder";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { Upgrade } from "./components/Upgrade";
import { SubscriptionTracker } from "./components/SubscriptionTracker";
import { LandingPage } from "./components/LandingPage";
import {
  LegalAndCompliance,
  HelpDesk,
} from "./components/LegalAndSupport";
import { SecurityRecovery } from "./components/SecurityRecovery";

import { Sparkles, X, PiggyBank, ShieldAlert, KeyRound, Grid, Lock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  auth, 
  firebaseSignOut, 
  onAuthStateChanged,
  updateUserFinancialDataInFirestore,
  getUserProfileFromFirestore
} from "./firebase";

export default function App() {
  // Authentication & Navigation
  const [username, setUsername] = useState<string>("");
  const [userUid, setUserUid] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Landing Page vs Auth Modal state when logged out
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "signup">("login");

  // Global Financial States
  const [salary, setSalary] = useState<number>(50000);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loans, setLoans] = useState<LoanReminder[]>([]);
  const [groupBills, setGroupBills] = useState<GroupBill[]>([]);

  // Preferences
  const [theme, setTheme] = useState<Theme>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Security & App Access Lock states (4-digit, 6-digit, Pattern Lock)
  const [lockMode, setLockMode] = useState<AppLockMode>("none");
  const [userPin, setUserPin] = useState<string>("1234");
  const [userPattern, setUserPattern] = useState<string>("0-1-2-5-8");
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [patternAttempt, setPatternAttempt] = useState<number[]>([]);
  const [lockError, setLockError] = useState<string>("");
  const [isVerifyingLock, setIsVerifyingLock] = useState<boolean>(false);
  const [showSecurityRecovery, setShowSecurityRecovery] = useState<boolean>(false);

  // AI Appreciation Popup States
  const [showAppreciation, setShowAppreciation] = useState(false);
  const [appreciationMsg, setAppreciationMsg] = useState("");
  const [savedAmountNotification, setSavedAmountNotification] = useState(0);

  // Load user session and state on startup
  useEffect(() => {
    const activeSession = localStorage.getItem("vault_iq_active_user");
    const activeUid = localStorage.getItem("vault_iq_active_user_uid");
    if (activeUid) {
      setUserUid(activeUid);
    }
    if (activeSession) {
      setUsername(activeSession);
      loadUserData(activeSession);
    }

    const savedTheme = localStorage.getItem("vault_iq_theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }

    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log("[FIREBASE SESSION] Verified active user session:", firebaseUser.phoneNumber || firebaseUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update HTML class list when theme changes
  useEffect(() => {
    localStorage.setItem("vault_iq_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Sync user-specific data to LocalStorage & Firestore
  useEffect(() => {
    if (!username) return;
    localStorage.setItem(`vault_iq_salary_${username}`, salary.toString());
    const uid = userUid || localStorage.getItem("vault_iq_active_user_uid") || username.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    updateUserFinancialDataInFirestore(uid, { salary });
  }, [salary, username, userUid]);

  useEffect(() => {
    if (!username) return;
    localStorage.setItem(`vault_iq_lock_mode_${username}`, lockMode);
  }, [lockMode, username]);

  useEffect(() => {
    if (!username) return;
    localStorage.setItem(`vault_iq_user_pin_${username}`, userPin);
  }, [userPin, username]);

  useEffect(() => {
    if (!username) return;
    localStorage.setItem(`vault_iq_user_pattern_${username}`, userPattern);
  }, [userPattern, username]);

  useEffect(() => {
    if (!username) return;
    localStorage.setItem(`vault_iq_expenses_${username}`, JSON.stringify(expenses));
    const uid = userUid || localStorage.getItem("vault_iq_active_user_uid") || username.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    updateUserFinancialDataInFirestore(uid, { expenses });
  }, [expenses, username, userUid]);

  useEffect(() => {
    if (!username) return;
    localStorage.setItem(`vault_iq_goals_${username}`, JSON.stringify(goals));
    const uid = userUid || localStorage.getItem("vault_iq_active_user_uid") || username.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    updateUserFinancialDataInFirestore(uid, { goals });
  }, [goals, username, userUid]);

  useEffect(() => {
    if (!username) return;
    localStorage.setItem(`vault_iq_loans_${username}`, JSON.stringify(loans));
    const uid = userUid || localStorage.getItem("vault_iq_active_user_uid") || username.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    updateUserFinancialDataInFirestore(uid, { loans });

    // Retrieve user's registered mobile number
    const usersRaw = localStorage.getItem("vault_iq_users");
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    const userObj = users[username];
    const registeredMobile = userObj?.mobile || "9876543210";

    // Synchronize EMI alerts with the backend
    fetch("/api/register-emi-alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loans, username, mobile: registeredMobile }),
    })
      .then((res) => res.json())
      .then((data) => console.log("[EMI alert sync complete]", data))
      .catch((err) => console.error("Error syncing EMI alerts:", err));
  }, [loans, username, userUid]);

  useEffect(() => {
    if (!username) return;
    localStorage.setItem(`vault_iq_groupbills_${username}`, JSON.stringify(groupBills));
  }, [groupBills, username]);

  const loadUserData = async (user: string) => {
    const localSal = localStorage.getItem(`vault_iq_salary_${user}`);
    setSalary(localSal ? parseFloat(localSal) : 65000);

    const localExp = localStorage.getItem(`vault_iq_expenses_${user}`);
    setExpenses(localExp ? JSON.parse(localExp) : [
      { id: "e1", description: "Fresh Produce & Milk", amount: 1450, category: "Groceries", date: new Date().toISOString().split("T")[0] },
      { id: "e2", description: "Fuel Station Refill", amount: 800, category: "Transport", date: new Date().toISOString().split("T")[0] },
      { id: "e3", description: "Broadband Wi-Fi Bill", amount: 999, category: "Utilities", date: new Date().toISOString().split("T")[0] }
    ]);

    const localGoals = localStorage.getItem(`vault_iq_goals_${user}`);
    setGoals(localGoals ? JSON.parse(localGoals) : [
      { id: "g1", name: "Yamaha MT-15 Superbike", targetAmount: 180000, currentSavings: 65000, coverImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop" },
      { id: "g2", name: "Dream 3BHK Villa Downpayment", targetAmount: 1500000, currentSavings: 280000, coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop" }
    ]);

    const localLoans = localStorage.getItem(`vault_iq_loans_${user}`);
    setLoans(localLoans ? JSON.parse(localLoans) : [
      { id: "l1", name: "HDFC Home Loan EMI", amount: 24500, dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0], isScheduled: true, status: "Pending", totalPrincipal: 2800000, remainingInstallments: 140 },
      { id: "l2", name: "SBI Car Loan", amount: 8900, dueDate: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0], isScheduled: true, status: "Pending", totalPrincipal: 450000, remainingInstallments: 36 }
    ]);

    const localBills = localStorage.getItem(`vault_iq_groupbills_${user}`);
    setGroupBills(localBills ? JSON.parse(localBills) : []);

    // Load Lock settings
    const savedLock = localStorage.getItem(`vault_iq_lock_mode_${user}`) as AppLockMode;
    const legacyPinLock = localStorage.getItem(`vault_iq_pin_lock_enabled_${user}`) === "true";
    const resolvedLock: AppLockMode = savedLock ? savedLock : legacyPinLock ? "pin4" : "none";
    setLockMode(resolvedLock);

    const savedPin = localStorage.getItem(`vault_iq_user_pin_${user}`);
    if (savedPin) setUserPin(savedPin);

    const savedPattern = localStorage.getItem(`vault_iq_user_pattern_${user}`);
    if (savedPattern) setUserPattern(savedPattern);

    // If lock is enabled, activate lock screen
    if (resolvedLock !== "none") {
      setIsAppLocked(true);
      setPinInput("");
      setPatternAttempt([]);
    }

    // Attempt cloud recovery
    const activeUid = localStorage.getItem("vault_iq_active_user_uid");
    if (activeUid) {
      try {
        const cloudProfile = await getUserProfileFromFirestore(activeUid);
        if (cloudProfile && cloudProfile.financialData) {
          const { salary: cloudSalary, expenses: cloudExp, goals: cloudGoals, loans: cloudLoans } = cloudProfile.financialData;
          if (cloudSalary) setSalary(cloudSalary);
          if (cloudExp) setExpenses(cloudExp);
          if (cloudGoals) setGoals(cloudGoals);
          if (cloudLoans) setLoans(cloudLoans);
        }
      } catch (err) {
        console.warn("Using offline local sandbox storage:", err);
      }
    }
  };

  const handleLoginSuccess = (loggedInUser: string) => {
    setUsername(loggedInUser);
    localStorage.setItem("vault_iq_active_user", loggedInUser);
    setShowAuthModal(false);
    loadUserData(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn("Firebase signout fallback:", err);
    }
    localStorage.removeItem("vault_iq_active_user");
    localStorage.removeItem("vault_iq_active_user_uid");
    setUsername("");
    setUserUid("");
    setActiveTab("dashboard");
    setExpenses([]);
    setGoals([]);
    setLoans([]);
    setGroupBills([]);
    setLockMode("none");
    setIsAppLocked(false);
    setPinInput("");
    setLockError("");
    setShowAuthModal(false);
  };

  // AI Appreciation Pipeline
  const triggerSavingsAppreciation = async (savingsAmt: number) => {
    setSavedAmountNotification(savingsAmt);
    setShowAppreciation(true);
    setAppreciationMsg("Vault IQ is generating your personalized appreciation message...");

    try {
      const response = await fetch("/api/gemini/appreciate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accumulatedSavings: savingsAmt }),
      });

      if (response.ok) {
        const data = await response.json();
        setAppreciationMsg(data.message);
      } else {
        setAppreciationMsg(`Fantastic! You have successfully committed ₹${savingsAmt.toLocaleString("en-IN")} to your secure savings!`);
      }
    } catch (err) {
      setAppreciationMsg(`Shabaash! Saved ₹${savingsAmt.toLocaleString("en-IN")} successfully towards your secure future goals!`);
    }

    setTimeout(() => {
      setShowAppreciation(false);
    }, 7000);
  };

  // PIN Unlock Verification
  const handleVerifyPinCode = (codeToVerify?: string) => {
    const code = codeToVerify !== undefined ? codeToVerify : pinInput.trim();
    const expectedLength = lockMode === "pin6" ? 6 : 4;
    if (code.length !== expectedLength) return;

    setIsVerifyingLock(true);
    setLockError("");

    if (code === userPin) {
      setIsAppLocked(false);
      setPinInput("");
      setLockError("");
      setIsVerifyingLock(false);
    } else {
      setLockError(`Incorrect ${expectedLength}-digit PIN code. Please retry.`);
      setPinInput("");
      setIsVerifyingLock(false);
    }
  };

  // Auto-verify PIN once all digits are typed
  useEffect(() => {
    const trimmed = pinInput.trim();
    const targetLen = lockMode === "pin6" ? 6 : 4;
    if ((lockMode === "pin4" || lockMode === "pin6") && trimmed.length === targetLen) {
      handleVerifyPinCode(trimmed);
    }
  }, [pinInput, lockMode]);

  // Pattern Lock Verification
  const handleVerifyPattern = (attemptArr?: number[]) => {
    const patternArr = attemptArr || patternAttempt;
    const attemptStr = patternArr.join("-");

    if (attemptStr === userPattern) {
      setIsAppLocked(false);
      setPatternAttempt([]);
      setLockError("");
    } else {
      setLockError("Incorrect pattern sequence. Try again!");
      setPatternAttempt([]);
    }
  };

  // Render Subcomponent view depending on active tab
  const renderActiveView = () => {
    switch (activeTab) {
      case "splitter":
        return (
          <SalarySplitter
            username={username}
            salary={salary}
            setSalary={setSalary}
            expenses={expenses}
            setExpenses={setExpenses}
            groupBills={groupBills}
            setGroupBills={setGroupBills}
            onSavingsAdded={triggerSavingsAppreciation}
          />
        );
      case "goals":
        return (
          <GoalSetter
            goals={goals}
            setGoals={setGoals}
            onSavingsAdded={triggerSavingsAppreciation}
          />
        );
      case "remainder":
        return <Reminder loans={loans} setLoans={setLoans} />;
      case "upgrade":
        return (
          <Upgrade
            username={username}
            totalCurrentSavings={goals.reduce((sum, item) => sum + item.currentSavings, 0)}
          />
        );
      case "subscriptions":
        return <SubscriptionTracker username={username || "User"} />;
      case "profile":
        return (
          <Profile
            username={username}
            userUid={userUid}
            expenses={expenses}
            goals={goals}
            onEditProfile={() => {
              const el = document.getElementById("profile-view-container");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            onUpgradeRedirect={() => {
              setActiveTab("upgrade");
            }}
          />
        );
      case "settings":
        return (
          <Settings
            notificationsEnabled={notificationsEnabled}
            setNotificationsEnabled={setNotificationsEnabled}
            username={username}
            userUid={userUid}
            salary={salary}
            expenses={expenses}
            goals={goals}
            loans={loans}
            lockMode={lockMode}
            setLockMode={setLockMode}
            userPin={userPin}
            setUserPin={setUserPin}
            userPattern={userPattern}
            setUserPattern={setUserPattern}
          />
        );
      case "legal":
      case "privacy":
      case "terms":
        return <LegalAndCompliance />;
      case "help":
        return <HelpDesk username={username} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#1C1D1B] text-[#2D302D] dark:text-[#E4E3E0] transition-colors duration-300 font-sans selection:bg-[#00C0F0]/20" id="vault-iq-app-root">
      {/* ==========================================
          APP ACCESS SECURITY LOCK SCREEN OVERLAY
         ========================================== */}
      {username && isAppLocked && lockMode !== "none" && (
        <div className="fixed inset-0 bg-[#F5F5F0]/95 dark:bg-[#1C1D1B]/95 backdrop-blur-md z-9999 flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white dark:bg-[#2A2B29] rounded-4xl p-8 border border-[#DEDDDA] dark:border-[#3E403D] shadow-2xl space-y-6 text-center"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="p-4 bg-gradient-to-br from-[#00C0F0]/15 to-[#00E676]/15 text-[#00C0F0] rounded-3xl border border-cyan-500/20">
                {lockMode === "pattern" ? <Grid size={32} /> : <KeyRound size={32} />}
              </div>
              <h2 className="text-xl font-display font-extrabold text-gray-900 dark:text-white">
                Vault Protected Access
              </h2>
              <p className="text-xs text-gray-400">
                {lockMode === "pattern"
                  ? "Connect the 3x3 pattern lock to open vault"
                  : `Enter your ${lockMode === "pin6" ? "6" : "4"}-digit PIN code for `}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{username}</span>
              </p>
            </div>

            {/* 4-digit or 6-digit PIN Interface */}
            {(lockMode === "pin4" || lockMode === "pin6") && (
              <div className="space-y-4">
                <div className="flex justify-center gap-2.5 relative py-2">
                  {Array.from({ length: lockMode === "pin6" ? 6 : 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-11 h-13 border-2 rounded-2xl flex items-center justify-center font-mono font-bold text-xl transition-all ${
                        pinInput.trim().length > idx
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-500"
                          : "border-[#DEDDDA] dark:border-[#3E403D] bg-gray-50 dark:bg-[#1C1D1B]/40 text-gray-400"
                      }`}
                    >
                      {pinInput.trim().length > idx ? "●" : ""}
                    </div>
                  ))}

                  <input
                    type="text"
                    pattern="\d*"
                    inputMode="numeric"
                    maxLength={lockMode === "pin6" ? 6 : 4}
                    autoFocus
                    value={pinInput.trim()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPinInput(val);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                  />
                </div>

                {lockError && (
                  <p className="text-xs text-rose-500 font-semibold font-mono">
                    {lockError}
                  </p>
                )}

                {/* Forgot PIN / Password icon link */}
                <div className="pt-2 border-t border-[#DEDDDA]/60 dark:border-[#3E403D]/60 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setLockError("");
                      setShowSecurityRecovery(true);
                    }}
                    className="text-xs text-[#00C0F0] dark:text-[#00F0FF] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-xl hover:bg-cyan-500/10 transition-colors"
                    id="btn-forgot-pin-lock"
                  >
                    <KeyRound size={14} className="text-[#00C0F0]" />
                    <span>Forgot PIN / Password?</span>
                  </button>
                </div>
              </div>
            )}

            {/* Pattern Lock 3x3 Matrix Interface */}
            {lockMode === "pattern" && (
              <div className="space-y-4 flex flex-col items-center">
                <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-3xl border border-[#DEDDDA] dark:border-[#3E403D]">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((dot) => {
                    const isSelected = patternAttempt.includes(dot);
                    const orderIdx = patternAttempt.indexOf(dot);
                    return (
                      <button
                        key={dot}
                        type="button"
                        onClick={() => {
                          if (!patternAttempt.includes(dot)) {
                            const updated = [...patternAttempt, dot];
                            setPatternAttempt(updated);
                          }
                        }}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] border-cyan-400 shadow-md scale-105"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 hover:border-cyan-400"
                        }`}
                      >
                        {isSelected ? orderIdx + 1 : "•"}
                      </button>
                    );
                  })}
                </div>

                {lockError && (
                  <p className="text-xs text-rose-500 font-semibold font-mono">
                    {lockError}
                  </p>
                )}

                <div className="flex gap-2 w-full pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPatternAttempt([]);
                      setLockError("");
                    }}
                    className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Clear Path
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyPattern()}
                    className="flex-1 py-2 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                  >
                    Unlock
                  </button>
                </div>

                {/* Forgot Pattern / Password icon link */}
                <div className="pt-2 border-t border-[#DEDDDA]/60 dark:border-[#3E403D]/60 w-full flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setLockError("");
                      setShowSecurityRecovery(true);
                    }}
                    className="text-xs text-[#00C0F0] dark:text-[#00F0FF] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-xl hover:bg-cyan-500/10 transition-colors"
                    id="btn-forgot-pattern-lock"
                  >
                    <KeyRound size={14} className="text-[#00C0F0]" />
                    <span>Forgot Pattern / Password?</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ==========================================
          APP ACCESS SECURITY GMAIL RECOVERY MODAL
         ========================================== */}
      {showSecurityRecovery && (
        <SecurityRecovery
          target="app_lock"
          username={username}
          onSuccess={(newCred, newMode) => {
            if (newMode) setLockMode(newMode);
            if (newCred && (newMode === "pin4" || newMode === "pin6")) setUserPin(newCred);
            if (newCred && newMode === "pattern") setUserPattern(newCred);
            setIsAppLocked(false);
            setPinInput("");
            setLockError("");
            setShowSecurityRecovery(false);
          }}
          onCancel={() => setShowSecurityRecovery(false)}
        />
      )}

      {/* ==========================================
          AI APPRECIATION FLOATING BANNER
         ========================================== */}
      <AnimatePresence>
        {showAppreciation && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-lg bg-[#2A2B29] text-[#E4E3E0] rounded-3xl shadow-2xl p-5 border border-[#5A5A40]/30 z-50 overflow-hidden"
            id="ai-appreciation-popup"
          >
            <div className="flex gap-4 relative z-10">
              <div className="p-3 bg-[#5A5A40]/10 text-[#C2C2A3] rounded-xl shrink-0 h-11 w-11 flex items-center justify-center">
                <PiggyBank size={22} className="animate-bounce" />
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#C2C2A3] block uppercase">
                      AI Savings Appreciation
                    </span>
                    <span className="text-sm font-semibold font-mono text-[#C2C2A3]">
                      Amount Logged: +₹{savedAmountNotification.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAppreciation(false)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans border-t border-[#1C1D1B] pt-2">
                  {appreciationMsg}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MAIN VIEW CONDITIONAL RENDERING
         ========================================== */}
      {username ? (
        <DashboardLayout
          username={username}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          salary={salary}
          expenses={expenses}
          goals={goals}
          loans={loans}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          theme={theme}
          setTheme={setTheme}
        >
          {renderActiveView()}
        </DashboardLayout>
      ) : showAuthModal ? (
        <Auth
          onLoginSuccess={handleLoginSuccess}
          initialMode={authInitialMode}
          onBackToLanding={() => setShowAuthModal(false)}
        />
      ) : (
        <LandingPage
          onOpenAuth={(mode) => {
            setAuthInitialMode(mode || "login");
            setShowAuthModal(true);
          }}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </div>
  );
}
