import React from "react";
import {
  ActiveTab,
  FinancialGoal,
  LoanReminder,
  Expense,
} from "../types";
import {
  Home,
  Percent,
  Compass,
  Bell,
  Settings as SettingsIcon,
  ShieldAlert,
  FileText,
  LifeBuoy,
  LogOut,
  User,
  IndianRupee,
  TrendingUp,
  PiggyBank,
  AlertCircle,
  Menu,
  X,
  BookOpen,
  Trophy,
  CreditCard,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Logo } from "./Logo";
import { SafeZoneWidget } from "./SafeZoneWidget";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  username: string;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
  salary: number;
  expenses: Expense[];
  goals: FinancialGoal[];
  loans: LoanReminder[];
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  theme?: "light" | "dark";
  setTheme?: (theme: "light" | "dark") => void;
}

export const DashboardLayout: React.FC<DashboardProps> = ({
  username,
  activeTab,
  setActiveTab,
  onLogout,
  children,
  salary,
  expenses,
  goals,
  loans,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  theme = "light",
  setTheme,
}) => {
  // User profile avatar state for top header
  const [headerAvatarUrl, setHeaderAvatarUrl] = React.useState<string>("");
  const [headerAvatarEmoji, setHeaderAvatarEmoji] = React.useState<string>("🦁");
  const [headerAvatarGradient, setHeaderAvatarGradient] = React.useState<string>("bg-gradient-to-tr from-[#00C0F0] to-[#00E676] text-[#1C1D1B]");

  React.useEffect(() => {
    const loadUserAvatar = () => {
      try {
        const users = JSON.parse(localStorage.getItem("vault_iq_users") || "{}");
        const user = users[username];
        if (user) {
          setHeaderAvatarUrl(user.avatarUrl || "");
          setHeaderAvatarEmoji(user.avatarEmoji || "🦁");
          setHeaderAvatarGradient(user.avatarGradient || "bg-gradient-to-tr from-[#00C0F0] to-[#00E676] text-[#1C1D1B]");
        }
      } catch (err) {
        console.error("Failed to load header avatar", err);
      }
    };

    loadUserAvatar();
    window.addEventListener("storage", loadUserAvatar);
    window.addEventListener("vault_iq_user_updated", loadUserAvatar);
    return () => {
      window.removeEventListener("storage", loadUserAvatar);
      window.removeEventListener("vault_iq_user_updated", loadUserAvatar);
    };
  }, [username]);

  // Sidebar navigation menu items
  const menuItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "splitter", label: "Salary Splitter", icon: Percent },
    { id: "goals", label: "Goal Setter", icon: Compass },
    { id: "remainder", label: "Remainder", icon: Bell },
    { id: "subscriptions", label: "Subscription Tracker", icon: CreditCard },
    { id: "settings", label: "Settings", icon: SettingsIcon },
    { id: "legal", label: "Legal & Compliance", icon: ShieldAlert },
    { id: "help", label: "Help Desk", icon: LifeBuoy },
  ];

  // Helper calculation for Dashboard Home Overview
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSavingsGoal = goals.reduce((acc, curr) => acc + curr.currentSavings, 0);
  const activeLoansCount = loans.filter((l) => l.status !== "Paid").length;

  // Group expenses by location tag
  const locationMap = expenses.reduce((acc, curr) => {
    if (curr.locationTag) {
      acc[curr.locationTag] = (acc[curr.locationTag] || 0) + curr.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const locationChartData = Object.entries(locationMap)
    .map(([name, value]) => ({ name, value: Number(value) }))
    .sort((a, b) => b.value - a.value);

  const colorsList = ["#00C0F0", "#00E676", "#38BDF8", "#34D399", "#818CF8", "#F59E0B"];

  return (
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#1C1D1B] text-[#2D302D] dark:text-[#E4E3E0] transition-colors duration-300 font-sans flex flex-col selection:bg-[#00C0F0]/20">
      {/* ==========================================
          TOP HEADER BAR
         ========================================== */}
      <header
        className="h-20 border-b border-[#DEDDDA] dark:border-[#3E403D]/60 bg-white/85 dark:bg-[#1C1D1B]/85 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors"
        id="dashboard-header"
      >
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-[#2D302D] dark:text-[#E4E3E0] hover:bg-[#F5F5F0] dark:hover:bg-[#2A2B29] md:hidden transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo on Left */}
          <Logo size="sm" showText={true} />
        </div>

        {/* User profile and Theme controls on Right */}
        <div className="flex items-center gap-3">
          {setTheme && (
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-xl border border-[#DEDDDA] dark:border-[#3E403D] bg-white dark:bg-[#2A2B29] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333532] transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-xs"
              title="Toggle Theme"
              id="dashboard-theme-toggle"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          )}

          <button
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] hover:border-cyan-500 rounded-xl transition-all cursor-pointer group shadow-xs"
            id="profile-access-trigger"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm shadow-xs border border-white/20">
              {headerAvatarUrl ? (
                <img
                  src={headerAvatarUrl}
                  alt={username}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setHeaderAvatarUrl("")}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-base ${headerAvatarGradient}`}>
                  {headerAvatarEmoji || username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm font-semibold hidden sm:inline-block max-w-30 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors text-[#2D302D] dark:text-[#E4E3E0]">
              {username}
            </span>
          </button>

          <button
            onClick={onLogout}
            className="p-2.5 bg-white dark:bg-[#2A2B29] text-rose-500 hover:text-white hover:bg-rose-600 rounded-xl transition-all cursor-pointer border border-[#DEDDDA] dark:border-[#3E403D] shadow-xs"
            title="Log out"
            id="btn-logout-header"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* ==========================================
            DESKTOP SIDEBAR
           ========================================== */}
        <aside
          className="w-64 bg-[#1C1D1B] dark:bg-[#151615] text-[#E4E3E0] flex-col justify-between hidden md:flex sticky top-20 h-[calc(100vh-5rem)] p-6 z-30 transition-colors border-r border-[#3E403D]/40"
          id="desktop-sidebar"
        >
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-[#00C0F0] uppercase px-3">
              Core Engine
            </span>
            <nav className="space-y-1.5 mt-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as ActiveTab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold shadow-md shadow-cyan-500/20"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-[#1C1D1B]" : "text-gray-400"} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 mt-auto rounded-2xl font-medium text-sm text-red-400 hover:bg-red-950/30 transition-all cursor-pointer border border-transparent hover:border-red-900/40"
            id="sidebar-logout"
          >
            <LogOut size={18} />
            Log Out Account
          </button>
        </aside>

        {/* ==========================================
            MOBILE DRAWER SIDEBAR
           ========================================== */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden backdrop-blur-xs"
              />
              {/* Drawer Container */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-[#1C1D1B] dark:bg-[#151615] text-[#E4E3E0] shadow-2xl z-50 p-6 flex flex-col justify-between md:hidden"
                id="mobile-sidebar"
              >
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#3E403D]/40">
                    <Logo size="sm" showText={true} />
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 rounded-lg text-[#E4E3E0]/70 hover:bg-white/10 cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-[#00C0F0] uppercase px-3">
                    Core Engine
                  </span>
                  <nav className="space-y-1.5 mt-3">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as ActiveTab);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${
                            isActive
                              ? "bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold shadow-md"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Icon size={18} className={isActive ? "text-[#1C1D1B]" : "text-gray-400"} />
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 mt-auto rounded-2xl font-medium text-sm text-red-400 hover:bg-red-950/30 transition-all cursor-pointer"
                  id="mobile-sidebar-logout"
                >
                  <LogOut size={18} />
                  Log Out Account
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ==========================================
            MAIN CONTENT AREA
           ========================================== */}
        <main
          className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-all"
          id="main-viewport"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" || activeTab === "home" ? (
                <div className="space-y-8" id="dashboard-welcome-view">
                  {/* Welcoming Hero Section with Official Logo and Greeting */}
                  <div className="bg-gradient-to-br from-white via-white to-gray-50 dark:from-[#2A2B29] dark:via-[#2A2B29] dark:to-[#1E201E] rounded-4xl p-6 md:p-8 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 -translate-y-6 translate-x-6 w-56 h-56 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
                      <div className="max-w-2xl space-y-2 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-semibold text-xs uppercase tracking-widest font-mono">
                          <Sparkles size={14} className="text-[#00C0F0]" />
                          <span>Financial Intelligence Hub</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-extrabold text-gray-900 dark:text-white leading-tight">
                          Welcome back, <span className="bg-gradient-to-r from-[#00C0F0] via-teal-400 to-[#00E676] bg-clip-text text-transparent font-bold">{username}</span>!
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-300 max-w-xl leading-relaxed">
                          Vault IQ is actively optimizing your Indian finance journey. Track your salary splits, achieve milestone goals, monitor recurring services, and secure your contingency reserves in Indian Rupees (₹).
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col items-center p-2.5 bg-[#080B12] rounded-3xl border border-cyan-500/20 shadow-md">
                        <img
                          src="/vault-iq-logo.png"
                          alt="Vault IQ Official Logo"
                          className="w-24 h-24 object-contain rounded-2xl drop-shadow-md"
                        />
                        <span className="text-[10px] font-mono font-bold text-[#00C0F0] uppercase tracking-widest mt-1">
                          Vault IQ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Bento Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Salary Splitting Stat */}
                    <div className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm flex items-start gap-4 hover:border-cyan-500/40 transition-colors">
                      <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        <IndianRupee size={22} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                          Active Base Salary
                        </span>
                        <div className="text-xl md:text-2xl font-mono font-bold text-gray-900 dark:text-white">
                          ₹{salary.toLocaleString("en-IN")}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Month-to-date income
                        </p>
                      </div>
                    </div>

                    {/* Savings Accumulated Stat */}
                    <div className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm flex items-start gap-4 hover:border-emerald-500/40 transition-colors">
                      <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <PiggyBank size={22} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                          Dream Goal Savings
                        </span>
                        <div className="text-xl md:text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{totalSavingsGoal.toLocaleString("en-IN")}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Accumulated for goals
                        </p>
                      </div>
                    </div>

                    {/* Pending Loan/EMI reminders */}
                    <div className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm flex items-start gap-4 sm:col-span-2 lg:col-span-1 hover:border-amber-500/40 transition-colors">
                      <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <AlertCircle size={22} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                          Unpaid EMI Reminders
                        </span>
                        <div className="text-xl md:text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">
                          {activeLoansCount}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Due before the end of cycle
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Safe Zone Stash & Location Analytics Bento row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Safe Zone */}
                    <SafeZoneWidget
                      username={username}
                      onTransferBack={(amount) => {
                        console.log("Safe Zone unlocked and transferred back: ", amount);
                      }}
                    />

                    {/* Spending by Location Chart */}
                    <div className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <MapPin size={18} className="text-[#00C0F0]" />
                          Spending by Location
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Analyzing geographical and venue-based budget allocations
                        </p>
                      </div>

                      {locationChartData.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-400 font-mono">
                          No location tags logged yet. Log expenses with location tags to view chart!
                        </div>
                      ) : (
                        <div className="h-44 mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={locationChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {locationChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: any) => `₹${value.toLocaleString("en-IN")}`} />
                              <Legend iconSize={8} layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Finance Assistant Welcome Section */}
                  <div className="bg-gradient-to-r from-[#1C1D1B] via-[#2A2B29] to-[#1C1D1B] text-white rounded-4xl p-6 sm:p-8 shadow-xl border border-cyan-500/25 relative overflow-hidden">
                    <div className="absolute right-0 top-0 -translate-y-2.5 translate-x-2.5 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
                    <div className="flex items-center gap-2 text-[#00C0F0] font-mono text-xs font-semibold tracking-wider mb-2">
                      <Sparkles size={16} />
                      <span>VAULT IQ INTELLIGENCE</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                      Institutional-Grade Financial Architecture
                    </h3>
                    <p className="text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
                      Vault IQ matches standard RBI and DPDP secure financial guidelines. When you save towards your dream goals or log expenses, our intelligence engine analyzes allocations to appreciate your savings and suggest optimal repayment models!
                    </p>
                    <div className="flex flex-wrap gap-3 mt-5">
                      <button
                        onClick={() => setActiveTab("splitter")}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] hover:shadow-cyan-500/25 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Launch Salary Splitter
                      </button>
                      <button
                        onClick={() => setActiveTab("goals")}
                        className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Explore Dream Goals
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity Quick-links */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Goal Progress List */}
                    <div className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                        <span>Goal Trackers</span>
                        <button
                          onClick={() => setActiveTab("goals")}
                          className="text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                        >
                          View All
                        </button>
                      </h3>
                      {goals.length === 0 ? (
                        <div className="text-center py-6 text-sm text-gray-400">
                          No financial goals created yet. Set your first goal in Goal Setter!
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {goals.slice(0, 3).map((g) => {
                            const percent = Math.min(100, Math.round((g.currentSavings / g.targetAmount) * 100)) || 0;
                            return (
                              <div key={g.id} className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {g.name}
                                  </span>
                                  <span className="font-mono text-xs text-gray-500">
                                    ₹{g.currentSavings.toLocaleString("en-IN")} / ₹{g.targetAmount.toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <div className="w-full h-2.5 bg-[#F5F5F0] dark:bg-[#1C1D1B] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#00C0F0] to-[#00E676] rounded-full transition-all"
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                                <div className="text-[10px] text-right text-gray-400 font-medium font-mono">
                                  {percent}% Completed
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Upcoming Loans List */}
                    <div className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                        <span>Upcoming Payments</span>
                        <button
                          onClick={() => setActiveTab("remainder")}
                          className="text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                        >
                          View All
                        </button>
                      </h3>
                      {loans.length === 0 ? (
                        <div className="text-center py-6 text-sm text-gray-400">
                          No loans or EMI reminders configured yet. Add them in Remainder!
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {loans.slice(0, 3).map((l) => (
                            <div
                              key={l.id}
                              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D]"
                            >
                              <div>
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {l.name}
                                </h4>
                                <span className="text-[10px] text-gray-400 font-mono font-medium">
                                  Due Date: {l.dueDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                                  ₹{l.amount.toLocaleString("en-IN")}
                                </span>
                                <span
                                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-mono ${
                                    l.status === "Paid"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                      : l.status === "Overdue"
                                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border border-rose-500/20"
                                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 border border-amber-500/20"
                                  }`}
                                >
                                  {l.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                children
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
