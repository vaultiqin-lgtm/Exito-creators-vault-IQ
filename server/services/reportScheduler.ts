import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import cron from "node-cron";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";

// Firebase Configuration matching the client-side instance
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBd9QxcoDXaAuw1XpvOGlux9igF99cpmOE",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "vault-iq-e6478.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "vault-iq-e6478",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "vault-iq-e6478.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "426161547149",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:426161547149:web:4f78e5ecbb275659b77fc4",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export const getUserDoc = async (uid: string): Promise<any | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
  } catch (err) {
    console.error(`[SCHEDULER DB ERROR] failed to fetch document for user ${uid}:`, err);
  }
  return null;
};

// Financial Quotes presets for professional templates
const FINANCIAL_QUOTES = [
  "Do not save what is left after spending, but spend what is left after saving. — Warren Buffett",
  "Beware of little expenses; a small leak will sink a great ship. — Benjamin Franklin",
  "A penny saved is a penny earned. — Benjamin Franklin",
  "The safe way to double your money is to fold it over once and put it in your pocket. — Kin Hubbard",
  "It's not how much money you make, but how much money you keep, how hard it works for you, and how many generations you keep it for. — Robert Kiyosaki",
  "Never spend your money before you have earned it. — Thomas Jefferson",
  "Money is a terrible master but an excellent servant. — P.T. Barnum",
  "Wealth consists not in having great possessions, but in having few wants. — Epictetus",
  "An investment in knowledge pays the best interest. — Benjamin Franklin",
  "Every rupee saved today is a seed sown for your future financial freedom. — Vault IQ"
];

// Initialize Nodemailer transporter with connection settings from env variables
const createTransporter = () => {
  const gmailUser = (process.env.GMAIL_USER || process.env.SMTP_USER || "vaultiq.in@gmail.com").trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "cxkectrrwxcdrwdq").replace(/\s+/g, "").trim();

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 465;

  if (smtpHost && smtpHost !== "smtp.gmail.com" && smtpHost.trim() !== "") {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
};

// Send mail helper with exponential retry logic
const sendMailWithRetry = async (
  transporter: nodemailer.Transporter,
  mailOptions: nodemailer.SendMailOptions,
  maxRetries = 3
): Promise<any> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`[SCHEDULER] Dispatching email report, attempt ${attempt} of ${maxRetries}...`);
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (err) {
      if (attempt >= maxRetries) {
        throw err;
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`[SCHEDULER WARNING] Email failed. Retrying in ${delay}ms... Error:`, err);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Main generator & sender of HTML financial statement
export const generateAndSendReport = async (
  userDoc: any, 
  userDocId: string, 
  liveData?: { salary?: number; expenses?: any[]; goals?: any[]; loans?: any[] }
): Promise<boolean> => {
  const email = userDoc.email;
  const displayName = userDoc.displayName || email.split("@")[0];
  const timezone = userDoc.timezone || "Asia/Kolkata";
  const frequency = userDoc.report_frequency || "Daily";
  const dataSource = userDoc.report_data_source || "live";

  console.log(`[SCHEDULER] Starting report pipeline for ${displayName} (${email}) | Freq: ${frequency} | Data Source: ${dataSource}`);

  // Fetch financial aggregates based on data source setting
  const useLive = (dataSource === "live" && liveData);
  const fd = useLive ? liveData : (userDoc.financial_data || { salary: 50000, expenses: [], goals: [], loans: [] });
  const salary = Number(fd.salary) || 0;
  const expenses = Array.isArray(fd.expenses) ? fd.expenses : [];
  const goals = Array.isArray(fd.goals) ? fd.goals : [];
  const loans = Array.isArray(fd.loans) ? fd.loans : [];

  const now = new Date();
  const todayStr = now.toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  // Statistics calculation
  const proRatedIncome = Math.round(salary / 30);
  
  const todayExpensesList = expenses.filter((e: any) => e.date === todayStr);
  const todayExpenses = todayExpensesList.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
  const todaySavings = proRatedIncome - todayExpenses;

  const monthlyExpensesList = expenses.filter((e: any) => e.date?.startsWith(currentMonthStr));
  const monthlyExpenses = monthlyExpensesList.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
  const monthlySavings = salary - monthlyExpenses;

  const totalTransactions = frequency === "Daily" ? todayExpensesList.length : monthlyExpensesList.length;

  // Category breakdown calculations (for current month spend)
  const categoryMap: Record<string, number> = {};
  const inScopeExpenses = frequency === "Daily" ? todayExpensesList : monthlyExpensesList;
  inScopeExpenses.forEach((e: any) => {
    const cat = e.category || "Others";
    categoryMap[cat] = (categoryMap[cat] || 0) + (Number(e.amount) || 0);
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }));

  const topCategory = categoryBreakdown[0]?.category || "None";
  const topCategoryAmount = categoryBreakdown[0]?.amount || 0;

  const remainingBudget = salary - monthlyExpenses;
  const budgetUtilization = salary > 0 ? Math.round((monthlyExpenses / salary) * 100) : 0;

  // Active Goals Target & Current Saved
  const totalGoalTarget = goals.reduce((sum: number, g: any) => sum + (Number(g.targetAmount) || 0), 0);
  const totalGoalSaved = goals.reduce((sum: number, g: any) => sum + (Number(g.currentSavings) || 0), 0);

  // AI Financial Insight generation via Gemini
  let aiInsight = "";
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are Vault IQ's financial AI advisor. Generate a 1-sentence personalized financial insight for user "${displayName}" based on their financial data:
      - Monthly Income: ₹${salary.toLocaleString("en-IN")}
      - Monthly Expenses: ₹${monthlyExpenses.toLocaleString("en-IN")}
      - Remaining Monthly Budget: ₹${remainingBudget.toLocaleString("en-IN")}
      - Budget Utilization: ${budgetUtilization}%
      - Top Spend Category: ${topCategory} (₹${topCategoryAmount.toLocaleString("en-IN")})
      - Active Savings Goals: ${goals.length} goals.
      
      Make the insight crisp, actionable, under 35 words, and in a supportive tone. Use Indian Rupees (₹). Output ONLY the insight.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      aiInsight = response.text?.trim() || "";
    } catch (e: any) {
      console.warn("[SCHEDULER AI ERROR] failed to fetch Gemini AI insight:", e.message);
    }
  }

  if (!aiInsight) {
    if (budgetUtilization > 85) {
      aiInsight = `Your budget utilization is high at ${budgetUtilization}%. Consider cutting back on discretionary expenses in ${topCategory} to protect your financial health.`;
    } else if (budgetUtilization > 50) {
      aiInsight = `You have utilized ${budgetUtilization}% of your monthly budget. Reviewing your ${topCategory} spending could help optimize savings.`;
    } else {
      aiInsight = `Excellent financial discipline! Your monthly utilization is healthy at ${budgetUtilization}%. Try routing excess cash to your active dream goals.`;
    }
  }

  // Pick random quote
  const quoteIndex = Math.floor(Math.random() * FINANCIAL_QUOTES.length);
  const financialQuote = FINANCIAL_QUOTES[quoteIndex];

  // Crafting progress bar styles
  let progressBarColor = "#5A5A40"; // Premium Sage
  if (budgetUtilization > 85) {
    progressBarColor = "#e11d48"; // Rose Red
  } else if (budgetUtilization > 65) {
    progressBarColor = "#ea580c"; // Orange
  }

  const reportDateStr = new Date(now.toLocaleString("en-US", { timeZone: timezone })).toLocaleDateString("en-IN", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Responsive HTML Email Template Design
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vault IQ Financial Statement</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f0; margin: 0; padding: 20px; color: #2d302d; -webkit-font-smoothing: antialiased; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 28px; border: 1px solid #deddda; box-shadow: 0 8px 30px rgba(0,0,0,0.03); overflow: hidden; }
        .header { background-color: #2d302d; padding: 32px 24px; text-align: center; border-bottom: 4px solid #5a5a40; }
        .brand { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.1em; margin: 0; }
        .tagline { font-size: 10px; color: #9a9a7c; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 4px; font-weight: bold; }
        .container { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 700; margin: 0 0 4px 0; color: #2d302d; }
        .date-badge { font-size: 12px; color: #717171; margin-bottom: 24px; font-weight: 500; }
        
        /* Stats Grid Cards */
        .grid { margin-bottom: 24px; width: 100%; display: table; table-layout: fixed; border-spacing: 12px 0; }
        .card { display: table-cell; background: #fbfbf9; border-radius: 16px; border: 1px solid #e6e6d8; padding: 16px; text-align: center; vertical-align: top; }
        .card-label { font-size: 10px; text-transform: uppercase; tracking: 0.05em; color: #888888; font-weight: bold; margin-bottom: 6px; }
        .card-value { font-size: 18px; font-weight: 800; color: #2d302d; }
        .val-inc { color: #5a5a40; }
        .val-exp { color: #b07d62; }
        .val-sav { color: #2d302d; }

        /* Section dividers */
        .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #5a5a40; margin: 24px 0 12px 0; border-bottom: 2px solid #f0f0e8; padding-bottom: 6px; }

        /* Category breakdown list */
        .breakdown-row { padding: 10px 0; border-bottom: 1px solid #f5f5f0; font-size: 13px; }
        .category-name { font-weight: 600; color: #4a4a4a; }
        .category-amount { float: right; font-weight: 700; color: #2d302d; }

        /* Progress Bar */
        .progress-container { background: #f0f0e8; border-radius: 10px; height: 8px; overflow: hidden; margin: 8px 0; }
        .progress-bar { height: 100%; border-radius: 10px; }
        .progress-label { font-size: 11px; font-weight: 600; color: #666; display: flex; justify-content: space-between; margin-top: 4px; }

        /* AI Insight Card */
        .insight-card { background-color: rgba(90, 90, 64, 0.06); border-left: 4px solid #5a5a40; border-radius: 8px 16px 16px 8px; padding: 16px; margin: 20px 0; }
        .insight-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #5a5a40; margin-bottom: 6px; letter-spacing: 0.05em; }
        .insight-text { font-size: 13px; font-weight: 600; line-height: 1.5; color: #3e403d; margin: 0; }

        /* Quote box */
        .quote-box { text-align: center; font-style: italic; font-size: 12px; color: #666655; border-top: 1px solid #eeeeee; padding-top: 16px; margin-top: 32px; }

        .footer { background-color: #fbfbf9; padding: 24px; text-align: center; border-top: 1px solid #deddda; font-size: 11px; color: #999999; line-height: 1.5; }
        .footer-logo { font-weight: 700; color: #5a5a40; letter-spacing: 0.05em; margin-bottom: 4px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="brand">VAULT IQ</div>
          <div class="tagline">Personal Capital Intelligence</div>
        </div>
        <div class="container">
          <p class="greeting">Hello, ${displayName}!</p>
          <div class="date-badge">Financial Report &bull; ${reportDateStr}</div>

          <div class="section-title">${frequency} Summary snapshot</div>
          <div class="grid">
            <div class="card">
              <div class="card-label">Daily Share Income</div>
              <div class="card-value val-inc">₹${proRatedIncome.toLocaleString("en-IN")}</div>
            </div>
            <div class="card">
              <div class="card-label">Today's Expenses</div>
              <div class="card-value val-exp">₹${todayExpenses.toLocaleString("en-IN")}</div>
            </div>
            <div class="card">
              <div class="card-label">Today's Savings</div>
              <div class="card-value val-sav">₹${todaySavings.toLocaleString("en-IN")}</div>
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-title">💡 Smart AI Insight</div>
            <p class="insight-text">${aiInsight}</p>
          </div>

          <div class="section-title">Expense breakdown (${frequency === 'Daily' ? 'Today' : 'Month'})</div>
          ${categoryBreakdown.length === 0 ? `
            <p style="font-size: 12px; color: #999; font-style: italic; margin: 12px 0;">No expenses recorded in this period.</p>
          ` : categoryBreakdown.map(c => `
            <div class="breakdown-row">
              <span class="category-name">${c.category}</span>
              <span class="category-amount">₹${c.amount.toLocaleString("en-IN")}</span>
            </div>
          `).join("")}

          <div class="section-title">Monthly Progress & Budget</div>
          <div style="font-size: 13px; color: #4a4a4a; margin-bottom: 12px;">
            <div style="margin-bottom: 6px;">&bull; <strong>Base Income:</strong> ₹${salary.toLocaleString("en-IN")}</div>
            <div style="margin-bottom: 6px;">&bull; <strong>Month-to-Date Spend:</strong> ₹${monthlyExpenses.toLocaleString("en-IN")}</div>
            <div style="margin-bottom: 6px;">&bull; <strong>Net Remaining:</strong> ₹${monthlySavings.toLocaleString("en-IN")}</div>
          </div>

          <div class="progress-container">
            <div class="progress-bar" style="width: ${Math.min(budgetUtilization, 100)}%; background-color: ${progressBarColor};"></div>
          </div>
          <div class="progress-label">
            <span>Budget Utilization</span>
            <span>${budgetUtilization}%</span>
          </div>

          ${totalGoalTarget > 0 ? `
            <div class="section-title">Savings Goals Progress</div>
            <p style="font-size: 13px; color: #4a4a4a; margin: 0 0 8px 0;">
              Accumulated <strong>₹${totalGoalSaved.toLocaleString("en-IN")}</strong> towards overall goal targets of <strong>₹${totalGoalTarget.toLocaleString("en-IN")}</strong>.
            </p>
          ` : ""}

          <div class="quote-box">
            "${financialQuote}"
          </div>
        </div>

        <div class="footer">
          <div class="footer-logo">VAULT IQ &bull; DIGITAL FINANCE</div>
          &copy; ${new Date().getFullYear()} Vault IQ. All rights reserved.<br>
          This financial digest was delivered to ${email} per your Notification Settings.<br>
          To change email configurations or unsubscribe, visit Settings in the Vault IQ app.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = createTransporter();
    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER || "vaultiq.verify@gmail.com";
    const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

    if (!gmailPass && !process.env.SMTP_PASS) {
      console.warn(`\n======================================================`);
      console.warn(`[REPORT SCHEDULER WARNING] GMAIL_APP_PASSWORD is not set in .env.`);
      console.warn(`[LOCAL REPORT SIMULATION] Email HTML generated for ${email}:`);
      console.warn(`Top Category: ${topCategory} | Monthly Expenses: ₹${monthlyExpenses}`);
      console.warn(`======================================================\n`);
      return true; // Return success in local simulation
    }

    const mailOptions = {
      from: `"Vault IQ Digest" <${gmailUser}>`,
      to: email,
      subject: `Vault IQ ${frequency} Financial Report - ${todayStr}`,
      text: `Hello ${displayName}, here is your Vault IQ financial summary: pro-rated daily income ₹${proRatedIncome}, today's expenses ₹${todayExpenses}, monthly expenses ₹${monthlyExpenses}. Log into Vault IQ to view details.`,
      html: emailHtml,
    };

    const info = await sendMailWithRetry(transporter, mailOptions);
    console.log(`[SCHEDULER SUCCESS] Email report delivered to ${email} (Message ID: ${info.messageId})`);
    return true;
  } catch (err: any) {
    console.error(`[SCHEDULER ERROR] Failed to deliver report email to ${email}:`, err);
    return false;
  }
};

// Scheduler background runner trigger
export const startReportScheduler = () => {
  console.log("[SCHEDULER] Daily Financial Notification runner initiated. Frequency: Every Minute.");

  // Schedule cron job to run every minute
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    console.log(`[SCHEDULER TICK] Checking active email report triggers at ${now.toISOString()}...`);

    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      
      for (const userDocSnap of usersSnapshot.docs) {
        const userDoc = userDocSnap.data();
        const userDocId = userDocSnap.id;

        // Verify if notifications are enabled
        if (!userDoc.email_notifications_enabled) {
          continue;
        }

        const email = userDoc.email;
        if (!email) {
          continue;
        }

        const timezone = userDoc.timezone || "Asia/Kolkata";
        const reportTime = userDoc.report_time || "20:00"; // format HH:MM
        const frequency = userDoc.report_frequency || "Daily";

        // Current time variables in user's specific timezone (OS-agnostic formatToParts parsing)
        let timeString = "20:00";
        try {
          const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          const parts = formatter.formatToParts(now);
          let hours = "00";
          let minutes = "00";
          for (const part of parts) {
            if (part.type === "hour") hours = part.value;
            if (part.type === "minute") minutes = part.value;
          }
          if (hours === "24") hours = "00";
          timeString = `${hours}:${minutes}`;
        } catch (e) {
          console.warn("[SCHEDULER] Failed to parse timezone time using Intl.DateTimeFormat, falling back to toLocaleTimeString:", e);
          timeString = now.toLocaleTimeString("en-US", {
            timeZone: timezone,
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        const dateString = now.toLocaleDateString("en-CA", {
          timeZone: timezone,
        }); // e.g. "2026-07-26"

        // Verify time match
        if (timeString !== reportTime) {
          continue;
        }

        // Match frequency conditions and check for duplicate sends
        let shouldTrigger = false;
        const lastSent = userDoc.last_report_sent || "";

        if (frequency === "Daily") {
          // Send if last sent is not today
          if (!lastSent.startsWith(dateString)) {
            shouldTrigger = true;
          }
        } else if (frequency === "Weekly") {
          // Send on Sundays if last sent is not today
          const dayOfWeek = new Date(now.toLocaleString("en-US", { timeZone: timezone })).getDay();
          if (dayOfWeek === 0 && !lastSent.startsWith(dateString)) {
            shouldTrigger = true;
          }
        } else if (frequency === "Monthly") {
          // Send on the 1st day of the month if last sent is not today
          const dayOfMonth = new Date(now.toLocaleString("en-US", { timeZone: timezone })).getDate();
          if (dayOfMonth === 1 && !lastSent.startsWith(dateString)) {
            shouldTrigger = true;
          }
        }

        if (shouldTrigger) {
          console.log(`[SCHEDULER] Trigger match found for user doc ${userDocId} (time: ${timeString}, timezone: ${timezone})`);
          
          const success = await generateAndSendReport(userDoc, userDocId);
          if (success) {
            try {
              // Update last_report_sent in Firestore user document
              const userRef = doc(db, "users", userDocId);
              await updateDoc(userRef, {
                last_report_sent: now.toISOString(),
              });
              console.log(`[SCHEDULER] Successfully updated last_report_sent timestamp for ${userDocId}`);
            } catch (err: any) {
              console.error(`[SCHEDULER ERROR] Failed to update last_report_sent in Firestore for user ${userDocId}:`, err);
            }
          }
        }
      }
    } catch (err: any) {
      console.error("[SCHEDULER CORE PROCESS ERROR] encountered error running database scan:", err);
    }
  });
};
