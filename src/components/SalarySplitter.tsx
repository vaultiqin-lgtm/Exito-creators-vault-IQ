import React, { useState, useRef } from "react";
import { Expense, GroupBill, Friend } from "../types";
import {
  IndianRupee,
  Plus,
  Trash2,
  PieChart as ChartIcon,
  Users,
  Camera,
  History,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Loader2,
  Download,
  Search,
  Calendar,
  Landmark,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

interface SalarySplitterProps {
  username?: string;
  salary: number;
  setSalary: (salary: number) => void;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  groupBills: GroupBill[];
  setGroupBills: React.Dispatch<React.SetStateAction<GroupBill[]>>;
  onSavingsAdded: (amount: number) => void;
}

export const SalarySplitter: React.FC<SalarySplitterProps> = ({
  username,
  salary,
  setSalary,
  expenses,
  setExpenses,
  groupBills,
  setGroupBills,
  onSavingsAdded,
}) => {
  // Config split ratios (default 50% Expenses, 30% Savings, 20% Personal/Investment)
  const [expenseRatio, setExpenseRatio] = useState(50);
  const [savingsRatio, setSavingsRatio] = useState(30);
  const [personalRatio, setPersonalRatio] = useState(20);

  // New Expense manual input
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [locationTag, setLocationTag] = useState("");

  // Salary Log & Past Income tracking
  const [salaryLogs, setSalaryLogs] = useState<{ id: string; monthYear: string; amount: number; notes: string }[]>([]);
  const [logMonthYear, setLogMonthYear] = useState("");
  const [logAmount, setLogAmount] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [syncWithActive, setSyncWithActive] = useState(true);

  // Receipt searching query
  const [receiptSearchQuery, setReceiptSearchQuery] = useState("");

  // Fetch salary logs on load
  React.useEffect(() => {
    const userKey = username ? `vault_iq_salary_logs_${username}` : "vault_iq_salary_logs_guest";
    const saved = localStorage.getItem(userKey);
    if (saved) {
      setSalaryLogs(JSON.parse(saved));
    } else {
      const initialLogs = [
        {
          id: "init-log-1",
          monthYear: "July 2026",
          amount: salary || 50000,
          notes: "Primary Active Base Salary"
        },
        {
          id: "init-log-2",
          monthYear: "June 2026",
          amount: salary || 50000,
          notes: "Previous Month Earnings"
        }
      ];
      localStorage.setItem(userKey, JSON.stringify(initialLogs));
      setSalaryLogs(initialLogs);
    }
  }, [username, salary]);

  const handleAddSalaryLog = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(logAmount);
    if (!logMonthYear.trim() || isNaN(amt) || amt <= 0) return;

    const newLog = {
      id: "log-" + Math.random().toString(36).substring(2, 9),
      monthYear: logMonthYear.trim(),
      amount: amt,
      notes: logNotes.trim() || "Regular Income"
    };

    const userKey = username ? `vault_iq_salary_logs_${username}` : "vault_iq_salary_logs_guest";
    const updated = [newLog, ...salaryLogs];
    setSalaryLogs(updated);
    localStorage.setItem(userKey, JSON.stringify(updated));

    if (syncWithActive) {
      setSalary(amt);
    }

    setLogMonthYear("");
    setLogAmount("");
    setLogNotes("");
  };

  const handleDeleteSalaryLog = (id: string) => {
    const updated = salaryLogs.filter(l => l.id !== id);
    setSalaryLogs(updated);
    const userKey = username ? `vault_iq_salary_logs_${username}` : "vault_iq_salary_logs_guest";
    localStorage.setItem(userKey, JSON.stringify(updated));
  };

  // Convert "YYYY-MM-DD" expense date to searchable variants (e.g. DD/MM/YYYY, MM/YYYY, D-M-YYYY etc.)
  const getSearchableDates = (dateStr: string) => {
    if (!dateStr) return [];
    const parts = dateStr.split("-");
    if (parts.length !== 3) return [dateStr];
    const [year, month, day] = parts;
    const dayNum = parseInt(day, 10).toString();
    const monthNum = parseInt(month, 10).toString();
    
    // Add custom readable text like month name
    const dateObj = new Date(dateStr);
    const readableMonthYear = dateObj.toLocaleDateString("en-IN", { month: "long", year: "numeric" }).toLowerCase();

    return [
      dateStr,
      `${day}/${month}/${year}`,
      `${dayNum}/${monthNum}/${year}`,
      `${month}/${year}`,
      `${monthNum}/${year}`,
      `${day}-${month}-${year}`,
      `${dayNum}-${monthNum}-${year}`,
      `${month}-${year}`,
      `${monthNum}-${year}`,
      readableMonthYear,
    ];
  };

  // Filtered expenses based on multiple search query formats
  const filteredExpenses = expenses.filter((exp) => {
    if (!receiptSearchQuery.trim()) return true;
    const query = receiptSearchQuery.toLowerCase().trim();
    if (exp.description.toLowerCase().includes(query)) return true;
    if (exp.category.toLowerCase().includes(query)) return true;
    const searchableDates = getSearchableDates(exp.date);
    return searchableDates.some((d) => d.includes(query));
  });

  // Export receipt as standard editable HTML Word formatted file
  const downloadAsDocx = (exp: Expense) => {
    const dateObj = new Date(exp.date);
    const formattedDate = dateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Vault IQ Official Receipt</title>
        <style>
          body { font-family: 'Arial', sans-serif; color: #2D302D; line-height: 1.6; padding: 40px; }
          .receipt-card { border: 2px solid #5A5A40; border-radius: 12px; padding: 30px; max-width: 600px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #DEDDDA; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: bold; color: #5A5A40; letter-spacing: 2px; }
          .title { font-size: 14px; color: #888; margin-top: 5px; text-transform: uppercase; font-weight: bold; }
          .details-grid { margin-bottom: 30px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #EAEAEA; padding-bottom: 5px; }
          .label { font-weight: bold; color: #666; font-size: 13px; }
          .value { text-align: right; font-weight: 500; color: #2D302D; font-size: 13px; }
          .amount-row { background: #F5F5F0; padding: 18px; border-radius: 10px; margin-top: 25px; text-align: center; }
          .amount-val { font-size: 32px; font-weight: bold; color: #5A5A40; margin-top: 5px; }
          .footer { text-align: center; font-size: 10px; color: #999; margin-top: 40px; border-top: 1px solid #DEDDDA; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="receipt-card">
          <div class="header">
            <div class="logo">VAULT IQ</div>
            <div class="title">OFFICIAL LEDGER TRANSACTION RECEIPT</div>
          </div>
          <div class="details-grid">
            <div class="row">
              <span class="label">Ledger Identifier:</span>
              <span class="value">#VIQ-RC-${exp.id.toUpperCase()}</span>
            </div>
            <span class="row">
              <span class="label">Merchant/Description:</span>
              <span class="value">${exp.description}</span>
            </span>
            <div class="row">
              <span class="label">Category:</span>
              <span class="value">${exp.category}</span>
            </div>
            <div class="row">
              <span class="label">Certified Date:</span>
              <span class="value">${formattedDate}</span>
            </div>
            ${exp.locationTag ? `
            <div class="row">
              <span class="label">Registered Location:</span>
              <span class="value">${exp.locationTag}</span>
            </div>
            ` : ''}
            ${exp.isAiScanned ? `
            <div class="row">
              <span class="label">Verification Protocol:</span>
              <span class="value">AI Smart Camera Scanned</span>
            </div>
            ` : ''}
          </div>
          <div class="amount-row">
            <span class="label" style="text-transform: uppercase; font-size: 11px; tracking: 1px;">TOTAL DISBURSED AMOUNT</span>
            <div class="amount-val">₹${exp.amount.toLocaleString("en-IN")}</div>
          </div>
          <div class="footer">
            Thank you for relying on Vault IQ - Secure Personal Ledger Portal.<br/>
            This document is generated dynamically with high-fidelity Word formatting support.
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt_${exp.description.replace(/[^a-zA-Z0-9]/g, "_")}_${exp.id}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export individual Salary & Income log document
  const downloadSalaryLogDocument = (log: { id: string; monthYear: string; amount: number; notes: string }) => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Vault IQ Official Salary & Income Certificate</title>
        <style>
          body { font-family: 'Arial', sans-serif; color: #2D302D; line-height: 1.6; padding: 40px; }
          .cert-card { border: 2px solid #5A5A40; border-radius: 12px; padding: 30px; max-width: 600px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #DEDDDA; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: bold; color: #5A5A40; letter-spacing: 2px; }
          .title { font-size: 14px; color: #888; margin-top: 5px; text-transform: uppercase; font-weight: bold; }
          .details-grid { margin-bottom: 30px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #EAEAEA; padding-bottom: 5px; font-size: 13px; }
          .label { font-weight: bold; color: #666; }
          .value { text-align: right; font-weight: 500; color: #2D302D; }
          .amount-row { background: #F5F5F0; padding: 18px; border-radius: 10px; margin-top: 25px; text-align: center; }
          .amount-val { font-size: 32px; font-weight: bold; color: #5A5A40; margin-top: 5px; }
          .footer { text-align: center; font-size: 10px; color: #999; margin-top: 40px; border-top: 1px solid #DEDDDA; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="cert-card">
          <div class="header">
            <div class="logo">VAULT IQ</div>
            <div class="title">OFFICIAL INCOME & SALARY RECORD</div>
          </div>
          <div class="details-grid">
            <div class="row">
              <span class="label">Reference ID:</span>
              <span class="value">#VIQ-INC-${log.id.toUpperCase()}</span>
            </div>
            <div class="row">
              <span class="label">Account Holder:</span>
              <span class="value">${username || "Vault IQ User"}</span>
            </div>
            <div class="row">
              <span class="label">Income Billing Cycle:</span>
              <span class="value">${log.monthYear}</span>
            </div>
            <div class="row">
              <span class="label">Classification / Note:</span>
              <span class="value">${log.notes || "Regular Base Salary"}</span>
            </div>
            <div class="row">
              <span class="label">Generated Timestamp:</span>
              <span class="value">${new Date().toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div class="amount-row">
            <span class="label" style="text-transform: uppercase; font-size: 11px; tracking: 1px;">TOTAL DISBURSED SALARY / INCOME</span>
            <div class="amount-val">₹${log.amount.toLocaleString("en-IN")}</div>
          </div>
          <div class="footer">
            Verified and generated via Vault IQ Digital Ledger.<br/>
            Secure Local Sandbox Storage Architecture - India DPDP Act Compliant.
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Income_Record_${log.monthYear.replace(/[^a-zA-Z0-9]/g, "_")}_${log.id}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export individual Group Bill Split document
  const downloadGroupBillDocument = (bill: GroupBill) => {
    const friendsRows = bill.friends
      .map(
        (f) => `
      <div class="row">
        <span class="label">${f.name}:</span>
        <span class="value">₹${f.amount.toLocaleString("en-IN")} - <strong>${f.paid ? "PAID (UPI)" : "PENDING"}</strong></span>
      </div>
    `
      )
      .join("");

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Vault IQ Group Bill Settlement Statement</title>
        <style>
          body { font-family: 'Arial', sans-serif; color: #2D302D; line-height: 1.6; padding: 40px; }
          .card { border: 2px solid #5A5A40; border-radius: 12px; padding: 30px; max-width: 600px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #DEDDDA; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: bold; color: #5A5A40; letter-spacing: 2px; }
          .title { font-size: 14px; color: #888; margin-top: 5px; text-transform: uppercase; font-weight: bold; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #EAEAEA; padding-bottom: 5px; font-size: 13px; }
          .label { font-weight: bold; color: #666; }
          .value { text-align: right; color: #2D302D; }
          .amount-row { background: #F5F5F0; padding: 18px; border-radius: 10px; margin-top: 25px; text-align: center; }
          .amount-val { font-size: 30px; font-weight: bold; color: #5A5A40; margin-top: 5px; }
          .friends-section { margin-top: 20px; border-top: 1px solid #DEDDDA; padding-top: 15px; }
          .footer { text-align: center; font-size: 10px; color: #999; margin-top: 35px; border-top: 1px solid #DEDDDA; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">VAULT IQ</div>
            <div class="title">GROUP BILL SPLIT & SETTLEMENT STATEMENT</div>
          </div>
          <div class="row">
            <span class="label">Split Description:</span>
            <span class="value">${bill.description}</span>
          </div>
          <div class="row">
            <span class="label">Date Created:</span>
            <span class="value">${bill.date}</span>
          </div>
          <div class="row">
            <span class="label">Initiator:</span>
            <span class="value">${username || "Vault IQ User"}</span>
          </div>
          <div class="amount-row">
            <span class="label" style="text-transform: uppercase; font-size: 11px;">TOTAL EXPENSE BILL</span>
            <div class="amount-val">₹${bill.totalAmount.toLocaleString("en-IN")}</div>
          </div>
          <div class="friends-section">
            <div style="font-weight: bold; font-size: 13px; margin-bottom: 10px; color: #5A5A40;">MEMBER CONTRIBUTIONS:</div>
            ${friendsRows}
          </div>
          <div class="footer">
            Generated automatically by Vault IQ Group Splitter.<br/>
            Track UPI settlements and split balances fairly.
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GroupBill_Split_${bill.description.replace(/[^a-zA-Z0-9]/g, "_")}_${bill.id}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Group split states
  const [groupDesc, setGroupDesc] = useState("");
  const [groupAmount, setGroupAmount] = useState("");
  const [friendNameInput, setFriendNameInput] = useState("");
  const [friendsList, setFriendsList] = useState<string[]>([]);

  // AI Scanner state
  const [scannedBill, setScannedBill] = useState<{
    amount: number;
    category: string;
    description: string;
    date: string;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto Calculations
  const allocatedExpenses = Math.round((salary * expenseRatio) / 100);
  const allocatedSavings = Math.round((salary * savingsRatio) / 100);
  const allocatedPersonal = Math.round((salary * personalRatio) / 100);

  // Total manually logged expenses subtracted from Allocated Expenses
  const totalLoggedExpenses = expenses.reduce((sum, curr) => sum + curr.amount, 0);
  const budgetLeft = allocatedExpenses - totalLoggedExpenses;

  // Add Manual Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount || parseFloat(amount) <= 0) return;

    const newExpense: Expense = {
      id: Math.random().toString(36).substring(2, 9),
      description: desc.trim(),
      amount: parseFloat(amount),
      category,
      date: expenseDate,
      locationTag: locationTag.trim() || undefined,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setDesc("");
    setAmount("");
    setLocationTag("");
  };

  // Delete Manual Expense
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  // Add Friend to list for split
  const handleAddFriend = () => {
    if (!friendNameInput.trim()) return;
    if (friendsList.includes(friendNameInput.trim())) return;
    setFriendsList((prev) => [...prev, friendNameInput.trim()]);
    setFriendNameInput("");
  };

  // Remove Friend from group input list
  const handleRemoveFriend = (name: string) => {
    setFriendsList((prev) => prev.filter((f) => f !== name));
  };

  // Create Group Bill Expense Split
  const handleCreateGroupBill = (e: React.FormEvent) => {
    e.preventDefault();
    const billAmt = parseFloat(groupAmount);
    if (!groupDesc.trim() || isNaN(billAmt) || billAmt <= 0 || friendsList.length === 0) return;

    // AI/Equal Split between friends + User
    const divisor = friendsList.length + 1;
    const splitAmount = Math.round((billAmt / divisor) * 100) / 100;

    const friends: Friend[] = friendsList.map((name) => ({
      name,
      amount: splitAmount,
      paid: false,
    }));

    const newGroupBill: GroupBill = {
      id: Math.random().toString(36).substring(2, 9),
      description: groupDesc.trim(),
      totalAmount: billAmt,
      date: new Date().toISOString().split("T")[0],
      friends,
    };

    setGroupBills((prev) => [newGroupBill, ...prev]);

    // Automatically add user's share to expenses list as well
    const userShareExpense: Expense = {
      id: Math.random().toString(36).substring(2, 9),
      description: `Your Share: ${groupDesc.trim()}`,
      amount: splitAmount,
      category: "Others",
      date: new Date().toISOString().split("T")[0],
    };
    setExpenses((prev) => [userShareExpense, ...prev]);

    // Reset fields
    setGroupDesc("");
    setGroupAmount("");
    setFriendsList([]);
  };

  // Toggle friend paid status
  const toggleFriendPaid = (billId: string, friendName: string) => {
    setGroupBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) return bill;
        return {
          ...bill,
          friends: bill.friends.map((friend) => {
            if (friend.name !== friendName) return friend;
            const nextPaid = !friend.paid;
            // Trigger AI appreciation if friend pays and user saves it, or just standard UPI status tracking
            return { ...friend, paid: nextPaid };
          }),
        };
      })
    );
  };

  // Delete Group Bill Expense Split
  const handleDeleteGroupBill = (id: string) => {
    setGroupBills((prev) => prev.filter((bill) => bill.id !== id));
  };

  // Handle Photo/Bill Selection for AI Scan
  const handleBillPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScannedBill(null);

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch("/api/gemini/scan-bill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64String,
            mimeType: file.type,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setScannedBill(data);
        } else {
          console.error("Scan API response not OK");
        }
      } catch (err) {
        console.error("Scan error:", err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirm and Add Scanned Bill
  const handleAddScannedBill = () => {
    if (!scannedBill) return;

    const newExpense: Expense = {
      id: Math.random().toString(36).substring(2, 9),
      description: scannedBill.description,
      amount: scannedBill.amount,
      category: scannedBill.category,
      date: scannedBill.date,
      isAiScanned: true,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setScannedBill(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Generate Chart Data
  const categoriesMap = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Add Remaining Budget to Pie Chart representation
  const pieChartData = [
    ...Object.entries(categoriesMap).map(([name, value]) => ({ name, value: Number(value) })),
    { name: "Unspent Budget", value: Math.max(0, budgetLeft) },
    { name: "Savings Split", value: allocatedSavings },
    { name: "Investment/Personal", value: allocatedPersonal },
  ].filter((item) => item.value > 0);

  const colorsList = ["#5A5A40", "#B07D62", "#D4A373", "#9A9A7C", "#2D302D", "#E2B694", "#C2C2A3", "#444C38", "#8C7A6B"];

  const barChartData = [
    {
      name: "Income Splits",
      Expenses: allocatedExpenses,
      Savings: allocatedSavings,
      Personal: allocatedPersonal,
    },
    {
      name: "Current Tracking",
      Expenses: totalLoggedExpenses,
      Savings: allocatedSavings, // Locked in
      Personal: 0,
    },
  ];

  return (
    <div className="space-y-8" id="salary-splitter-root">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Salary Splitter & Daily Expenses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Split salaries, log daily spends, track remaining balances, and utilize AI Bill scanning.
          </p>
        </div>
        {/* Dynamic Budget Left Indicator Badge */}
        <div className="p-4 bg-[#5A5A40]/10 dark:bg-[#C2C2A3]/10 border border-[#DEDDDA] dark:border-[#3E403D] rounded-2xl flex items-center gap-3">
          <div className="p-2.5 bg-[#5A5A40] text-white dark:bg-[#C2C2A3] dark:text-gray-900 rounded-xl">
            <IndianRupee size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block tracking-wider">
              Remaining Budget Left
            </span>
            <span
              className={`text-lg font-mono font-bold ${
                budgetLeft < 0 ? "text-rose-500" : "text-[#5A5A40] dark:text-[#C2C2A3]"
              }`}
            >
              ₹{budgetLeft.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Salary & Splits Ratio Entry Card */}
      <div className="bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="text-[#5A5A40] dark:text-[#C2C2A3]" size={18} />
          Monthly Salary & Budget Ratios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Enter Monthly Salary
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  value={salary || ""}
                  onChange={(e) => setSalary(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="e.g. 50000"
                  className="w-full pl-8 pr-4 py-2.5 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] dark:focus:border-[#C2C2A3] outline-none font-mono font-bold text-sm"
                  id="salary-input"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                Splits automatically using selected ratios.
              </p>
            </div>

            {/* AI Appreciation Actions simulation wrapper */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSavingsAdded(allocatedSavings)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                id="add-split-to-savings-btn"
              >
                Log Savings Amount (₹{allocatedSavings.toLocaleString("en-IN")})
              </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 bg-[#F5F5F0]/50 dark:bg-[#1C1D1B]/30 p-4 rounded-xl border border-[#DEDDDA] dark:border-[#3E403D]">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Split Ratio Customization (%)
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Expenses Ratio</label>
                <input
                  type="number"
                  max={100}
                  min={0}
                  value={expenseRatio}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                    setExpenseRatio(val);
                    setSavingsRatio(Math.max(0, 100 - val - personalRatio));
                  }}
                  className="w-full p-2 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-lg text-sm text-center font-bold text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Savings Ratio</label>
                <input
                  type="number"
                  max={100}
                  min={0}
                  value={savingsRatio}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                    setSavingsRatio(val);
                    setPersonalRatio(Math.max(0, 100 - val - expenseRatio));
                  }}
                  className="w-full p-2 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-lg text-sm text-center font-bold text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Investment/Personal</label>
                <input
                  type="number"
                  max={100}
                  min={0}
                  value={personalRatio}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                    setPersonalRatio(val);
                    setExpenseRatio(Math.max(0, 100 - val - savingsRatio));
                  }}
                  className="w-full p-2 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-lg text-sm text-center font-bold text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Split Out Value Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#DEDDDA] dark:border-[#3E403D]">
              <div className="p-3 bg-[#B07D62]/5 rounded-xl border border-[#B07D62]/20">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#B07D62] font-bold block">
                  Allocated Expenses
                </span>
                <span className="text-base font-bold font-mono text-[#B07D62]">
                  ₹{allocatedExpenses.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 bg-[#5A5A40]/5 rounded-xl border border-[#5A5A40]/20">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#5A5A40] dark:text-[#C2C2A3] font-bold block">
                  Allocated Savings
                </span>
                <span className="text-base font-bold font-mono text-[#5A5A40] dark:text-[#C2C2A3]">
                  ₹{allocatedSavings.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 bg-[#D4A373]/5 rounded-xl border border-[#D4A373]/20">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#D4A373] font-bold block">
                  Personal & Invests
                </span>
                <span className="text-base font-bold font-mono text-[#D4A373]">
                  ₹{allocatedPersonal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED SALARY LOG & HISTORY TRACKER CARD */}
      <div className="bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Landmark className="text-[#5A5A40] dark:text-[#C2C2A3]" size={18} />
              Salary Log & past Income History
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Keep a comprehensive historical track of present and past monthly incomes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* New Income Form */}
          <form onSubmit={handleAddSalaryLog} className="lg:col-span-5 space-y-4 bg-[#F5F5F0]/40 dark:bg-[#1C1D1B]/40 p-4 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D]">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Log Income Record
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">
                  Month & Year
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. July 2026"
                  value={logMonthYear}
                  onChange={(e) => setLogMonthYear(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5A5A40]/25 font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">
                  Income Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 55000"
                  value={logAmount}
                  onChange={(e) => setLogAmount(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5A5A40]/25 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bonus, freelance, base salary"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5A5A40]/25 font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sync-active-salary"
                  checked={syncWithActive}
                  onChange={(e) => setSyncWithActive(e.target.checked)}
                  className="rounded text-[#5A5A40] focus:ring-[#5A5A40]/25 h-3.5 w-3.5"
                />
                <label htmlFor="sync-active-salary" className="text-[11px] font-medium text-gray-500 cursor-pointer">
                  Update active base salary with this amount
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus size={14} /> Log Salary
            </button>
          </form>

          {/* Income History Ledger Table */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Income Ledger History
            </h3>

            {salaryLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400 bg-[#F5F5F0]/20 dark:bg-[#1C1D1B]/10 rounded-2xl border border-[#DEDDDA] dark:border-[#3E403D]">
                No incomes logged yet. Add one to see history.
              </div>
            ) : (
              <div className="border border-[#DEDDDA] dark:border-[#3E403D] rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-[#2A2B29] max-h-65 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#1C1D1B]/40 text-[10px] uppercase font-mono font-bold text-gray-400 border-b border-[#DEDDDA] dark:border-[#3E403D]">
                      <th className="p-3">Month</th>
                      <th className="p-3">Source/Note</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DEDDDA]/50 dark:divide-[#3E403D]/50">
                    {salaryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1C1D1B]/10 transition-colors">
                        <td className="p-3 font-semibold text-gray-800 dark:text-gray-200">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[#5A5A40] dark:text-[#C2C2A3]" />
                            <span>{log.monthYear}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-500 truncate max-w-30" title={log.notes}>
                          {log.notes}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                          ₹{log.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => downloadSalaryLogDocument(log)}
                              className="px-2 py-1 bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 dark:bg-[#C2C2A3]/10 dark:hover:bg-[#C2C2A3]/20 text-[#5A5A40] dark:text-[#C2C2A3] rounded-lg transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                              title="Download Document (.docx)"
                            >
                              <Download size={11} /> Document
                            </button>
                            <button
                              onClick={() => handleDeleteSalaryLog(log.id)}
                              className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                              title="Delete Log"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Expense Manual Tracker */}
        <div className="bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="text-[#5A5A40] dark:text-[#C2C2A3]" size={18} />
            Log Daily Expenses manually
          </h2>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Expense Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bought Milk"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Category Type
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none text-sm"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Food">Food / Restaurants</option>
                  <option value="Rent">Rent</option>
                  <option value="Loans">Loans</option>
                  <option value="EMIs">EMIs</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Travel">Travel</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Medical">Medical</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Location Tag (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Local Cafe, College Canteen, Mall, Grocery Store"
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-medium rounded-xl shadow-md transition-all cursor-pointer text-sm"
              id="add-expense-submit-btn"
            >
              <Plus size={16} /> Log Expense
            </button>
          </form>
        </div>

        {/* AI Bill Photo Scanner */}
        <div className="bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Camera className="text-[#5A5A40] dark:text-[#C2C2A3]" size={18} />
            AI Bill Photo Scanner
          </h2>

          <div className="border-2 border-dashed border-[#DEDDDA] dark:border-[#3E403D] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#F5F5F0]/30 dark:bg-[#1C1D1B]/30 relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleBillPhotoUpload}
              ref={fileInputRef}
              className="hidden"
              id="bill-image-file-input"
            />

            {isScanning ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="w-10 h-10 text-[#5A5A40] dark:text-[#C2C2A3] animate-spin" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  AI is scanning receipt & extracting details...
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  Formatting INR amounts, categorizing items
                </span>
              </div>
            ) : scannedBill ? (
              <div className="w-full space-y-4 py-2">
                <div className="flex items-center gap-2 justify-center text-[#5A5A40] dark:text-[#C2C2A3] font-semibold text-sm mb-1">
                  <CheckCircle size={18} /> Scanned Extracted Successfully!
                </div>
                <div className="grid grid-cols-2 gap-4 text-left bg-white dark:bg-[#1C1D1B]/50 p-4 rounded-xl border border-[#DEDDDA] dark:border-[#3E403D]">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">
                      Description
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {scannedBill.description}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">
                      Extracted Amount
                    </span>
                    <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                      ₹{scannedBill.amount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">
                      Category Split
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {scannedBill.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">
                      Receipt Date
                    </span>
                    <span className="text-sm font-mono text-gray-800 dark:text-gray-200">
                      {scannedBill.date}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddScannedBill}
                    className="flex-1 py-2 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-medium rounded-xl text-xs shadow transition-all cursor-pointer"
                  >
                    Confirm & Add to Expenses
                  </button>
                  <button
                    onClick={() => {
                      setScannedBill(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl text-xs hover:bg-gray-200 transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 cursor-pointer w-full" onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-10 h-10 text-gray-400 hover:text-[#5A5A40] dark:hover:text-[#C2C2A3] transition-colors mb-3" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Select or Drag & Drop receipt photo
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Supports JPG, PNG formats
                </span>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-medium text-xs rounded-xl shadow cursor-pointer"
                >
                  Upload Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Visualization and spending charts */}
      <div className="bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ChartIcon className="text-[#5A5A40] dark:text-[#C2C2A3]" size={18} />
          History & Visual Analytics
        </h2>

        {expenses.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">
            Log some daily expenses to view the spending distribution analytics.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                Spending & Split Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `₹${value.toLocaleString("en-IN")}`} />
                    <Legend iconSize={10} layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                Allocated vs Tracked Budget (INR)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip formatter={(value: any) => `₹${value.toLocaleString("en-IN")}`} />
                    <Legend iconSize={10} />
                    <Bar dataKey="Expenses" fill="#B07D62" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Savings" fill="#5A5A40" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Personal" fill="#D4A373" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Expense History list with search & download capabilities */}
      <div className="bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="text-[#5A5A40] dark:text-[#C2C2A3]" size={18} />
            Receipt Management & Expense History
          </h2>

          {/* Date Search input supporting multiple formats */}
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search (e.g. DD/MM/YYYY or MM/YYYY)..."
              value={receiptSearchQuery}
              onChange={(e) => setReceiptSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F5F5F0]/60 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5A5A40]/20 font-sans"
              id="receipt-search-bar"
            />
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">
            {receiptSearchQuery ? "No matching receipts or expense logs found for your search." : "No expenses logged yet for this month."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#DEDDDA] dark:border-[#3E403D] text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr
                     key={exp.id}
                     className="border-b border-[#DEDDDA]/50 dark:border-[#3E403D]/50 hover:bg-[#F5F5F0]/30 dark:hover:bg-[#1C1D1B]/20 transition-all"
                  >
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        {exp.description}
                        {exp.isAiScanned && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-[#5A5A40]/10 dark:bg-[#C2C2A3]/10 text-[#5A5A40] dark:text-[#C2C2A3] rounded font-mono font-bold">
                            AI Scanned
                          </span>
                        )}
                      </div>
                      {exp.locationTag && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-400 font-medium font-mono mt-0.5">
                          📍 {exp.locationTag}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{exp.category}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">{exp.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">₹{exp.amount.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4 text-right flex items-center justify-end gap-2.5">
                      {/* Download formatted receipt as Word Document */}
                      <button
                        onClick={() => downloadAsDocx(exp)}
                        className="p-1.5 text-gray-400 hover:text-[#5A5A40] dark:hover:text-[#C2C2A3] hover:bg-[#5A5A40]/10 dark:hover:bg-[#C2C2A3]/10 rounded-lg transition-all cursor-pointer"
                        title="Download Receipt as MS Word (.docx)"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-gray-400 hover:text-[#B07D62] p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Group Bill Splitter & UPI Settlement Tracker */}
      <div className="bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="text-[#5A5A40] dark:text-[#C2C2A3]" size={18} />
          Group Bill Splitter & Settlement Tracker
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Group Bill Split Form */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Create New Group Expense
            </h3>

            <form onSubmit={handleCreateGroupBill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Expense Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner Party at Taj"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Total Bill Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 1200"
                    value={groupAmount}
                    onChange={(e) => setGroupAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Add Friends to Split (names)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Friend's Name"
                    value={friendNameInput}
                    onChange={(e) => setFriendNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFriend())}
                    className="flex-1 p-2 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-lg focus:ring-2 focus:ring-[#5A5A40]/30 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddFriend}
                    className="px-3 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Friend names badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {friendsList.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F5F5F0] dark:bg-[#1C1D1B] text-[#5A5A40] dark:text-[#C2C2A3] rounded-full text-xs font-medium border border-[#DEDDDA] dark:border-[#3E403D]"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(name)}
                        className="text-[#B07D62] font-bold hover:text-orange-600 focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={friendsList.length === 0}
                className="w-full py-2 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] disabled:opacity-50 text-white dark:text-gray-900 font-medium rounded-xl text-xs shadow transition-all cursor-pointer"
                id="group-split-submit-btn"
              >
                Split Expense Equally
              </button>
            </form>
          </div>

          {/* Settlement Tracker List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Settlement Status Tracker
            </h3>

            {groupBills.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-400 border border-dashed border-[#DEDDDA] dark:border-[#3E403D] rounded-2xl">
                Create a split to track payments.
              </div>
            ) : (
              <div className="space-y-4">
                {groupBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-4 bg-[#F5F5F0]/50 dark:bg-[#1C1D1B]/30 border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-[#DEDDDA]/50 dark:border-[#3E403D]/50 pb-2">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          {bill.description}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono">{bill.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="block text-[10px] uppercase font-mono tracking-wider text-gray-400">
                            Total Bill
                          </span>
                          <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                            ₹{bill.totalAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <button
                          onClick={() => downloadGroupBillDocument(bill)}
                          className="px-2.5 py-1.5 bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 dark:bg-[#C2C2A3]/10 dark:hover:bg-[#C2C2A3]/20 text-[#5A5A40] dark:text-[#C2C2A3] rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                          title="Download Settlement Document (.docx)"
                        >
                          <Download size={13} /> Document
                        </button>
                        <button
                          onClick={() => handleDeleteGroupBill(bill.id)}
                          className="text-gray-400 hover:text-[#B07D62] p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all cursor-pointer"
                          title="Delete Split Tracker"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Friends splits indicators */}
                      {bill.friends.map((friend) => (
                        <div
                          key={friend.name}
                          className="p-2.5 bg-white dark:bg-[#2A2B29] rounded-lg border border-[#DEDDDA] dark:border-[#3E403D] flex items-center justify-between"
                        >
                          <div>
                            <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {friend.name}
                            </span>
                            <span className="text-[11px] font-mono text-gray-400">
                              ₹{friend.amount.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleFriendPaid(bill.id, friend.name)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer font-mono transition-all ${
                              friend.paid
                                ? "bg-[#5A5A40]/15 dark:bg-[#C2C2A3]/10 text-[#5A5A40] dark:text-[#C2C2A3]"
                                : "bg-orange-50 dark:bg-orange-950/15 text-orange-600 dark:text-orange-400 hover:bg-orange-100/30"
                            }`}
                          >
                            {friend.paid ? "Paid UPI" : "Pending"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
