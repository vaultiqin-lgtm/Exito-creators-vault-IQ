import React from "react";
import { Logo } from "./Logo";
import {
  TrendingUp,
  ShieldCheck,
  PiggyBank,
  Bell,
  CreditCard,
  Lock,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  DollarSign,
  ChevronRight,
  Users,
  Smartphone,
  Shield,
  Layers,
  Award,
} from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onOpenAuth: (mode?: "login" | "signup") => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  theme,
  setTheme,
}) => {
  const features = [
    {
      icon: TrendingUp,
      title: "Intelligent Salary Splitter",
      description:
        "Automatically partition your monthly income into Expenses, Dream Savings, and Investments using standard 50/30/20 or personalized budgeting models.",
      badge: "Core Engine",
      color: "from-blue-500/20 to-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    },
    {
      icon: PiggyBank,
      title: "Dream Goal Achiever",
      description:
        "Visualize your aspirations—from super bikes and luxury cars to dream homes—with milestone tracking, custom covers, and instant AI appreciation popups.",
      badge: "Smart Savings",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      icon: Bell,
      title: "EMI & Loan Sentinel",
      description:
        "Never miss a repayment deadline. Schedule 5-day and 2-day prior alerts, manage loan installments, and access AI smart repayment strategies.",
      badge: "Debt Management",
      color: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    {
      icon: CreditCard,
      title: "Subscription Hub",
      description:
        "Track upcoming renewals for Netflix, Amazon Prime, JioHotstar, Spotify, ZEE5, SonyLIV, Sun NXT, MX Player, and Airtel Xstream in one unified desk.",
      badge: "Auto Renewals",
      color: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
    },
    {
      icon: Lock,
      title: "Cash & UPI Safe Zone",
      description:
        "Keep dedicated emergency contingency stashes isolated from your daily budget equations, guarded by customizable 4-digit or 6-digit PIN codes.",
      badge: "Contingency Stash",
      color: "from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
    },
    {
      icon: FileSpreadsheet,
      title: "Document Exports & Logs",
      description:
        "Export monthly custom date-range logs, annual multi-year reports, and individual certificates for salary history, goals, splits, and EMI payments.",
      badge: "Export & Audit",
      color: "from-indigo-500/20 to-blue-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#1C1D1B] text-[#2D302D] dark:text-[#E4E3E0] transition-colors duration-300 font-sans selection:bg-[#00C0F0]/20">
      {/* ==========================================
          LANDING TOP NAVIGATION
         ========================================== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#1C1D1B]/80 border-b border-[#DEDDDA] dark:border-[#3E403D]/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" showText={true} />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#security" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Security
            </a>
            <a href="#reports" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Reporting
            </a>
            <a href="#faq" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded-xl border border-[#DEDDDA] dark:border-[#3E403D] bg-white dark:bg-[#2A2B29] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333532] transition-colors cursor-pointer text-xs"
              title="Toggle Theme"
              id="landing-theme-toggle"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>

            <button
              onClick={() => onOpenAuth("login")}
              className="px-5 py-2.5 bg-linear-to-r from-[#5A5A40] to-[#2D302D] dark:from-[#00C0F0] dark:to-[#00E676] text-white dark:text-[#1C1D1B] font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm flex items-center gap-1.5"
              id="landing-login-btn"
            >
              <span>Log In</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================
          HERO SECTION
         ========================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow ambient background graphics */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase">
                <Sparkles size={14} />
                <span>Next-Gen Indian Financial Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Master Your Money.{" "}
                <span className="bg-linear-to-r from-[#00C0F0] via-teal-400 to-[#00E676] bg-clip-text text-transparent block sm:inline">
                  Track. Plan. Grow.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Vault IQ brings institutional-grade budgeting, dream goal roadmaps, automated EMI alerts, subscription tracking, and localized DPDP privacy to your personal finances—built natively in Indian Rupees (₹).
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onOpenAuth("login")}
                  className="w-full sm:w-auto px-8 py-3.5 bg-linear-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-2xl shadow-xl hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-2.5 text-base"
                  id="hero-cta-login"
                >
                  <span>Log In to Vault IQ</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => onOpenAuth("signup")}
                  className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] hover:border-cyan-500 text-gray-800 dark:text-white font-semibold rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 text-base"
                  id="hero-cta-signup"
                >
                  <span>Create Account</span>
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>DPDP Act 2023 Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock size={16} className="text-cyan-500" />
                  <span>PIN & Pattern Protection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe size={16} className="text-purple-500" />
                  <span>Local-First Sandbox</span>
                </div>
              </div>
            </motion.div>

            {/* Right Brand Showcase: Framed Vault IQ Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 flex flex-col items-center justify-center relative py-6"
            >
              {/* Concentric Ambient Glowing Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-4xl bg-linear-to-tr from-cyan-500/15 via-teal-500/10 to-emerald-500/15 blur-2xl animate-pulse"></div>
                <div className="w-72 h-72 sm:w-88 sm:h-88 rounded-4xl border border-cyan-500/20 dark:border-cyan-400/25 absolute"></div>
              </div>

              {/* Main Brand Frame Container */}
              <div className="relative w-64 h-64 sm:w-76 sm:h-76 md:w-88 md:h-88 rounded-4xl p-2 bg-linear-to-tr from-[#00C0F0] via-teal-400 to-[#00E676] shadow-[0_0_45px_rgba(0,192,240,0.3)] flex items-center justify-center group">
                {/* Inner Glassmorphism Box */}
                <div className="w-full h-full rounded-[28px] bg-[#080B12] backdrop-blur-xl border border-cyan-500/20 flex items-center justify-center p-3 sm:p-4 transition-transform duration-500 group-hover:scale-[1.02] shadow-inner relative overflow-hidden">
                  {/* Subtle radial sheen */}
                  <div className="absolute inset-0 bg-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>

                  <img
                    src="/vault-iq-logo.png"
                    alt="Vault IQ Official Logo"
                    className="w-full h-full object-contain rounded-2xl drop-shadow-2xl transition-all duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Sleek Subtitle Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm text-center"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-cyan-600 dark:text-cyan-400 uppercase">
                  Vault IQ Financial Suite
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==========================================
          FEATURES BENTO GRID
         ========================================== */}
      <section id="features" className="py-20 bg-white/60 dark:bg-[#151615]/60 border-y border-[#DEDDDA] dark:border-[#3E403D]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-widest text-[#00C0F0] uppercase">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white">
              Complete Control Over Every Rupee
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Built with precision tools to help individuals, freelancers, and families track, allocate, and grow wealth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white dark:bg-[#2A2B29] rounded-3xl border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl bg-linear-to-br ${f.color} border`}>
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#1C1D1B] text-gray-500 dark:text-gray-400">
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {f.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <button
                      onClick={() => onOpenAuth("login")}
                      className="text-xs font-bold text-[#00C0F0] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Explore feature <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          SECURITY & ACCESSIBILITY SECTION
         ========================================== */}
      <section id="security" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-br from-[#2D302D] via-[#1C1D1B] to-[#151615] text-white rounded-4xl p-8 sm:p-12 lg:p-16 border border-[#5A5A40]/30 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -translate-y-10 translate-x-10 w-96 h-96 bg-[#00C0F0]/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-[#00F0FF] rounded-full text-xs font-mono font-semibold uppercase">
                  <Shield size={14} />
                  <span>Triple-Tiered Vault Protection</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-display font-bold">
                  Fortified App Access & Cash/UPI Contingency Isolation
                </h2>

                <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
                  Choose between <strong className="text-white">4-Digit PIN</strong>, <strong className="text-white">6-Digit PIN</strong>, or an interactive <strong className="text-white">Pattern Lock</strong> to secure website access upon entry. Your emergency Safe Zone partitions balances into distinct <strong>Cash</strong> and <strong>UPI</strong> reserves locked by custom PIN authentication.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs font-mono text-[#00C0F0] font-bold block mb-1">4 & 6-Digit PIN</span>
                    <p className="text-xs text-gray-400">High-entropy numeric keypad locking for fast, secure device access.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs font-mono text-[#00E676] font-bold block mb-1">Pattern Matrix Lock</span>
                    <p className="text-xs text-gray-400">Interactive 3x3 touch-and-drag visual pattern connect security.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs font-mono text-purple-400 font-bold block mb-1">DPDP Act 2023</span>
                    <p className="text-xs text-gray-400">Strict local-first storage models guarding confidential records.</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center w-full max-w-xs backdrop-blur-sm">
                  <ShieldCheck className="w-16 h-16 text-[#00E676] mx-auto mb-3 animate-pulse" />
                  <h4 className="text-lg font-bold text-white">Bank-Grade Privacy</h4>
                  <p className="text-xs text-gray-400 mt-1">Zero third-party monetization or data tracking.</p>
                  <button
                    onClick={() => onOpenAuth("login")}
                    className="w-full mt-5 py-2.5 bg-linear-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold text-xs rounded-xl transition-transform hover:scale-105 cursor-pointer uppercase tracking-wider"
                  >
                    Lock In Your Vault
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          CTA BANNER
         ========================================== */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <Logo size="lg" className="justify-center mb-4" />
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 dark:text-white">
            Ready to Take Control of Your Financial Future?
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Join thousands of smart planners using Vault IQ to budget smarter, achieve dream milestones, and secure their financial legacy.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenAuth("login")}
              className="px-8 py-3.5 bg-linear-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-2xl shadow-xl hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-1 cursor-pointer flex items-center gap-2"
            >
              <span>Get Started Now (Log In)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          FOOTER
         ========================================== */}
      <footer className="border-t border-[#DEDDDA] dark:border-[#3E403D] bg-white dark:bg-[#151615] py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={true} />
          </div>

          <div className="text-xs text-gray-400 text-center sm:text-right space-y-1">
            <p>© 2026 Vault IQ FinTech. All rights reserved.</p>
            <p>Built in compliance with the Digital Personal Data Protection (DPDP) Act, 2023.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
