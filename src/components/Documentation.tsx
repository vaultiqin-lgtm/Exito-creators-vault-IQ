import React, { useState } from "react";
import {
  BookOpen,
  Printer,
  FileText,
  Cpu,
  Database,
  Code,
  Shield,
  Activity,
  CheckCircle,
  HelpCircle,
  Info,
} from "lucide-react";
import { motion } from "motion/react";

export const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("intro");

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to compile and print the Documentation PDF.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Vault IQ - Product Documentation & Manual</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
            
            @page {
              size: A4;
              margin: 20mm 15mm 20mm 15mm;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              color: #2d302d;
              line-height: 1.6;
              font-size: 14px;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .header-banner {
              border-bottom: 3px double #5a5a40;
              padding-bottom: 15px;
              margin-bottom: 40px;
              text-align: center;
            }
            
            .brand-title {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: -0.02em;
              color: #2d302d;
              margin: 0;
              text-transform: uppercase;
            }
            
            .brand-subtitle {
              font-family: 'JetBrains Mono', monospace;
              font-size: 12px;
              font-weight: bold;
              color: #5a5a40;
              margin: 5px 0 0 0;
              letter-spacing: 0.15em;
              text-transform: uppercase;
            }
            
            .meta-info {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #777;
              margin-top: 15px;
              font-family: 'JetBrains Mono', monospace;
            }
            
            h1, h2, h3 {
              font-family: 'Space Grotesk', sans-serif;
              color: #2d302d;
              page-break-after: avoid;
            }
            
            h1 {
              font-size: 22px;
              border-bottom: 1px solid #5a5a40;
              padding-bottom: 6px;
              margin-top: 40px;
              text-transform: uppercase;
              letter-spacing: -0.01em;
            }
            
            h2 {
              font-size: 16px;
              margin-top: 25px;
              color: #5a5a40;
            }
            
            h3 {
              font-size: 14px;
              margin-top: 20px;
              font-weight: 600;
            }
            
            p {
              margin-top: 0;
              margin-bottom: 15px;
              text-align: justify;
            }
            
            ul, ol {
              margin-top: 0;
              margin-bottom: 20px;
              padding-left: 20px;
            }
            
            li {
              margin-bottom: 8px;
            }
            
            code {
              font-family: 'JetBrains Mono', monospace;
              background-color: #f5f5f0;
              padding: 2px 5px;
              border-radius: 4px;
              font-size: 12px;
              color: #5a5a40;
            }
            
            pre {
              font-family: 'JetBrains Mono', monospace;
              background-color: #f5f5f0;
              border: 1px solid #deddda;
              padding: 15px;
              border-radius: 8px;
              font-size: 12px;
              overflow-x: auto;
              margin-bottom: 25px;
              line-height: 1.4;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              font-size: 12px;
            }
            
            th, td {
              border: 1px solid #deddda;
              padding: 10px;
              text-align: left;
            }
            
            th {
              background-color: #f5f5f0;
              font-weight: bold;
              color: #2d302d;
            }
            
            .alert-box {
              background-color: #f5f5f0;
              border-left: 4px solid #5a5a40;
              padding: 12px 18px;
              margin-bottom: 25px;
              border-radius: 0 8px 8px 0;
            }
            
            .alert-box p {
              margin: 0;
              font-size: 13px;
              font-style: italic;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            .badge {
              display: inline-block;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              background-color: #5a5a40;
              color: #ffffff;
              padding: 2px 6px;
              border-radius: 4px;
              margin-left: 10px;
              vertical-align: middle;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Cover Page / Header -->
            <div class="header-banner">
              <div class="brand-title">Vault IQ System Documentation</div>
              <div class="brand-subtitle">Financial Intelligence Platform & User Manual</div>
              <div class="meta-info">
                <span>VERSION: 1.4.0 (STABLE)</span>
                <span>GENERATED: ${new Date().toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
                <span>SECURITY: INTERNAL VAULT EXPORT</span>
              </div>
            </div>

            <!-- Table of Contents -->
            <h2>Table of Contents</h2>
            <ol style="font-weight: 500;">
              <li>Platform Overview & Architecture</li>
              <li>Core Modules & Operation Manual</li>
              <li>AI Intelligence & Savings Appreciation Engine</li>
              <li>Local Persistence Storage Schema</li>
              <li>Zero-Error VS Code Extraction & Deployment Guide</li>
            </ol>

            <div class="page-break"></div>

            <!-- Section 1 -->
            <h1>1. Platform Overview & Architecture</h1>
            <p>
              <strong>Vault IQ</strong> is an advanced, client-centric, offline-first personal finance management platform engineered specifically for the Indian financial context. Styled in a bespoke, high-contrast, professional design system utilizing Inter, Space Grotesk, and JetBrains Mono typography with a muted earth-sand and deep charcoal palette, it combines structural rigor with lightweight AI-backed components.
            </p>
            <p>
              The architecture is strictly modularized to provide a split full-stack solution. High-frequency client utilities (such as calculations, ledger tables, charts, and configurations) run natively on the client to ensure instant responsiveness, while heavy computation (such as LLM generation and invoice scanner operations) is proxied securely to the server side.
            </p>

            <h3>Key Architecture Tenets:</h3>
            <ul>
              <li><strong>Offline-First Durability:</strong> All user state variables are loaded, managed, and synced on change within standard, sandboxed client-side key-value namespaces, isolated strictly per active logged-in username.</li>
              <li><strong>Zero External Data Leaks:</strong> All raw monetary data remains strictly inside the user's local security sandbox. Server routes are utilized purely as utility proxies for the secure AI generation engine.</li>
              <li><strong>Refined Typography Pairings:</strong> Interface structures use a customized scale of margins and sizes. Displays pair <em>Space Grotesk</em> for technical headings, <em>Inter</em> for optimized UI layouts, and <em>JetBrains Mono</em> for ledger entries, numbers, and system readouts.</li>
            </ul>

            <div class="alert-box">
              <p><strong>Note on RBI Compliance:</strong> Vault IQ operates strictly under compliance suggestions of the Reserve Bank of India (RBI) with respect to data security guidelines—storing no active credit card credentials, and securing login with simulated biometrics and user-authenticated PIN systems.</p>
            </div>

            <!-- Section 2 -->
            <h1>2. Core Modules & Operation Manual</h1>
            
            <h2>2.1 Secure Vault Portal (Auth)</h2>
            <p>
              Initial access is blocked by the Vault Auth interface. New users can initialize secure portfolios by providing an email/username and secure password. Once registered, security settings allow users to set up a secondary <strong>4-Digit Security PIN</strong> or toggle a <strong>Biometric Touch ID</strong> simulator to secure access on trusted browser devices.
            </p>

            <h2>2.2 Dynamic Salary Splitter & Budget Console</h2>
            <p>
              The budget console introduces standard, tested financial distribution rules customized for Indian salaries (e.g., 50% Essentials, 30% Wants, 20% Committed Savings).
            </p>
            <ul>
              <li><strong>Interactive Charting:</strong> Real-time allocation donut charts built using dynamic scalable visual wrappers automatically update when expenses are logged or salary baselines are adjusted.</li>
              <li><strong>Flexible Categories:</strong> Manual expense entries are tagged across essential buckets (Groceries, Food, Utilities, Fun, EMIs) to evaluate spending behaviors against set margins.</li>
              <li><strong>Split Bill Engine:</strong> Share common utility bills with flatmates. Splitting modules divide amounts equally, monitor payment statuses ("Paid" / "Pending" with check boxes), and provide direct actions to settle balances.</li>
            </ul>

            <h2>2.3 Goal Setter & Dream Tracker</h2>
            <p>
              Allows configuration of long-term milestones (e.g., family trips, vehicle downpayments, high-yield fixed deposits). Saving contributions can be incremented dynamically from available balances. Each increment automatically recalculates milestones, displays a beautiful fluid visual progress indicator, and triggers the AI Savings appreciation cycle.
            </p>

            <h2>2.4 Scheduled Loan Reminders & EMI Advisor</h2>
            <p>
              Track ongoing liabilities (education loans, vehicle loans, credit card balances). When payment challenges arise, the embedded <strong>AI EMI Advisor</strong> evaluates current finances and compiles targeted strategies:
            </p>
            <ul>
              <li><strong>Moratorium Guidance:</strong> Advises on central bank moratorium eligibility rules under temporary distress.</li>
              <li><strong>Loan Restructuring:</strong> Translates terms for tenure extension vs interest rate renegotiation.</li>
              <li><strong>CIBIL Protection:</strong> Outlines detailed measures to prevent negative score drops during payment revisions.</li>
            </ul>

            <div class="page-break"></div>

            <!-- Section 3 -->
            <h1>3. AI Intelligence Systems</h1>
            <p>
              Vault IQ implements a dual-layer AI strategy powered by server-side <strong>Google Gemini</strong> models via the modern <code>@google/genai</code> SDK:
            </p>

            <h2>3.1 AI Savings Appreciation Stream</h2>
            <p>
              When a user prioritizes savings by allocating funds towards a Dream Goal, a server-side route (<code>/api/gemini/appreciate</code>) triggers a custom model call. Gemini analyzes the logged savings amount and generates custom-tailored, encouraging, and witty financial appreciations that motivate users to maintain positive savings habits.
            </p>
            <pre>
// Server appreciation prompt architecture:
const prompt = \`The user has committed ₹\${accumulatedSavings} to their financial goals.
Generate a highly motivating, supportive, and clever 2-sentence financial appreciation
note in Indian style, acknowledging their thrift and progress. Keep it under 250 characters.\`;</pre>

            <h2>3.2 AI EMI Assistance Engine</h2>
            <p>
              When users click "Need Help?" on an EMI reminder, the system sends active financials (salary, expenses, loan weight) to the backend. Gemini processes these metrics to output a high-fidelity, actionable debt-repayment plan, structured with bullet points.
            </p>

            <!-- Section 4 -->
            <h1>4. Local Persistence Storage Schema</h1>
            <p>
              Vault IQ is fully stateless on the database layer and relies on a clean, robust, multi-namespace JSON LocalStorage engine. This guarantees immediate offline storage and high data portability.
            </p>
            
            <table>
              <thead>
                <tr>
                  <th>Storage Namespace Key</th>
                  <th>Value Type</th>
                  <th>Data Fields Included</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <code>vault_iq_active_user</code>
                  <td>String</td>
                  <td>Active session email or username string</td>
                </tr>
                <tr>
                  <code>vault_iq_salary_{username}</code>
                  <td>Float / String</td>
                  <td>User's configured monthly income base in INR</td>
                </tr>
                <tr>
                  <code>vault_iq_expenses_{username}</code>
                  <td>Array of JSON Objects</td>
                  <td><code>id, description, amount, category, date, isAiScanned</code></td>
                </tr>
                <tr>
                  <code>vault_iq_goals_{username}</code>
                  <td>Array of JSON Objects</td>
                  <td><code>id, name, targetAmount, currentSavings, coverImage</code></td>
                </tr>
                <tr>
                  <code>vault_iq_loans_{username}</code>
                  <td>Array of JSON Objects</td>
                  <td><code>id, name, amount, dueDate, isScheduled, status</code></td>
                </tr>
                <tr>
                  <code>vault_iq_groupbills_{username}</code>
                  <td>Array of JSON Objects</td>
                  <td><code>id, description, totalAmount, date, friends: [{name, amount, paid}]</code></td>
                </tr>
                <tr>
                  <code>vault_iq_profile_{username}</code>
                  <td>JSON Object</td>
                  <td><code>username, mobile, pin, biometricEnabled</code></td>
                </tr>
              </tbody>
            </table>

            <div class="page-break"></div>

            <!-- Section 5 -->
            <h1>5. Zero-Error VS Code Extraction & Deployment Guide</h1>
            <p>
              To run Vault IQ locally or extract it to VS Code, follow these instructions to ensure that TypeScript and the package build pipeline execute successfully without errors.
            </p>

            <h3>5.1 Folder Structure Layout</h3>
            <pre>
vault-iq/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts (or equivalent Vite CSS integrations)
├── server.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types.ts
    └── components/
        ├── Auth.tsx
        ├── Dashboard.tsx
        ├── SalarySplitter.tsx
        ├── GoalSetter.tsx
        ├── Reminder.tsx
        ├── Profile.tsx
        ├── Settings.tsx
        ├── LegalAndSupport.tsx
        └── Documentation.tsx</pre>

            <h3>5.2 Local Setup Instructions</h3>
            <ol>
              <li><strong>Extract the files:</strong> Export the workspace ZIP or clone the repository to your local folder.</li>
              <li><strong>Install Node.js dependencies:</strong> Open your terminal inside the root directory and install dependencies:
                <pre>npm install</pre>
              </li>
              <li><strong>Configure Environment Variables:</strong> Create a <code>.env</code> file in the root folder containing your secure Google Gemini API token:
                <pre>GEMINI_API_KEY=your_gemini_api_key_here</pre>
              </li>
              <li><strong>Launch Development Server:</strong> Start the combined Express + Vite dev runtime:
                <pre>npm run dev</pre>
                The app binds to port 3000. Open <code>http://localhost:3000</code> in your browser.
              </li>
              <li><strong>Production Compile & Build:</strong> To bundle the application for production:
                <pre>npm run build</pre>
                This compiles static client files into <code>dist/</code> and bundles the server into <code>dist/server.cjs</code> for fast, serverless-ready execution.
              </li>
            </ol>

            <div style="margin-top: 50px; border-top: 2px solid #5a5a40; padding-top: 15px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #777;">
              © 2026 VAULT IQ INC. SECURED PLATFORM MANUAL. ALL RIGHTS RESERVED.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const sections = [
    { id: "intro", title: "1. Platform Overview", icon: Info },
    { id: "manual", title: "2. Core Modules Guide", icon: FileText },
    { id: "ai", title: "3. AI Intelligence Systems", icon: Cpu },
    { id: "db", title: "4. Database Schema", icon: Database },
    { id: "vscode", title: "5. VS Code Export Guide", icon: Code },
  ];

  return (
    <div className="space-y-6" id="documentation-view">
      {/* Top action card */}
      <div className="bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#5A5A40]/10 text-[#5A5A40] dark:text-[#C2C2A3] rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Vault IQ System Documentation
              <span className="text-[10px] bg-[#5A5A40] text-white dark:bg-[#C2C2A3] dark:text-gray-900 px-2 py-0.5 rounded font-mono font-bold tracking-wider">v1.4</span>
            </h1>
            <p className="text-xs text-gray-400">
              Interactive user manual & developer handbook with print-ready PDF compilation.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportPDF}
          className="w-full md:w-auto px-5 py-2.5 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          id="btn-export-doc-pdf"
        >
          <Printer size={14} /> Compile & Print PDF Manual
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-2 lg:col-span-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-[#5A5A40] text-white shadow-sm dark:bg-[#C2C2A3] dark:text-gray-900"
                    : "bg-white dark:bg-[#2A2B29] text-gray-700 dark:text-gray-300 hover:bg-[#5A5A40]/5 dark:hover:bg-white/5 border border-[#DEDDDA] dark:border-[#3E403D]"
                }`}
              >
                <Icon size={14} />
                {sec.title}
              </button>
            );
          })}
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-3 bg-white dark:bg-[#2A2B29] rounded-3xl p-6 md:p-8 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm min-h-112.5">
          {activeSection === "intro" && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <Info size={16} className="text-[#5A5A40] dark:text-[#C2C2A3]" />
                1. Platform Overview & Design System
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
                <strong>Vault IQ</strong> is an premium personal financial manager tailored for the Indian landscape. Built with modern, offline-first client persistence sandboxing, it gives you full ownership over your financial data while supplying optional server-backed AI modules for budgets and automated appreciations.
              </p>
              <div className="bg-[#F5F5F0] dark:bg-[#1C1D1B] p-4 rounded-xl space-y-2 border border-[#DEDDDA] dark:border-[#3E403D]">
                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Design System Highlights</h3>
                <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-300 space-y-1">
                  <li><strong>Aesthetic Palette:</strong> Light mode utilizes high-contrast warm paper off-whites (<code className="text-[10px]">#F5F5F0</code>) and soft sand tones paired with forest slates (<code className="text-[10px]">#5A5A40</code>).</li>
                  <li><strong>Dark Palette:</strong> Dark mode is built around an eye-safe, ink-slate gray (<code className="text-[10px]">#1C1D1B</code>) accented with warm lime gold highlights (<code className="text-[10px]">#C2C2A3</code>).</li>
                  <li><strong>Layout Rhythm:</strong> Uses extra generous card borders, oversized rounded corners (<code className="text-[10px]">rounded-[24px]</code> to <code className="text-[10px]">rounded-[32px]</code>), and consistent negative space to emulate architectural print design.</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === "manual" && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <FileText size={16} className="text-[#5A5A40] dark:text-[#C2C2A3]" />
                2. Core Modules Operation Manual
              </h2>
              <div className="space-y-4 text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
                <div>
                  <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-1">2.1 Base Salary Splitting (RBI Guidelines)</h3>
                  <p>
                    Configured with standard, expert-vetted budgeting divisions (50% Essentials, 30% Wants, 20% Savings). Changing your monthly base income automatically scales target allocations and resets active warnings if current spending breaks recommended caps.
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-1">2.2 Dream Goal Setter</h3>
                  <p>
                    Track milestones by adding custom images and setting target timelines. Committing extra savings toward your goals automatically recalculates progress bars and calls the server-side appreciation engine.
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-1">2.3 Bill Splitter & Shared Expenses</h3>
                  <p>
                    Manages common room rent and utilities shared with flatmates. Splitting modules divide amounts equally, track individual check boxes, and clear states instantly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "ai" && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <Cpu size={16} className="text-[#5A5A40] dark:text-[#C2C2A3]" />
                3. AI Intelligence Systems
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
                Vault IQ uses server-side <strong>Google Gemini API</strong> models via the modern <code>@google/genai</code> TypeScript SDK to analyze states and offer tailored advice without compromising credential storage.
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 dark:bg-[#1C1D1B] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl">
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#5A5A40] dark:bg-[#C2C2A3] rounded-full"></span>
                    Savings Appreciation Pipelines
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Triggers whenever a user registers incremental savings toward dream trackers. Calls <code>/api/gemini/appreciate</code> to compile motivating messages celebrating budget optimization.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#1C1D1B] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl">
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#5A5A40] dark:bg-[#C2C2A3] rounded-full"></span>
                    EMI Repayment Advisor
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Evaluates income weights and interest rates to suggest credit rescheduling models, RBI moratorium frameworks, and proactive CIBIL index preservation strategies.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "db" && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <Database size={16} className="text-[#5A5A40] dark:text-[#C2C2A3]" />
                4. Local Persistence Storage Schema
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed font-sans">
                To guarantee offline operation and data portability, the system uses custom namespaces in the browser's local storage database:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-gray-100 dark:border-gray-800 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#1C1D1B] text-gray-700 dark:text-gray-300">
                      <th className="p-2 border border-gray-100 dark:border-gray-800">Namespace Key</th>
                      <th className="p-2 border border-gray-100 dark:border-gray-800">Data Type</th>
                      <th className="p-2 border border-gray-100 dark:border-gray-800">Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-500 dark:text-gray-400">
                    <tr>
                      <td className="p-2 border border-gray-100 dark:border-gray-800 font-mono text-[11px] text-[#5A5A40] dark:text-[#C2C2A3]">vault_iq_active_user</td>
                      <td className="p-2 border border-gray-100 dark:border-gray-800 font-mono">string</td>
                      <td className="p-2 border border-gray-100 dark:border-gray-800">Active logged in username session key</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-gray-100 dark:border-gray-800 font-mono text-[11px] text-[#5A5A40] dark:text-[#C2C2A3]">vault_iq_expenses_&#123;user&#125;</td>
                      <td className="p-2 border border-gray-100 dark:border-gray-800 font-mono">Array&lt;Expense&gt;</td>
                      <td className="p-2 border border-gray-100 dark:border-gray-800">Logged budget expense transaction items</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-gray-100 dark:border-gray-800 font-mono text-[11px] text-[#5A5A40] dark:text-[#C2C2A3]">vault_iq_goals_&#123;user&#125;</td>
                      <td className="p-2 border border-gray-100 dark:border-gray-800 font-mono">Array&lt;Goal&gt;</td>
                      <td className="p-2 border border-gray-100 dark:border-gray-800">Dream tracker milestone cards & photo blobs</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-gray-100 dark:border-gray-800 font-mono text-[11px] text-[#5A5A40] dark:text-[#C2C2A3]">vault_iq_loans_&#123;user&#125;</td>
                      <td className="p-2 border border-gray-100 dark:border-gray-800 font-mono">Array&lt;EMI&gt;</td>
                      <td className="p-2 border border-gray-100 dark:border-gray-800">Scheduled EMI liabilities & status logs</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "vscode" && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <Code size={16} className="text-[#5A5A40] dark:text-[#C2C2A3]" />
                5. Zero-Error VS Code Extraction & Setup
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
                Follow this guide to export the full Vault IQ source code from AI Studio to VS Code and run it locally with zero build or compile errors.
              </p>
              <div className="space-y-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                <div className="p-3 bg-gray-50 dark:bg-[#1C1D1B] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl">
                  <span className="block font-sans font-bold text-[#5A5A40] dark:text-[#C2C2A3] mb-1">Step 1: Install packages</span>
                  <code>npm install</code>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-[#1C1D1B] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl">
                  <span className="block font-sans font-bold text-[#5A5A40] dark:text-[#C2C2A3] mb-1">Step 2: Add Gemini credentials</span>
                  <span className="block font-sans text-gray-400 mb-1">Create a .env file at the project root and declare:</span>
                  <code>GEMINI_API_KEY=your_gemini_api_key_here</code>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-[#1C1D1B] border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl">
                  <span className="block font-sans font-bold text-[#5A5A40] dark:text-[#C2C2A3] mb-1">Step 3: Run dev server</span>
                  <code>npm run dev</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
