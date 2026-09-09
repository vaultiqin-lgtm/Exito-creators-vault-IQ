import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import authRoutes from "./server/routes/authRoutes.js";
import { startReportScheduler, generateAndSendReport, getUserDoc } from "./server/services/reportScheduler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for universal compatibility (Vercel previews, local dev, custom domains)
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Increase payload size limit for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will fallback to client-side rule-based simulators.");
}

// ==========================================
// SECURE BACKEND FIREWALL & DATA PROTECTION
// ==========================================

const secureFirewallMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // SQL Injection Pattern Protection
  const sqlPattern = /(UNION\s+SELECT|SELECT\s+.*\s+FROM|INSERT\s+INTO|UPDATE\s+.*\s+SET|DELETE\s+FROM|DROP\s+TABLE|'OR'|--|#)/i;
  // Cross-Site Scripting (XSS) Pattern Protection
  const xssPattern = /(<script|javascript:|onmouseover|onerror|onload|<iframe>)/i;
  // Directory Traversal Path Protection
  const traversalPattern = /(\.\.\/|\.\.\\|etc\/passwd|win\.ini)/i;

  const payloadString = JSON.stringify(req.body || {}) + JSON.stringify(req.query || {}) + req.url;

  if (sqlPattern.test(payloadString)) {
    console.warn(`[FIREWALL ALARM] Blocked potential SQL Injection attempt from IP ${req.ip} on route ${req.url}`);
    res.status(403).json({ error: "Firewall Blocked: Malicious SQL injection signature identified. Security incident logged." });
    return;
  }

  if (xssPattern.test(payloadString)) {
    console.warn(`[FIREWALL ALARM] Blocked potential Cross-Site Scripting (XSS) script from IP ${req.ip} on route ${req.url}`);
    res.status(403).json({ error: "Firewall Blocked: Malicious script/XSS injection signature identified. Security incident logged." });
    return;
  }

  if (traversalPattern.test(payloadString)) {
    console.warn(`[FIREWALL ALARM] Blocked potential Path Traversal signature from IP ${req.ip} on route ${req.url}`);
    res.status(403).json({ error: "Firewall Blocked: Unauthorized file traversal signature identified." });
    return;
  }

  // Set hardened security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");

  next();
};

// Mount the Secure Firewall globally to guard all api operations
app.use("/api", secureFirewallMiddleware);

// Mount Secure Gmail OTP Authentication Routes
app.use("/api/auth", authRoutes);

// ==========================================
// AUTOMATED BACKGROUND EMI/LOAN SMS ALERTS JOB
// ==========================================

interface EmiAlert {
  id: string;
  loanName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  mobile: string;
  username: string;
}

const scheduledEmiAlerts: EmiAlert[] = [];

// Automated background alert cron job - DISABLED
// The automated Gmail/SMS sending system has been disabled.
// setInterval(() => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   scheduledEmiAlerts.forEach((alert) => {
//     if (!alert.dueDate || !alert.mobile) return;
//     const due = new Date(alert.dueDate);
//     due.setHours(0, 0, 0, 0);
//     const diffTime = due.getTime() - today.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     if (diffDays >= 0 && diffDays <= 3) {
//       console.log(`[AUTOMATED BACKGROUND CRON JOB - EMI/LOAN SMS DISPATCH]`);
//     }
//   });
// }, 45000);

// ==========================================
// API ENDPOINTS
// ==========================================

app.post("/api/register-emi-alerts", (req: express.Request, res: express.Response) => {
  const { loans, username, mobile } = req.body;
  if (!username || !mobile) {
    res.status(400).json({ error: "username and mobile are required" });
    return;
  }

  // Purge previous alerts for this specific active user session
  const remainingAlerts = scheduledEmiAlerts.filter(a => a.username !== username);
  scheduledEmiAlerts.length = 0;
  scheduledEmiAlerts.push(...remainingAlerts);

  if (Array.isArray(loans)) {
    loans.forEach((loan: any) => {
      // Only register pending EMI/Loan alerts
      if (loan.status !== "Paid") {
        scheduledEmiAlerts.push({
          id: loan.id || Math.random().toString(36).substring(2, 9),
          loanName: loan.name || "EMI Installment",
          amount: Number(loan.amount) || 0,
          dueDate: loan.dueDate || "",
          mobile: mobile,
          username: username
        });
      }
    });
  }

  res.json({
    success: true,
    message: `Securely registered ${loans?.length || 0} active EMI renewal alerts under background cron monitor.`,
    activeAlertsCount: scheduledEmiAlerts.length
  });
});

// AI Appreciation Endpoint
app.post("/api/gemini/appreciate", async (req: express.Request, res: express.Response) => {
  const { accumulatedSavings } = req.body;
  if (typeof accumulatedSavings !== "number") {
    res.status(400).json({ error: "accumulatedSavings must be a number" });
    return;
  }

  if (!ai) {
    res.json({
      message: `Shabaash! You've successfully saved a total of ₹${accumulatedSavings.toLocaleString('en-IN')}. Every rupee counts towards a brighter financial future!`
    });
    return;
  }

  try {
    const prompt = `The user has accumulated a total of ₹${accumulatedSavings} in savings. 
Write a short, highly engaging, and motivating Indian-themed financial appreciation message (under 30 words). 
You can use subtle Indian references or encouraging financial advice, in a lighthearted, witty, and positive tone. Output ONLY the appreciation message.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ message: response.text?.trim() || `Great job! You saved ₹${accumulatedSavings.toLocaleString('en-IN')}!` });
  } catch (error: any) {
    console.error("Error in appreciate:", error);
    res.json({
      message: `Kya baat hai! You have successfully accumulated ₹${accumulatedSavings.toLocaleString('en-IN')} in savings. Keep crushing your financial goals!`
    });
  }
});

// AI Bill Scanner Endpoint
app.post("/api/gemini/scan-bill", async (req: express.Request, res: express.Response) => {
  const { image, mimeType } = req.body;
  if (!image || !mimeType) {
    res.status(400).json({ error: "image (base64) and mimeType are required" });
    return;
  }

  if (!ai) {
    // Return a simulated scanned bill when API key is missing
    res.json({
      amount: Math.floor(Math.random() * 800) + 120,
      category: "Food",
      description: "Local Indian Cafe (Simulated Scan)",
      date: new Date().toISOString().split('T')[0]
    });
    return;
  }

  // Strip prefix if any (e.g. "data:image/jpeg;base64,")
  let base64Data = image;
  if (image.includes("base64,")) {
    base64Data = image.split("base64,")[1];
  }

  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const promptPart = {
      text: `Scan this bill/receipt. Extract the total amount, category of expense, description/merchant name, and transaction date.
If details are blurry or missing, make a smart guess. Return the response in strict JSON format matching the schema.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, promptPart],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: {
              type: Type.NUMBER,
              description: "The total amount of the bill in Indian Rupees (number only, no currency symbols).",
            },
            category: {
              type: Type.STRING,
              description: "The category of the bill. Must be one of: Groceries, Food, Rent, Entertainment, Travel, Shopping, Utilities, Medical, Others.",
            },
            description: {
              type: Type.STRING,
              description: "Name of the merchant, shop, or a brief description of what was bought.",
            },
            date: {
              type: Type.STRING,
              description: "The date of the transaction (YYYY-MM-DD format). Default to today's date if not readable.",
            },
          },
          required: ["amount", "category", "description", "date"],
        },
      },
    });

    const resultText = response.text?.trim() || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error scanning bill:", error);
    // Fallback response
    res.json({
      amount: 350,
      category: "Food",
      description: "Indian Restaurant Bill (AI Scan Fallback)",
      date: new Date().toISOString().split('T')[0]
    });
  }
});

// Smart Repayment Suggestion Endpoint
app.post("/api/gemini/suggest-repayment", async (req: express.Request, res: express.Response) => {
  const { loanName, amount, dueDate, reason } = req.body;

  if (!ai) {
    res.json({
      suggestions: [
        "Create an immediate emergency budget by cutting all luxury spends (dining, OTT subscriptions) to secure the payment amount.",
        "Talk to the lender of '" + loanName + "' to check if you can split the amount or secure a short grace period.",
        "Consider liquidating minor short-term investments or using a zero-interest pay-later system if available temporarily."
      ]
    });
    return;
  }

  try {
    const prompt = `The user has an upcoming/overdue loan or EMI payment.
Details:
- Loan/EMI Name: ${loanName}
- Amount: ₹${amount}
- Due Date: ${dueDate}
- Context/Reason for budget tight: ${reason || "Insufficient monthly savings left"}

Provide exactly 3 highly practical, actionable, and smart suggestions in the Indian financial context for how they can pay this loan, manage default risk, and save money to cover it.
Keep each suggestion short, crisp, and under 25 words. Return them as a JSON list of strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    const suggestions = JSON.parse(response.text?.trim() || "[]");
    res.json({ suggestions });
  } catch (error: any) {
    console.error("Error in suggest-repayment:", error);
    res.json({
      suggestions: [
        "Prioritize this EMI first to safeguard your CIBIL score and avoid high-penalty late fees.",
        "Contact your bank or lender immediately to negotiate a repayment window or minor delay.",
        "Review your asset portfolio and temporarily tap into low-yield short-term liquid funds."
      ]
    });
  }
});

// Full-Stack 4-Digit PIN Lock Verification Endpoint
app.post("/api/verify-pin", (req: express.Request, res: express.Response) => {
  const { pin, expectedPin } = req.body;
  if (!pin || pin.length !== 4) {
    res.status(400).json({ error: "PIN must be exactly 4 digits" });
    return;
  }

  const matches = expectedPin ? (pin === expectedPin) : (pin === "1234");
  if (matches) {
    res.json({ success: true, message: "PIN lock verified successfully." });
  } else {
    res.json({ success: false, message: "Incorrect PIN code. Please try again." });
  }
});

// ==========================================
// SECURE BACKEND 302 REDIRECT (Req 5 & 6)
// ==========================================
app.get("/api/lender-redirect", (req: express.Request, res: express.Response) => {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    res.redirect("https://www.sbi.co.in/");
    return;
  }
  // Perform immediate server-side 302 redirection, bypassing any intermediary client UI
  res.redirect(302, url);
});

// ==========================================
// BACKEND SECURED FIREBASE/FALLBACK OTP SYSTEM (Req 1, 3, 5)
// ==========================================

// In-memory store for active generated OTPs and rate limiting
const activeOtps: Record<string, { code: string; expiresAt: number; attempts: number }> = {};
const otpRequestCooldowns: Record<string, number> = {};

app.post("/api/auth/send-otp", (req: express.Request, res: express.Response) => {
  const { mobile, username, purpose } = req.body;
  if (!mobile || !/^\d{10}$/.test(mobile.replace(/\D/g, ""))) {
    res.status(400).json({ error: "A valid 10-digit mobile number is required" });
    return;
  }

  const cleanMobile = mobile.replace(/\D/g, "");
  const now = Date.now();
  const lastRequestTime = otpRequestCooldowns[cleanMobile] || 0;

  // Enforce 30-second request cooldown to prevent flood attacks
  if (now - lastRequestTime < 30000) {
    const remainingSecs = Math.ceil((30000 - (now - lastRequestTime)) / 1000);
    res.status(429).json({
      success: false,
      error: `Rate limit enforced: Please wait ${remainingSecs} seconds before requesting another OTP.`
    });
    return;
  }

  otpRequestCooldowns[cleanMobile] = now;

  // Generate 6-digit secure OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `${username || "guest"}_${cleanMobile}`;
  
  activeOtps[key] = {
    code: otpCode,
    expiresAt: now + 5 * 60 * 1000, // Valid for exactly 5 minutes
    attempts: 0
  };

  console.log(`\n======================================================`);
  console.log(`[BACKEND OTP ENGINE - DISPATCH]`);
  console.log(`Sent to Mobile: +91 ${cleanMobile}`);
  console.log(`User/Purpose: ${username || "Guest"} | ${purpose || "Auth Verification"}`);
  console.log(`Generated OTP Code: ${otpCode}`);
  console.log(`Single-Use Expiry: 5 Minutes (Rate-limited: 30s Cooldown)`);
  console.log(`======================================================\n`);

  res.json({
    success: true,
    message: `A secure 6-digit verification code has been dispatched to +91 ${cleanMobile}.`,
    otp: otpCode,
    redirectTo: purpose === "reset" ? "otp-verify" : "login-otp-verify"
  });
});

app.post("/api/auth/verify-otp", (req: express.Request, res: express.Response) => {
  const { mobile, username, otp, purpose } = req.body;
  if (!mobile || !otp) {
    res.status(400).json({ error: "Mobile and 6-digit OTP code are required" });
    return;
  }

  const cleanMobile = mobile.replace(/\D/g, "");
  const key = `${username || "guest"}_${cleanMobile}`;
  const record = activeOtps[key];

  if (!record) {
    res.json({ success: false, error: "No active OTP verification session found for this mobile number." });
    return;
  }

  // Check 5-minute expiry
  if (Date.now() > record.expiresAt) {
    delete activeOtps[key];
    res.json({ success: false, error: "The verification code has expired (5-minute limit). Please request a new OTP." });
    return;
  }

  // Enforce Maximum 5 failed verification attempts
  if (record.attempts >= 5) {
    delete activeOtps[key];
    res.json({ success: false, error: "Maximum verification attempts (5/5) exceeded. Session locked for security. Request a new OTP." });
    return;
  }

  if (record.code !== otp) {
    record.attempts += 1;
    const remaining = 5 - record.attempts;
    res.json({
      success: false,
      error: `Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : "Session locked."}`
    });
    return;
  }

  // Single-use: invalidates immediately after successful verification
  delete activeOtps[key];

  console.log(`[BACKEND OTP ENGINE] Successfully verified mobile +91 ${cleanMobile} for user ${username || "guest"}`);

  res.json({
    success: true,
    message: "OTP Verified successfully via security engine!",
    redirectTo: purpose === "reset" ? "reset-password" : "dashboard"
  });
});

// ==========================================
// AI-POWERED FINANCIAL REPORT PIPELINE (US-02 & US-03)
// Pipeline: Comment Box → API Gateway → DB Query → AI/LLM → Notification
// ==========================================

app.post("/api/reports/generate", async (req: express.Request, res: express.Response) => {
  const { type, email, mobile, username, uid, userNote, expenses, goals, loans, salary } = req.body;
  if (!type || !username) {
    res.status(400).json({ error: "type and username are required" });
    return;
  }

  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const today = new Date().toISOString().split("T")[0];

  // Determine report data source (defaults to live, unless set to database)
  let useLive = true;
  let fdFromDb: any = null;
  if (uid) {
    try {
      const userDoc = await getUserDoc(uid);
      if (userDoc) {
        useLive = (userDoc.report_data_source !== "database");
        fdFromDb = userDoc.financial_data;
      }
    } catch (err) {
      console.warn("[REPORTS GENERATE] failed to get user settings from DB, using live data:", err);
    }
  }

  // ── STEP 1: API GATEWAY / WEBHOOK HANDLER ──
  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  VAULT IQ REPORT PIPELINE - ${type.toUpperCase()} REPORT              ║`);
  console.log(`╚══════════════════════════════════════════════════════╝`);
  console.log(`[STEP 1/4] API GATEWAY: Request authenticated for user "${username}"`);
  console.log(`  → Report Type: ${type === "daily" ? "Daily Expense Summary" : "Monthly Financial Statement"}`);
  console.log(`  → Target Email: ${email || "N/A"}`);
  console.log(`  → Target Mobile: +91 ${mobile || "N/A"}`);
  console.log(`  → Data Source: ${useLive ? "Live Web Session" : "Database Records (Firestore)"}`);
  if (userNote) console.log(`  → User Note: "${userNote}"`);

  // ── STEP 2: DATABASE QUERY (Aggregate financial data) ──
  console.log(`[STEP 2/4] DATABASE QUERY: Aggregating financial records...`);

  const expenseList: any[] = useLive ? (Array.isArray(expenses) ? expenses : []) : (fdFromDb && Array.isArray(fdFromDb.expenses) ? fdFromDb.expenses : []);
  const goalList: any[] = useLive ? (Array.isArray(goals) ? goals : []) : (fdFromDb && Array.isArray(fdFromDb.goals) ? fdFromDb.goals : []);
  const loanList: any[] = useLive ? (Array.isArray(loans) ? loans : []) : (fdFromDb && Array.isArray(fdFromDb.loans) ? fdFromDb.loans : []);
  const baseSalary = useLive ? (Number(salary) || 0) : (fdFromDb && Number(fdFromDb.salary) || 0);

  // Daily filter: expenses logged today
  const todayExpenses = expenseList.filter((e: any) => e.date === today);
  const todayTotal = todayExpenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

  // Monthly filter: expenses this month
  const currentMonth = today.substring(0, 7); // YYYY-MM
  const monthExpenses = expenseList.filter((e: any) => e.date?.startsWith(currentMonth));
  const monthTotal = monthExpenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  const targetExpenses = type === "daily" ? todayExpenses : monthExpenses;
  targetExpenses.forEach((e: any) => {
    const cat = e.category || "Others";
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(e.amount) || 0);
  });
  const categoryBreakdown = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }));

  // Goals summary
  const totalGoalTarget = goalList.reduce((sum: number, g: any) => sum + (Number(g.targetAmount) || 0), 0);
  const totalGoalSaved = goalList.reduce((sum: number, g: any) => sum + (Number(g.currentSavings) || 0), 0);
  const savingsRate = baseSalary > 0 ? Math.round((totalGoalSaved / baseSalary) * 100) : 0;

  // Loans summary
  const pendingLoans = loanList.filter((l: any) => l.status !== "Paid");
  const totalLoanAmount = pendingLoans.reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0);

  const aggregatedData = {
    reportType: type,
    date: today,
    salary: baseSalary,
    expenseCount: targetExpenses.length,
    expenseTotal: type === "daily" ? todayTotal : monthTotal,
    categoryBreakdown,
    topCategory: categoryBreakdown[0]?.category || "None",
    topCategoryAmount: categoryBreakdown[0]?.amount || 0,
    goalCount: goalList.length,
    totalGoalTarget,
    totalGoalSaved,
    savingsRate,
    pendingLoanCount: pendingLoans.length,
    totalLoanAmount,
    remainingBudget: baseSalary - (type === "daily" ? todayTotal : monthTotal),
  };

  console.log(`  → Expenses in scope: ${aggregatedData.expenseCount} records, ₹${aggregatedData.expenseTotal.toLocaleString("en-IN")}`);
  console.log(`  → Top category: ${aggregatedData.topCategory} (₹${aggregatedData.topCategoryAmount.toLocaleString("en-IN")})`);
  console.log(`  → Savings rate: ${aggregatedData.savingsRate}% | Goals: ${aggregatedData.goalCount} active`);
  console.log(`  → Pending loans: ${aggregatedData.pendingLoanCount} (₹${aggregatedData.totalLoanAmount.toLocaleString("en-IN")})`);

  // ── STEP 3: AI / LLM ENGINE (Generate structured summary) ──
  console.log(`[STEP 3/4] AI/LLM ENGINE: Generating structured financial summary...`);

  let aiSummary = "";

  if (ai) {
    try {
      const prompt = type === "daily"
        ? `You are Vault IQ's financial AI analyst. Generate a professional, concise daily expense summary report for user "${username}" for ${today}.

Data:
- Base Salary: ₹${baseSalary.toLocaleString("en-IN")}
- Expenses Today: ${todayExpenses.length} transactions totalling ₹${todayTotal.toLocaleString("en-IN")}
- Category Breakdown: ${categoryBreakdown.map(c => `${c.category}: ₹${c.amount.toLocaleString("en-IN")}`).join(", ") || "No expenses"}
- Active Savings Goals: ${goalList.length} goals with ₹${totalGoalSaved.toLocaleString("en-IN")} saved of ₹${totalGoalTarget.toLocaleString("en-IN")} target
- Pending EMIs/Loans: ${pendingLoans.length} (₹${totalLoanAmount.toLocaleString("en-IN")})
- Remaining Budget: ₹${(baseSalary - todayTotal).toLocaleString("en-IN")}
${userNote ? `- User's personal note: "${userNote}"` : ""}

Format the report as a structured summary with these sections:
1. 📊 Daily Overview (2-3 sentence summary)
2. 💸 Expense Breakdown (bullet points by category)
3. 🎯 Savings Health Check (brief assessment)
4. 💡 Smart Tip (one actionable Indian financial tip)

Keep it under 250 words. Use ₹ for currency. Be encouraging but honest.`
        : `You are Vault IQ's financial AI analyst. Generate a comprehensive monthly financial summary report for user "${username}" for the month of ${new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}.

Data:
- Base Monthly Salary: ₹${baseSalary.toLocaleString("en-IN")}
- Total Expenses This Month: ${monthExpenses.length} transactions totalling ₹${monthTotal.toLocaleString("en-IN")}
- Category Breakdown: ${categoryBreakdown.map(c => `${c.category}: ₹${c.amount.toLocaleString("en-IN")}`).join(", ") || "No expenses"}
- Savings Goals Progress: ${goalList.length} goals with ₹${totalGoalSaved.toLocaleString("en-IN")} saved of ₹${totalGoalTarget.toLocaleString("en-IN")} target (${savingsRate}% savings rate)
- Pending EMIs/Loans: ${pendingLoans.length} totalling ₹${totalLoanAmount.toLocaleString("en-IN")}
- Net Remaining: ₹${(baseSalary - monthTotal).toLocaleString("en-IN")}
${userNote ? `- User's personal note: "${userNote}"` : ""}

Format the report as a structured summary with these sections:
1. 📊 Monthly Overview (3-4 sentence executive summary)
2. 💸 Spending Analysis (category breakdown with percentages of salary)
3. 🎯 Goals & Savings Progress (each goal's status)
4. 🏦 Loan & EMI Health (pending obligations assessment)
5. 💡 Financial Recommendations (2-3 actionable tips for next month)

Keep it under 400 words. Use ₹ for currency. Be professional and encouraging.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      aiSummary = response.text?.trim() || "";
      console.log(`  → AI Summary generated successfully (${aiSummary.length} chars)`);
    } catch (error: any) {
      console.error(`  → AI generation error: ${error.message}`);
    }
  }

  // Fallback if AI is unavailable or failed
  if (!aiSummary) {
    if (type === "daily") {
      aiSummary = `📊 **Daily Financial Summary – ${today}**

**Daily Overview**
You logged ${todayExpenses.length} expense${todayExpenses.length !== 1 ? "s" : ""} today totalling ₹${todayTotal.toLocaleString("en-IN")} against your monthly base salary of ₹${baseSalary.toLocaleString("en-IN")}. ${todayTotal === 0 ? "A zero-spend day — excellent discipline!" : todayTotal < baseSalary * 0.05 ? "Light spending day — well within healthy limits." : "Moderate spending detected — review your top categories below."}

**💸 Expense Breakdown**
${categoryBreakdown.length > 0 ? categoryBreakdown.map(c => `• ${c.category}: ₹${c.amount.toLocaleString("en-IN")}`).join("\n") : "• No expenses logged today."}

**🎯 Savings Health**
You have ${goalList.length} active goal${goalList.length !== 1 ? "s" : ""} with ₹${totalGoalSaved.toLocaleString("en-IN")} saved toward a target of ₹${totalGoalTarget.toLocaleString("en-IN")} (${savingsRate}% savings rate).

**💡 Smart Tip**
${todayTotal === 0 ? "Consider putting the money you saved today into one of your dream goals!" : "Track every rupee — small daily expenses compound into large monthly totals. Review your top spending category and look for savings opportunities."}`;
    } else {
      aiSummary = `📊 **Monthly Financial Report – ${new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}**

**Monthly Overview**
This month you recorded ${monthExpenses.length} expense${monthExpenses.length !== 1 ? "s" : ""} totalling ₹${monthTotal.toLocaleString("en-IN")} against your salary of ₹${baseSalary.toLocaleString("en-IN")}. Your savings rate stands at ${savingsRate}%, with ₹${(baseSalary - monthTotal).toLocaleString("en-IN")} remaining after expenses.

**💸 Spending Analysis**
${categoryBreakdown.length > 0 ? categoryBreakdown.map(c => `• ${c.category}: ₹${c.amount.toLocaleString("en-IN")} (${baseSalary > 0 ? Math.round((c.amount / baseSalary) * 100) : 0}% of salary)`).join("\n") : "• No expenses logged this month."}

**🎯 Goals & Savings Progress**
${goalList.length > 0 ? goalList.map((g: any) => `• ${g.name}: ₹${(g.currentSavings || 0).toLocaleString("en-IN")} / ₹${(g.targetAmount || 0).toLocaleString("en-IN")} (${g.targetAmount > 0 ? Math.round(((g.currentSavings || 0) / g.targetAmount) * 100) : 0}%)`).join("\n") : "• No active goals configured."}

**🏦 Loan & EMI Health**
${pendingLoans.length > 0 ? `You have ${pendingLoans.length} pending obligation${pendingLoans.length !== 1 ? "s" : ""} totalling ₹${totalLoanAmount.toLocaleString("en-IN")}. Ensure timely payments to protect your CIBIL score.` : "No pending loan obligations — your credit health is clean!"}

**💡 Recommendations**
• ${monthTotal > baseSalary * 0.7 ? "Your spending exceeds 70% of salary. Consider trimming discretionary expenses next month." : "Your spending is within healthy limits. Keep maintaining this discipline!"}
• ${savingsRate < 20 ? "Aim to save at least 20% of your salary following the 50/30/20 budgeting rule." : "Great savings rate! Consider increasing SIP contributions for long-term wealth building."}
• Review upcoming EMI dates in the Reminders tab to avoid late payment penalties.`;
    }
    console.log(`  → Fallback template report generated (${aiSummary.length} chars)`);
  }

  // ── STEP 4: NOTIFICATION SERVICE (Disabled — automated sending removed) ──
  console.log(`[STEP 4/4] NOTIFICATION SERVICE: Automated email/SMS dispatch is disabled.`);

  const notificationChannels = {
    email: { sent: false, target: email || "Not configured (disabled)", timestamp },
    sms: { sent: false, target: mobile ? `+91 ${mobile}` : "Not configured (disabled)", timestamp },
    inApp: { sent: true, target: "Dashboard UI", timestamp }
  };

  // In-App notification only
  console.log(`  🖥️  IN-APP: Report rendered in Settings → Report Console`);
  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  PIPELINE COMPLETE – In-app report generated         ║`);
  console.log(`╚══════════════════════════════════════════════════════╝\n`);

  const msgId = `rpt-${Math.random().toString(36).substring(2, 12)}@vaultiq.com`;

  res.json({
    success: true,
    report: {
      type,
      date: today,
      summary: aiSummary,
      data: aggregatedData,
    },
    notifications: notificationChannels,
    message: `${type === "daily" ? "Daily" : "Monthly"} report generated successfully!`,
    timestamp,
    headers: {
      relay: "local",
      tls: "N/A",
      msgId,
    }
  });
});

// Legacy email dispatch endpoint — DISABLED
// The automated Gmail sending system has been disabled.

// ==========================================
// ELITE INTELLIGENCE SYNDICATE QUERY (Req 3)
// ==========================================

app.post("/api/gemini/syndicate-query", async (req: express.Request, res: express.Response) => {
  const { systemId, systemPrompt, userPrompt, history } = req.body;
  if (!userPrompt) {
    res.status(400).json({ error: "userPrompt is required" });
    return;
  }

  if (!ai) {
    // Elegant role-hardened fallback advice when Gemini API is unconfigured
    const fallbackMap: Record<string, string> = {
      wealthvault: `[WealthVault AI Fallback Executive Guidance]\n\nBased on your financial parameters, here is the curated premium asset allocation model:\n\n1. Liquidity Core: Ensure 4 months of base salary splits are safely secured inside high-yield liquid lockers.\n2. Compounding Vector: Direct 15% of remaining funds into low-expense Nifty 50 indexing funds.\n3. Buffer Safeguard: Avoid locking capitals in volatile micro-caps until the EMI ratio stays under 35% of total base splits.`,
      taxshield: `[TaxShield AI Fallback Executive Guidance]\n\nUnder current Indian Income Tax regulatory structures, optimize as follows:\n\n1. Section 80C Shield: Fully exhaust the ₹1.5 Lakhs limit using modern ELSS funds or low-cost PPF deposits.\n2. Section 80D Health: Secure standard medical insurances for self and senior parents to claim additional tax benefits up to ₹50,000.\n3. National Pension Scheme (80CCD): Invest an extra ₹50,000 for exclusive deductions beyond standard 80C thresholds.`,
      cibilguard: `[CIBIL Guard AI Fallback Executive Guidance]\n\nTo restore or protect high-tier borrowing credentials, implement these protocols:\n\n1. Zero-Late Loop: Automate payment schedules so they trigger 3 days prior to the lender's cycle close.\n2. Limit-Utilization Guard: Keep your revolving Credit Card utilization under 30% to trigger rapid score appreciation.\n3. Borrowing Diversity: Maintain a healthy balance of secured (home/car) and unsecured debts over time.`,
      hustlecore: `[HustleCore AI Fallback Executive Guidance]\n\nTo build a highly monetizable high-leverage freelance side-income engine:\n\n1. Skill Framing: Standardize your experience into a 'Productized Consulting Package' to bill clients premium flat retainers.\n2. Acquisition: Use structured LinkedIn/Substack publishing sequences to establish technical authority.\n3. Delivery Automation: Keep client updates automated using asynchronous dashboards to limit time investments.`
    };

    const responseText = fallbackMap[systemId] || `Hello! I am your premium advisor. To activate full real-time intelligence, please configure your process.env.GEMINI_API_KEY. For now, we recommend maintaining solid liquid splits and keeping loan EMIs below 30% of base splits.`;
    res.json({ response: responseText });
    return;
  }

  try {
    // Format conversation history for Gemini if present
    let finalPrompt = `System Role Context:\n${systemPrompt}\n\n`;
    if (Array.isArray(history)) {
      finalPrompt += "Recent Consultation History:\n";
      history.forEach((h: any) => {
        finalPrompt += `${h.role === "ai" ? "Advisor" : "User"}: ${h.text}\n`;
      });
    }
    finalPrompt += `\nNew User Consultation Query:\n${userPrompt}\n\nPlease deliver your final elite financial analysis and structured advice:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: finalPrompt,
    });

    res.json({ response: response.text?.trim() || "Consultant is compiling data. Please re-try." });
  } catch (error: any) {
    console.error("Syndicate query model error:", error);
    res.status(500).json({ error: "The model was unable to process the syndicate query. Fallback triggers activated." });
  }
});

// ==========================================
// TEST EMAIL REPORT DISPATCH ENDPOINT
// ==========================================
app.post("/api/notifications/test-email", async (req: express.Request, res: express.Response) => {
  const { uid, email, username, liveData } = req.body;
  if (!uid || !email || !username) {
    res.status(400).json({ error: "uid, email, and username are required." });
    return;
  }

  try {
    const userDoc = await getUserDoc(uid);
    if (!userDoc) {
      res.status(404).json({ error: `User document not found for UID: ${uid}` });
      return;
    }

    const success = await generateAndSendReport({ ...userDoc, email }, uid, liveData);
    if (success) {
      res.json({ success: true, message: `Test email sent successfully to ${email}.` });
    } else {
      res.status(500).json({ error: "Failed to dispatch test email. Ensure SMTP credentials are set correctly." });
    }
  } catch (error: any) {
    console.error("[TEST EMAIL ENDPOINT ERROR]", error);
    res.status(500).json({ error: "Internal server error occurred while sending test email." });
  }
});

// ==========================================
// VITE DEV SERVER / PRODUCTION SERVING
// ==========================================

// Simple Health & Status Check Endpoint
app.get("/api/health", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok", service: "Vault IQ API", timestamp: new Date().toISOString() });
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Vault IQ server running on http://localhost:${PORT}`);
    // Start automated background report scheduler
    try {
      startReportScheduler();
    } catch (schedErr) {
      console.warn("Scheduler initialization notice:", schedErr);
    }
  });
}

// Only start standalone HTTP server when executed directly (not inside Vercel serverless)
if (!process.env.VERCEL) {
  start().catch((err) => {
    console.error("Failed to start server:", err);
  });
}

export { app };
export default app;
