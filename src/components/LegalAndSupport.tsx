import React, { useState } from "react";
import {
  ShieldCheck,
  FileText,
  LifeBuoy,
  Mail,
  Phone,
  Send,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Scale,
  Lock,
  MessageSquare,
  AlertOctagon,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HelpDeskProps {
  username: string;
}

/**
 * Merged, Comprehensive Legal & Compliance Page
 * Combines Privacy Policy, DPDP Act 2023 Governance, RBI Guidelines, and Terms of Service.
 */
export const LegalAndCompliance: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 md:p-10 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-10 max-w-5xl mx-auto" id="legal-compliance-view">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DEDDDA] dark:border-[#3E403D]/60 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-500/20">
            <Scale size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">
              Legal & Compliance Documentation
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Comprehensive Privacy Policy, DPDP Act Governance & Terms of Service • Version 2.4 (Updated 2026)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 rounded-xl text-xs font-mono font-bold self-start md:self-auto">
          <ShieldCheck size={16} />
          <span>DPDP Act 2023 Certified</span>
        </div>
      </div>

      <div className="space-y-8 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {/* PART 1: PRIVACY POLICY & DATA FIDUCIARY FRAMEWORK */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Lock size={18} className="text-[#00C0F0]" />
            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white">
              Part I: Privacy Policy & Data Fiduciary Framework
            </h2>
          </div>

          <p>
            At <strong>Vault IQ</strong> ("Platform", "we", "our", or "us"), we prioritize the privacy, security, and confidentiality of our Indian users above all else. This Privacy Policy governs the manner in which Vault IQ collects, stores, processes, and protects personal data in strict compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> of India, Reserve Bank of India (RBI) consumer data recommendations, and international encryption benchmarks.
          </p>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm">
              1.1 Personal Data Collection & Minimization Principle
            </h3>
            <p className="text-xs">
              In adhering to data minimization rules, Vault IQ solely processes data strictly necessary for ledger calculations and security:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>
                <strong>Identity & Account Credentials:</strong> Account username, profile avatars, and 4-digit/6-digit numeric passcodes or pattern lock sequences.
              </li>
              <li>
                <strong>Communication Metadata:</strong> Connected 10-digit Indian Mobile number and official email address utilized solely for account verification, simulated EMI alert notifications, and support tickets.
              </li>
              <li>
                <strong>Financial Ledger Records:</strong> Monthly base income, 50/30/20 budget ratio configurations, manual expense entries, dream goal milestones, loan obligations, and recurring subscription cycles.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm">
              1.2 Local-First Sandbox Architecture & Zero Monetization
            </h3>
            <p className="text-xs leading-relaxed">
              Vault IQ is engineered on a <strong>local-first cryptographic architecture</strong>. All sensitive financial records, individual transaction receipts, dream milestones, and Safe Zone balances reside directly in the client-side sandbox storage environment on your device. We do not sell, rent, monetize, or broker personal transaction histories to third-party advertisers, credit scoring agencies, or commercial aggregators.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm">
              1.3 AI Processing & Google Gemini Safety Guardrails
            </h3>
            <p className="text-xs leading-relaxed">
              When utilizing AI-assisted features (such as the Smart Camera Bill Scanner, EMI Repayment Advisor, or Appreciation Motivator), visual receipts or prompt context are securely channeled over TLS 1.3 encrypted SSL tunnels to Google Gemini AI endpoints. No financial documents or images are permanently stored on server directories following computational extraction.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm">
              1.4 Data Principal Rights (Access, Correction & Erasure)
            </h3>
            <p className="text-xs leading-relaxed">
              In accordance with Section 11 of the DPDP Act 2023, you retain unfettered rights to access your complete data ledger (via CSV/Docx exports), correct personal details in Profile Settings, or perform total erasure of all records by clearing your local storage or requesting account deletion through our Grievance Officer at <a href="mailto:vaultiq.in@gmail.com" className="text-cyan-600 dark:text-cyan-400 underline font-mono font-medium">vaultiq.in@gmail.com</a>.
            </p>
          </div>
        </section>

        {/* PART 2: TERMS OF SERVICE & USER AGREEMENT */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <FileText size={18} className="text-[#00C0F0]" />
            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white">
              Part II: Terms of Service & User Agreement
            </h2>
          </div>

          <p>
            By accessing, creating an account, or interacting with any module of the Vault IQ portal, you agree to be bound by the following legally enforceable terms:
          </p>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm">
              2.1 Financial Planning Aid Disclaimer (Non-Brokerage)
            </h3>
            <p className="text-xs leading-relaxed">
              Vault IQ provides financial organization, budgeting formulas (e.g. 50/30/20, custom splits), and milestone tracking tools for informational and planning purposes only. Vault IQ is not a registered Asset Management Company (AMC), portfolio manager, non-banking financial company (NBFC), or stockbroker under SEBI or RBI regulations. Computations and AI smart suggestions should not be construed as legally binding legal, tax, or investment advice.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm">
              2.2 User Responsibilities & Security Safeguards
            </h3>
            <p className="text-xs leading-relaxed">
              You are solely responsible for maintaining the confidentiality of your credentials, 4/6-digit PIN passcodes, and pattern locks. Any actions performed within your authenticated vault session are deemed authorized by you.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 dark:text-white text-sm">
              2.3 EMI & Scheduled SMS Simulation Disclaimer
            </h3>
            <p className="text-xs leading-relaxed">
              Alerts and payment notifications simulated across the Remainder / EMI Sentinel menu provide scheduled reminders inside the application environment. Users remain solely responsible for executing actual payments with their respective lending institutions (HDFC, SBI, ICICI, etc.) prior to stipulated due dates.
            </p>
          </div>
        </section>
      </div>

      {/* Official Grievance & Compliance Footer */}
      <div className="p-5 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-3xl border border-[#DEDDDA] dark:border-[#3E403D] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
          <span className="font-bold text-gray-800 dark:text-gray-200 block text-sm">
            Grievance Redressal & Legal Officer
          </span>
          <span>Contact for DPDP compliance inquiries, feedback, or grievances: </span>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=vaultiq.in@gmail.com&su=Vault%20IQ%20Legal%20Compliance%20Inquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[#00C0F0] font-semibold underline"
          >
            vaultiq.in@gmail.com
          </a>
        </div>

        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=vaultiq.in@gmail.com&su=Vault%20IQ%20Legal%20Compliance%20Inquiry"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-cyan-500/25 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Mail size={15} /> Post Grievance to Legal Desk
          <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => <LegalAndCompliance />;
export const TermsAndConditions: React.FC = () => <LegalAndCompliance />;

/**
 * Help Desk Component
 * Features dedicated Gmail Support & Grievance Redirection Button for vaultiq.in@gmail.com.
 */
export const HelpDesk: React.FC<HelpDeskProps> = ({ username }) => {
  const [supportMessage, setSupportMessage] = useState("");
  const [supportCategory, setSupportCategory] = useState("Grievance / Technical Issue");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Redirection URL to Gmail compose
  const getGmailComposeUrl = (subject: string = "Vault IQ Grievance / Support Query", body: string = "") => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body || `Hi Vault IQ Team,\n\nI would like to post the following grievance / support query:\n\nUser: ${username}\nCategory: ${supportCategory}\n\nDetails:\n`);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=vaultiq.in@gmail.com&su=${encodedSubject}&body=${encodedBody}`;
  };

  const handleRedirectToGmail = (category?: string) => {
    const targetCategory = category || supportCategory;
    const bodyContent = supportMessage
      ? `Hi Vault IQ Support Team,\n\nUser: ${username}\nCategory: ${targetCategory}\n\nConcern Description:\n${supportMessage}\n\nThank you,\n${username}`
      : `Hi Vault IQ Support Team,\n\nI am reaching out regarding ${targetCategory} on Vault IQ.\nUser: ${username}\n\nDetails:\n`;
    
    const gmailUrl = getGmailComposeUrl(`Vault IQ Grievance: ${targetCategory}`, bodyContent);
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    // Immediately trigger redirection to Gmail to complete posting grievance
    handleRedirectToGmail();

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setSupportMessage("");
    }, 4000);
  };

  return (
    <div className="bg-white dark:bg-[#2A2B29] rounded-4xl p-6 md:p-8 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-8 max-w-5xl mx-auto" id="help-desk-view">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#DEDDDA] dark:border-[#3E403D]/60 pb-4">
        <div className="p-2.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-500/20">
          <LifeBuoy size={26} />
        </div>
        <div>
          <h1 className="text-xl font-display font-extrabold text-gray-900 dark:text-white">
            Vault IQ Support & Grievance Help Desk
          </h1>
          <p className="text-xs text-gray-400">Direct resolution assistance and official grievance redressal</p>
        </div>
      </div>

      {/* Prominent Gmail Grievance Hero Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-cyan-500/10 via-emerald-500/10 to-transparent dark:from-cyan-500/15 dark:via-emerald-500/15 dark:to-transparent rounded-3xl border border-cyan-500/30 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold tracking-wide uppercase">
            <Mail size={13} className="text-[#00C0F0]" />
            <span>Official Grievance Channel</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 dark:text-white">
            Need Help or Wish to Post a Grievance?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Touch the button below to redirect directly to Gmail compose addressed to our dedicated grievance team at <strong className="font-mono text-cyan-600 dark:text-cyan-400">vaultiq.in@gmail.com</strong>.
          </p>
        </div>

        {/* Primary Gmail Redirection Button */}
        <div className="shrink-0 flex flex-col items-center gap-2 w-full md:w-auto">
          <a
            href={getGmailComposeUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              handleRedirectToGmail();
            }}
            className="w-full md:w-auto px-7 py-4 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-extrabold rounded-2xl shadow-xl hover:shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2.5 text-sm sm:text-base font-sans text-center"
            id="btn-redirect-gmail-grievance"
          >
            <Mail size={20} className="text-[#1C1D1B]" />
            <span>Gmail Support: vaultiq.in@gmail.com</span>
            <ArrowUpRight size={18} />
          </a>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono font-semibold">
            Touch to post a grievance directly via Gmail
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Support contact channels & Quick Categories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-3xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="text-[#00C0F0]" size={18} />
              <span>Direct Support Mail</span>
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-300 leading-relaxed">
              For account issues, split formulas, loan reminders, Safe Zone security, or DPDP rights:
            </p>

            <a
              href="mailto:vaultiq.in@gmail.com?subject=Vault%20IQ%20User%20Support%20Query"
              className="w-full py-2.5 px-4 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] hover:border-cyan-500 text-gray-800 dark:text-white font-bold rounded-xl text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer font-mono"
            >
              <span>vaultiq.in@gmail.com</span>
              <ExternalLink size={13} className="text-[#00C0F0]" />
            </a>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <Phone size={15} className="text-[#00C0F0]" />
              <span>Priority Helpline</span>
            </div>
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
              Toll-Free Helpline: +91 1800-VAULT-IQ (Mon-Fri, 9am - 6pm IST)
            </p>
          </div>
        </div>

        {/* Grievance Submission Form with Direct Gmail Dispatch */}
        <div className="lg:col-span-3 bg-gray-50 dark:bg-[#1C1D1B]/40 p-6 rounded-3xl border border-[#DEDDDA] dark:border-[#3E403D] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={16} className="text-[#00C0F0]" />
              <span>Draft & Send Grievance</span>
            </h3>
            <span className="text-[10px] font-mono text-gray-400">Target: vaultiq.in@gmail.com</span>
          </div>

          <AnimatePresence mode="wait">
            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-10 flex flex-col items-center gap-3 text-center"
              >
                <CheckCircle className="w-12 h-12 text-emerald-500" />
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                  Gmail Compose Redirected!
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                  Hi {username}, your grievance draft has been opened in Gmail addressed to <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">vaultiq.in@gmail.com</span>. Reference ID: #VIQ-{Math.floor(100000 + Math.random() * 900000)}.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmitSupport}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Grievance Category
                  </label>
                  <select
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-cyan-500/40 outline-none text-xs font-medium"
                  >
                    <option value="Grievance / Technical Issue">General Grievance / Technical Issue</option>
                    <option value="AI Bill Scanner Issue">AI Bill Scanner Assistance</option>
                    <option value="Salary Split Customizer">Salary Split Ratios & Income Logs</option>
                    <option value="Goal Setter & Milestones">Goal Setter & Milestones</option>
                    <option value="EMI / Loan Reminders">EMI / Loan Reminders & Editing</option>
                    <option value="Safe Zone Security">Safe Zone PIN & Stash Security</option>
                    <option value="Log Report Downloads">Monthly & Yearly Log Downloads</option>
                    <option value="DPDP Privacy & Compliance">DPDP Data Privacy / Legal Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Describe Your Grievance / Query
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about your query or grievance here..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-cyan-500/40 outline-none text-xs"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer"
                    id="btn-raise-ticket-gmail"
                  >
                    <Mail size={15} /> Redirect to Gmail Compose
                  </button>
                  <a
                    href="mailto:vaultiq.in@gmail.com?subject=Vault%20IQ%20Support%20Query"
                    className="py-3 px-4 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] hover:border-cyan-500 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Default Mail App</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
