import React, { useState } from "react";
import { LoanReminder } from "../types";
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Sparkles,
  Smartphone,
  ChevronRight,
  HelpCircle,
  Loader2,
  Check,
  Edit3,
  Download,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReminderProps {
  loans: LoanReminder[];
  setLoans: React.Dispatch<React.SetStateAction<LoanReminder[]>>;
}

export const Reminder: React.FC<ReminderProps> = ({ loans, setLoans }) => {
  // New loan state
  const [loanName, setLoanName] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [scheduleReminder, setScheduleReminder] = useState(true);
  const [totalPrincipal, setTotalPrincipal] = useState("");
  const [remainingInstallments, setRemainingInstallments] = useState("");

  // Edit loan state
  const [editingLoan, setEditingLoan] = useState<LoanReminder | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editTotalPrincipal, setEditTotalPrincipal] = useState("");
  const [editRemainingInstallments, setEditRemainingInstallments] = useState("");
  const [editIsScheduled, setEditIsScheduled] = useState(true);

  const handleOpenEdit = (loan: LoanReminder) => {
    setEditingLoan(loan);
    setEditName(loan.name);
    setEditAmount(loan.amount.toString());
    setEditDueDate(loan.dueDate);
    setEditTotalPrincipal(loan.totalPrincipal ? loan.totalPrincipal.toString() : "");
    setEditRemainingInstallments(loan.remainingInstallments ? loan.remainingInstallments.toString() : "");
    setEditIsScheduled(loan.isScheduled);
  };

  const handleSaveEditLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoan) return;
    const amt = parseFloat(editAmount);
    if (!editName.trim() || isNaN(amt) || amt <= 0 || !editDueDate) return;

    const principalVal = editTotalPrincipal ? parseFloat(editTotalPrincipal) : undefined;
    const installmentsVal = editRemainingInstallments ? parseInt(editRemainingInstallments) : undefined;

    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== editingLoan.id) return l;
        return {
          ...l,
          name: editName.trim(),
          amount: amt,
          dueDate: editDueDate,
          totalPrincipal: principalVal,
          remainingInstallments: installmentsVal,
          isScheduled: editIsScheduled,
        };
      })
    );

    setEditingLoan(null);
  };

  // Export individual Loan / EMI statement document
  const downloadLoanDocument = (loan: LoanReminder) => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Vault IQ Loan / EMI Repayment Schedule Statement</title>
        <style>
          body { font-family: 'Arial', sans-serif; color: #2D302D; line-height: 1.6; padding: 40px; }
          .loan-card { border: 2px solid #5A5A40; border-radius: 12px; padding: 30px; max-width: 600px; margin: auto; }
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
        <div class="loan-card">
          <div class="header">
            <div class="logo">VAULT IQ</div>
            <div class="title">OFFICIAL LOAN & EMI REPAYMENT STATEMENT</div>
          </div>
          <div class="details-grid">
            <div class="row">
              <span class="label">Obligation Reference:</span>
              <span class="value">#VIQ-EMI-${loan.id.toUpperCase()}</span>
            </div>
            <div class="row">
              <span class="label">Loan / Creditor Facility:</span>
              <span class="value">${loan.name}</span>
            </div>
            <div class="row">
              <span class="label">Next Scheduled Due Date:</span>
              <span class="value">${loan.dueDate}</span>
            </div>
            ${loan.totalPrincipal ? `
            <div class="row">
              <span class="label">Total Principal Registered:</span>
              <span class="value">₹${loan.totalPrincipal.toLocaleString("en-IN")}</span>
            </div>
            ` : ''}
            ${loan.remainingInstallments ? `
            <div class="row">
              <span class="label">Tenure Installments Remaining:</span>
              <span class="value">${loan.remainingInstallments} Months</span>
            </div>
            ` : ''}
            <div class="row">
              <span class="label">Payment Status:</span>
              <span class="value"><strong>${loan.status}</strong></span>
            </div>
            <div class="row">
              <span class="label">Automated Alert Monitoring:</span>
              <span class="value">${loan.isScheduled ? "Active (5-day & 2-day SMS Warnings)" : "Manual"}</span>
            </div>
          </div>
          <div class="amount-row">
            <span class="label" style="text-transform: uppercase; font-size: 11px; tracking: 1px;">MONTHLY EMI INSTALLMENT OBLIGATION</span>
            <div class="amount-val">₹${loan.amount.toLocaleString("en-IN")}</div>
          </div>
          <div class="footer">
            Verified and generated via Vault IQ Debt Sentinel.<br/>
            Track repayments, protect CIBIL health, and avoid late penalties.
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Loan_Statement_${loan.name.replace(/[^a-zA-Z0-9]/g, "_")}_${loan.id}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isEmiApproaching = (dueDateStr: string): boolean => {
    if (!dueDateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Approaching if due within 5 days or already overdue (to make payment accessible)
    return diffDays <= 5;
  };

  const handlePayLender = (name: string) => {
    const lower = name.toLowerCase();
    let url = "https://www.sbi.co.in/";
    if (lower.includes("hdfc")) url = "https://www.hdfcbank.com/personal/pay/opt-in-for-easypay";
    else if (lower.includes("sbi")) url = "https://www.onlinesbi.sbi/";
    else if (lower.includes("icici")) url = "https://www.icicibank.com/personal-banking/loans/home-loan/home-loan-repayment";
    else if (lower.includes("axis")) url = "https://www.axisbank.com/retail/loans";
    else if (lower.includes("bajaj")) url = "https://www.bajajfinserv.in/reach-us";

    // Immediate server-side 302 redirection with zero client-side lag or interstitial message
    window.location.href = `/api/lender-redirect?url=${encodeURIComponent(url)}`;
  };

  // AI Advice States
  const [activeLoanForAdvice, setActiveLoanForAdvice] = useState<LoanReminder | null>(null);
  const [isGettingAdvice, setIsGettingAdvice] = useState(false);
  const [reasonForAdvice, setReasonForAdvice] = useState("Salary delay");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Simulated Alert Panel logs
  const [smsAlerts, setSmsAlerts] = useState<string[]>([
    "Alert: Welcome to Vault IQ Secure alerts! All EMI reminders will be populated here.",
  ]);

  // Create Loan
  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(loanAmount);
    if (!loanName.trim() || isNaN(amt) || amt <= 0 || !dueDate) return;

    const principalVal = totalPrincipal ? parseFloat(totalPrincipal) : undefined;
    const installmentsVal = remainingInstallments ? parseInt(remainingInstallments) : undefined;

    const newLoan: LoanReminder = {
      id: Math.random().toString(36).substring(2, 9),
      name: loanName.trim(),
      amount: amt,
      dueDate,
      isScheduled: scheduleReminder,
      status: "Pending",
      totalPrincipal: principalVal,
      remainingInstallments: installmentsVal,
    };

    setLoans((prev) => [...prev, newLoan]);

    // Push simulated SMS alert if scheduled
    if (scheduleReminder) {
      // Calculate 5 days and 2 days prior
      const due = new Date(dueDate);
      const fiveDaysPrior = new Date(due);
      fiveDaysPrior.setDate(due.getDate() - 5);
      const twoDaysPrior = new Date(due);
      twoDaysPrior.setDate(due.getDate() - 2);

      const formattedFiveDays = isNaN(fiveDaysPrior.getTime()) ? "5 days prior" : fiveDaysPrior.toISOString().split("T")[0];
      const formattedTwoDays = isNaN(twoDaysPrior.getTime()) ? "2 days prior" : twoDaysPrior.toISOString().split("T")[0];

      const smsBase = `[SMS SENT] To Registered UPI Number: "Reminder Alert: Your payment for '${loanName.trim()}' of ₹${amt.toLocaleString("en-IN")} is scheduled on ${dueDate}. Keep your UPI account active. - Vault IQ"`;
      const sms5 = `[SCHEDULED SMS - 5 Days Prior on ${formattedFiveDays}] To UPI Number: "Vault IQ Alert: Your EMI of ₹${amt.toLocaleString("en-IN")} for ${loanName.trim()} is due in 5 days (${dueDate})."`;
      const sms2 = `[SCHEDULED SMS - 2 Days Prior on ${formattedTwoDays}] To UPI Number: "Vault IQ Final Warning: Your EMI of ₹${amt.toLocaleString("en-IN")} for ${loanName.trim()} is due in 2 days (${dueDate})."`;

      setSmsAlerts((prev) => [sms2, sms5, smsBase, ...prev]);
    }

    // Reset Form
    setLoanName("");
    setLoanAmount("");
    setDueDate("");
    setTotalPrincipal("");
    setRemainingInstallments("");
  };

  // Delete Loan
  const handleDeleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
  };

  // Toggle status to paid
  const handleMarkAsPaid = (id: string) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const nextStatus = l.status === "Paid" ? "Pending" : "Paid";
        return { ...l, status: nextStatus };
      })
    );
  };

  // Get AI smart advice from server
  const fetchSmartAdvice = async () => {
    if (!activeLoanForAdvice) return;
    setIsGettingAdvice(true);
    setAiSuggestions([]);

    try {
      const response = await fetch("/api/gemini/suggest-repayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanName: activeLoanForAdvice.name,
          amount: activeLoanForAdvice.amount,
          dueDate: activeLoanForAdvice.dueDate,
          reason: reasonForAdvice,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions || []);
      } else {
        console.error("Failed to fetch advice");
      }
    } catch (err) {
      console.error("Repayment advice error:", err);
    } finally {
      setIsGettingAdvice(false);
    }
  };

  return (
    <div className="space-y-8" id="remainder-root">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
          Remainder Menu (Loans & EMIs)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Input all loans and EMIs, schedule alerts, and utilize smart AI solutions if unable to pay on time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input panel */}
        <div className="lg:col-span-1 bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="text-[#5A5A40] dark:text-[#C2C2A3]" size={18} />
            Add Loan / EMI
          </h2>

          <form onSubmit={handleAddLoan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Loan or EMI Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC Home Loan, SBI Car EMI"
                value={loanName}
                onChange={(e) => setLoanName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Total Principal (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500000"
                  value={totalPrincipal}
                  onChange={(e) => setTotalPrincipal(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Installments Left
                </label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={remainingInstallments}
                  onChange={(e) => setRemainingInstallments(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Monthly EMI Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 12000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none font-mono text-sm"
              />
            </div>

            {/* Schedule Switch */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-xl border border-[#DEDDDA] dark:border-[#3E403D]">
              <div className="space-y-0.5">
                <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Enable SMS Reminders
                </span>
                <span className="block text-[10px] text-gray-400">
                  Receive text alerts prior to due date
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={scheduleReminder}
                  onChange={() => setScheduleReminder(!scheduleReminder)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#5A5A40] dark:peer-checked:bg-[#C2C2A3]"></div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-medium rounded-xl shadow-md transition-all cursor-pointer text-sm"
              id="btn-add-loan"
            >
              <Plus size={16} /> Schedule Reminder
            </button>
          </form>
        </div>

        {/* List of active EMIs & Loan Reminders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="text-[#5A5A40] dark:text-[#C2C2A3]" size={18} />
              Active Loans & EMI Schedule
            </h2>

            {loans.length === 0 ? (
              <div className="text-center py-20 text-sm text-gray-400">
                No active loans or scheduled EMIs. Log your HDFC, SBI, or ICICI commitments!
              </div>
            ) : (
              <div className="space-y-3">
                {loans.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 bg-gray-50 dark:bg-[#1C1D1B]/30 border border-[#DEDDDA] dark:border-[#3E403D] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#5A5A40]/10 dark:bg-[#C2C2A3]/10 text-[#5A5A40] dark:text-[#C2C2A3] rounded-xl mt-0.5">
                        <Bell size={18} />
                      </div>
                      <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 shrink-0">
                          {l.name}
                        </h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400 font-mono font-medium">
                          <span>Due Date: <span className="font-semibold text-gray-700 dark:text-gray-300">{l.dueDate}</span></span>
                          {l.totalPrincipal && (
                            <span>Principal: <span className="font-semibold text-gray-700 dark:text-gray-300">₹{l.totalPrincipal.toLocaleString("en-IN")}</span></span>
                          )}
                          {l.remainingInstallments && (
                            <span>Remaining: <span className="font-semibold text-gray-700 dark:text-gray-300">{l.remainingInstallments} months</span></span>
                          )}
                          {l.isScheduled && (
                            <span className="text-[#5A5A40] dark:text-[#C2C2A3] font-bold uppercase">
                              • 5d & 2d SMS Scheduled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="font-mono text-base font-bold text-gray-900 dark:text-white">
                        ₹{l.amount.toLocaleString("en-IN")}
                      </span>

                      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap justify-end">
                        {/* Download Document button */}
                        <button
                          onClick={() => downloadLoanDocument(l)}
                          className="px-2.5 py-1.5 bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 dark:bg-[#C2C2A3]/10 dark:hover:bg-[#C2C2A3]/20 text-[#5A5A40] dark:text-[#C2C2A3] rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                          title="Download Loan Statement (.docx)"
                        >
                          <Download size={13} /> Document
                        </button>

                        {/* Edit Loan button */}
                        <button
                          onClick={() => handleOpenEdit(l)}
                          className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 border border-blue-500/20"
                          title="Edit Loan/EMI Details"
                          id={`btn-edit-loan-${l.id}`}
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        {/* Mark as paid button */}
                        <button
                          onClick={() => handleMarkAsPaid(l.id)}
                          className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                            l.status === "Paid"
                              ? "bg-[#5A5A40] border-[#5A5A40] dark:bg-[#C2C2A3] dark:border-[#C2C2A3] text-white dark:text-gray-900"
                              : "bg-white dark:bg-[#2A2B29] border-[#DEDDDA] dark:border-[#3E403D] text-gray-400 hover:text-[#5A5A40] dark:hover:text-[#C2C2A3] hover:border-[#5A5A40] dark:hover:border-[#C2C2A3]"
                          }`}
                          title={l.status === "Paid" ? "Mark Pending" : "Mark Paid"}
                        >
                          <Check size={16} />
                        </button>

                        {/* Pay EMI button */}
                        {l.status !== "Paid" && isEmiApproaching(l.dueDate) && (
                          <button
                            onClick={() => handlePayLender(l.name)}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            id={`btn-pay-lender-${l.id}`}
                          >
                            Pay EMI
                          </button>
                        )}

                        {/* Cannot pay on due date smart feature trigger */}
                        {l.status !== "Paid" && (
                          <button
                            onClick={() => {
                              setActiveLoanForAdvice(l);
                              setAiSuggestions([]);
                              setReasonForAdvice("Budget is temporarily tight this month due to extra grocery expenses.");
                            }}
                            className="px-2.5 py-1.5 bg-[#B07D62]/10 hover:bg-[#B07D62]/20 dark:bg-[#B07D62]/25 dark:hover:bg-[#B07D62]/35 text-[#B07D62] font-semibold rounded-lg text-xs transition-all border border-[#B07D62]/30 cursor-pointer flex items-center gap-1.5"
                          >
                            <AlertTriangle size={12} /> Cannot Pay?
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteLoan(l.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#B07D62] hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all cursor-pointer"
                          title="Delete scheduling"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SMS Notification Center */}
          <div className="bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Smartphone className="text-[#5A5A40] dark:text-[#C2C2A3]" size={18} />
              Simulated SMS Alerts Terminal
            </h2>
            <div className="bg-[#1C1D1B] text-[#E4E3E0] font-mono text-xs rounded-xl p-4 h-36 overflow-y-auto space-y-2 border border-[#3E403D] leading-relaxed scrollbar-thin">
              {smsAlerts.map((log, index) => (
                <div key={index} className="border-b border-[#3E403D]/60 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-[#00C0F0]">➜</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Repayment Assistant Modal/Drawer */}
      <AnimatePresence>
        {activeLoanForAdvice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLoanForAdvice(null)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-[#2A2B29] rounded-3xl shadow-2xl border border-[#DEDDDA] dark:border-[#3E403D] z-50 overflow-hidden"
            >
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#5A5A40]/10 text-[#5A5A40] dark:bg-[#C2C2A3]/10 dark:text-[#C2C2A3] rounded-xl">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                        AI Smart Repayment Advisor
                      </h3>
                      <p className="text-xs text-gray-400">
                        Suggesting safe pathways for: <span className="font-semibold text-gray-700 dark:text-gray-300">{activeLoanForAdvice.name}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveLoanForAdvice(null)}
                    className="p-1 rounded-lg text-gray-400 hover:bg-[#F5F5F0] dark:hover:bg-[#1C1D1B]"
                  >
                    ×
                  </button>
                </div>

                {/* Info summary */}
                <div className="p-3 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-xl border border-[#DEDDDA] dark:border-[#3E403D] flex justify-between font-mono text-xs">
                  <div>
                    <span className="text-gray-400 block">EMI AMOUNT</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                      ₹{activeLoanForAdvice.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block">DUE DATE</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                      {activeLoanForAdvice.dueDate}
                    </span>
                  </div>
                </div>

                {/* Input reason */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5 tracking-wider">
                    Why can you not pay this on the due date?
                  </label>
                  <select
                    value={reasonForAdvice}
                    onChange={(e) => setReasonForAdvice(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none text-sm"
                  >
                    <option value="Temporary salary delay of 5 days">Salary delay of a few days</option>
                    <option value="Emergency medical expense drained monthly cash reserves">Unexpected medical emergency expense</option>
                    <option value="Accidentally overspent on family wedding functions">Overspent on shopping/family functions</option>
                    <option value="Sudden job transition / temporary unemployment">Job transition / unemployment</option>
                  </select>
                </div>

                {/* Suggestions Output */}
                <div className="space-y-3 min-h-35 flex flex-col justify-center">
                  {isGettingAdvice ? (
                    <div className="flex flex-col items-center gap-2.5 py-4">
                      <Loader2 className="w-8 h-8 text-[#5A5A40] dark:text-[#C2C2A3] animate-spin" />
                      <span className="text-xs text-gray-400 font-mono">
                        AI is calculating CIBIL protection models...
                      </span>
                    </div>
                  ) : aiSuggestions.length > 0 ? (
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#5A5A40] dark:text-[#C2C2A3] block">
                        Actionable AI Suggestions:
                      </span>
                      {aiSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 bg-[#5A5A40]/5 dark:bg-[#C2C2A3]/10 border border-[#5A5A40]/20 dark:border-[#C2C2A3]/20 rounded-xl flex items-start gap-3"
                        >
                          <span className="w-5 h-5 bg-[#5A5A40] text-white dark:bg-[#C2C2A3] dark:text-gray-900 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                            {index + 1}
                          </span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            {suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-gray-400">
                      Click below to trigger AI analysis and load suggestions.
                    </div>
                  )}
                </div>

                {/* Footer Trigger */}
                <div className="flex gap-2.5">
                  <button
                    onClick={fetchSmartAdvice}
                    disabled={isGettingAdvice}
                    className="flex-1 py-2.5 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] disabled:opacity-50 text-white dark:text-gray-900 font-medium rounded-xl text-sm shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} /> Generate Smart Solutions
                  </button>
                  <button
                    onClick={() => setActiveLoanForAdvice(null)}
                    className="px-4 py-2.5 bg-[#F5F5F0] dark:bg-[#1C1D1B] text-gray-600 dark:text-gray-300 font-medium rounded-xl text-sm hover:bg-gray-200/50 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==========================================
          EDIT LOAN / EMI MODAL DIALOGUE
         ========================================== */}
      <AnimatePresence>
        {editingLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#2A2B29] border border-[#DEDDDA] dark:border-[#3E403D] rounded-4xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 relative"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Edit3 size={18} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
                    Edit EMI / Loan Details
                  </h3>
                </div>
                <button
                  onClick={() => setEditingLoan(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEditLoan} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Loan / Creditor Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Monthly EMI (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Total Principal (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={editTotalPrincipal}
                      onChange={(e) => setEditTotalPrincipal(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Installments Left
                    </label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={editRemainingInstallments}
                      onChange={(e) => setEditRemainingInstallments(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-xl border border-[#DEDDDA] dark:border-[#3E403D]">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Enable SMS Reminders
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editIsScheduled}
                      onChange={() => setEditIsScheduled(!editIsScheduled)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#5A5A40] dark:peer-checked:bg-[#C2C2A3]"></div>
                  </label>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingLoan(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Save Changes
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
