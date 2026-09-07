import React, { useState, useEffect } from "react";
import { CreditCard, Award, ShieldCheck, Check, Sparkles, AlertCircle, Coins, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UpgradeProps {
  username: string;
  totalCurrentSavings: number;
}

export const Upgrade: React.FC<UpgradeProps> = ({ username, totalCurrentSavings }) => {
  const [spentPoints, setSpentPoints] = useState<number>(0);
  const [premiumStatus, setPremiumStatus] = useState<string>("Free");
  const [premiumExpiry, setPremiumExpiry] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Payment popup states
  const [showFiatModal, setShowFiatModal] = useState<"Monthly" | "Yearly" | null>(null);
  const [cardNo, setCardNo] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [payMethod, setPayMethod] = useState<"card" | "upi">("card");
  const [isPaying, setIsPaying] = useState(false);

  // Earning points logic: 1,000 points for every 10,000 saved
  const earnedPoints = Math.floor(totalCurrentSavings / 10000) * 1000;
  const currentPoints = Math.max(0, earnedPoints - spentPoints);

  useEffect(() => {
    // Load spent points
    const savedSpent = localStorage.getItem(`vault_iq_spent_points_${username}`);
    if (savedSpent) {
      setSpentPoints(parseInt(savedSpent, 10));
    }

    // Load premium status
    const status = localStorage.getItem(`vault_iq_premium_status_${username}`);
    if (status) {
      setPremiumStatus(status);
    }
    const expiry = localStorage.getItem(`vault_iq_premium_expiry_${username}`);
    if (expiry) {
      setPremiumExpiry(expiry);
    }
  }, [username]);

  const savePremiumState = (status: string, addedMonths: number, costPoints: number) => {
    localStorage.setItem(`vault_iq_premium_status_${username}`, status);
    
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + addedMonths);
    const expiryStr = expiryDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    localStorage.setItem(`vault_iq_premium_expiry_${username}`, expiryStr);

    if (costPoints > 0) {
      const newSpent = spentPoints + costPoints;
      localStorage.setItem(`vault_iq_spent_points_${username}`, newSpent.toString());
      setSpentPoints(newSpent);
    }

    setPremiumStatus(status);
    setPremiumExpiry(expiryStr);
  };

  const handleRedeemPoints = (plan: "Monthly" | "Yearly") => {
    setMessage(null);
    const requiredPoints = plan === "Monthly" ? 1000 : 3000;

    if (currentPoints < requiredPoints) {
      setMessage({
        type: "error",
        text: `Insufficient rewards points! You need ${requiredPoints.toLocaleString()} credit points. Currently you have ${currentPoints.toLocaleString()} credit points. Please commit more savings towards goals to earn points automatically!`,
      });
      return;
    }

    const addedMonths = plan === "Monthly" ? 1 : 12;
    savePremiumState(`Premium ${plan}`, addedMonths, requiredPoints);
    setMessage({
      type: "success",
      text: `Congratulations! Successfully redeemed ${requiredPoints.toLocaleString()} credit points for a 1-${plan === "Monthly" ? "Month" : "Year"} premium vault subscription! Your access is authorized.`,
    });
  };

  const handleFiatPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFiatModal) return;

    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      const plan = showFiatModal;
      const addedMonths = plan === "Monthly" ? 1 : 12;
      
      savePremiumState(`Premium ${plan} (Fiat)`, addedMonths, 0);
      setShowFiatModal(null);
      setCardNo("");
      setCardExpiry("");
      setCardCvv("");
      setUpiId("");
      setMessage({
        type: "success",
        text: `Success! Payment processed securely. Your Vault IQ account has been upgraded to ${plan} Plan! Premium features are unlocked.`,
      });
    }, 1500);
  };

  return (
    <div className="space-y-8" id="upgrade-plan-view">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
          👑 Upgrade Your Security Vault Plan
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redeem your saved credit rewards or choose direct fiat to unlock advanced biometric firewalls, multi-device sync, and extended salary tracking tools.
        </p>
      </div>

      {/* Rewards overview widget */}
      <div className="bg-linear-to-r from-[#5A5A40] to-[#7A7A60] dark:from-[#3E4030] dark:to-[#5E6050] text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Award size={20} className="text-[#FEFAE0]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#FEFAE0] font-mono">
              Rewards Desk / Loyalty Portal
            </span>
          </div>
          <h2 className="text-lg font-bold">Accumulated Credit Rewards Balance</h2>
          <p className="text-xs text-white/80 max-w-lg leading-relaxed">
            You earn <span className="font-bold text-[#FEFAE0]">1,000 credit points</span> for every ₹10,000 saved across all goals automatically. These points can be redeemed instantly for monthly or yearly premium upgrades!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 text-center md:text-right">
          <Coins size={36} className="text-yellow-400 animate-pulse" />
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#FEFAE0] block uppercase">
              Current Balance
            </span>
            <span className="text-2xl font-mono font-extrabold text-white" id="credit-points-balance">
              {currentPoints.toLocaleString()} PTS
            </span>
            <span className="text-[10px] text-white/60 block">
              Earned: {earnedPoints.toLocaleString()} | Redeemed: {spentPoints.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Premium Active Status Notification */}
      {premiumStatus !== "Free" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-[20px] p-5 flex items-center gap-4"
        >
          <div className="p-2.5 bg-emerald-500 text-white rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-white">
              Active Plan: <span className="text-emerald-600 dark:text-emerald-400">{premiumStatus}</span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Premium authorized. Your subscription is secured. Next renewal or expiration date: <span className="font-bold">{premiumExpiry || "Indefinite"}</span>.
            </p>
          </div>
        </motion.div>
      )}

      {/* Message feedback */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl text-xs font-semibold border ${
              message.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-800 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-950/20 border-rose-500/30 text-rose-800 dark:text-rose-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* MONTHLY SUBSCRIPTION BOX */}
        <div className="bg-white dark:bg-[#2A2B29] rounded-4xl p-8 border border-[#DEDDDA] dark:border-[#3E403D] hover:border-[#5A5A40] dark:hover:border-[#C2C2A3] transition-all relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#5A5A40]/5 rounded-full translate-x-6 -translate-y-6"></div>
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#5A5A40] dark:text-[#C2C2A3] uppercase bg-[#5A5A40]/10 dark:bg-[#C2C2A3]/10 px-2.5 py-1 rounded-full">
                Flexible Monthly
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3">Monthly Subscription</h3>
              <p className="text-xs text-gray-400 mt-1">Perfect plan to test full-stack biometric shields and advanced automated expense scan pipelines.</p>
            </div>

            <div className="border-y border-[#DEDDDA]/50 dark:border-[#3E403D]/50 py-5 space-y-4">
              {/* Pricing section with cash vs credit point alternatives */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-400 block uppercase">Cash Price</span>
                  <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">₹350<span className="text-xs font-sans text-gray-400 font-normal"> / month</span></span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-amber-500 block uppercase font-semibold">Or Redeem Points</span>
                  <span className="text-lg font-mono font-bold text-amber-500">1,000<span className="text-[10px] font-sans text-gray-400 font-normal"> credit pts</span></span>
                </div>
              </div>

              {/* Benefits list */}
              <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#5A5A40] dark:text-[#C2C2A3]" />
                  <span>Secure vault with advanced biometric & firewall features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#5A5A40] dark:text-[#C2C2A3]" />
                  <span>Automated reminders for loans/EMI in user's SMS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#5A5A40] dark:text-[#C2C2A3]" />
                  <span>Automated reports of expenses and savings in user's registered Gmail</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-6">
            <button
              onClick={() => setShowFiatModal("Monthly")}
              className="py-2.5 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-bold text-xs rounded-xl shadow transition-all cursor-pointer text-center"
            >
              Pay ₹350 Fiat
            </button>
            <button
              onClick={() => handleRedeemPoints("Monthly")}
              className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer text-center"
            >
              Redeem 1,000 Pts
            </button>
          </div>
        </div>

        {/* YEARLY SUBSCRIPTION BOX */}
        <div className="bg-white dark:bg-[#2A2B29] rounded-4xl p-8 border-2 border-amber-500 dark:border-amber-400 relative overflow-hidden flex flex-col justify-between shadow-md">
          {/* Popular Tag */}
          <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold tracking-widest uppercase py-1.5 px-6 rotate-45 translate-x-7 translate-y-3 shadow-sm">
            Best Value
          </div>
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase">
                Pro Annual Saving
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3">Yearly Subscription</h3>
              <p className="text-xs text-gray-400 mt-1">Highest value package. Saves ₹2,850 annually. Complete peace-of-mind security.</p>
            </div>

            <div className="border-y border-[#DEDDDA]/50 dark:border-[#3E403D]/50 py-5 space-y-4">
              {/* Pricing section with cash vs credit point alternatives */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-400 block uppercase">Cash Price</span>
                  <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">₹1,350<span className="text-xs font-sans text-gray-400 font-normal"> / year</span></span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-amber-500 block uppercase font-semibold">Or Redeem Points</span>
                  <span className="text-lg font-mono font-bold text-amber-500">3,000<span className="text-[10px] font-sans text-gray-400 font-normal"> credit pts</span></span>
                </div>
              </div>

              {/* Benefits list */}
              <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-amber-500" />
                  <span>Secure vault with advanced biometric & firewall features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-amber-500" />
                  <span>Automated reminders for loans/EMI in user's SMS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-amber-500" />
                  <span>Automated reports of expenses and savings in user's registered Gmail</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-6">
            <button
              onClick={() => setShowFiatModal("Yearly")}
              className="py-2.5 bg-[#2D302D] hover:bg-black text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer text-center"
            >
              Pay ₹1,350 Fiat
            </button>
            <button
              onClick={() => handleRedeemPoints("Yearly")}
              className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer text-center"
            >
              Redeem 3,000 Pts
            </button>
          </div>
        </div>
      </div>

      {/* MOCK FIAT PAYMENT MODAL */}
      <AnimatePresence>
        {showFiatModal && (
          <div className="fixed inset-0 bg-black/60 z-999 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#2A2B29] rounded-4xl border border-[#DEDDDA] dark:border-[#3E403D] p-6 space-y-5 shadow-2xl relative"
            >
              <div className="space-y-1.5 text-center">
                <CreditCard className="w-10 h-10 text-[#5A5A40] dark:text-[#C2C2A3] mx-auto" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
                  Secure Gateway Payment
                </h3>
                <p className="text-xs text-gray-400">
                  Amount due: <span className="font-mono font-bold text-[#5A5A40] dark:text-[#C2C2A3]">₹{showFiatModal === "Monthly" ? "350" : "1,350"}</span> for {showFiatModal} Plan.
                </p>
              </div>

              {/* Payment methods selector */}
              <div className="flex gap-2 border-b border-[#DEDDDA]/50 dark:border-[#3E403D]/50 pb-3">
                <button
                  type="button"
                  onClick={() => setPayMethod("card")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                    payMethod === "card"
                      ? "bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/40"
                      : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Credit/Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod("upi")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                    payMethod === "upi"
                      ? "bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/40"
                      : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  UPI Address
                </button>
              </div>

              <form onSubmit={handleFiatPayment} className="space-y-4">
                {payMethod === "card" ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        16-Digit Card Number
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4111 2222 3333 4444"
                        value={cardNo}
                        onChange={(e) => setCardNo(e.target.value.replace(/[^\d ]/g, ""))}
                        className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5A5A40]/25 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5A5A40]/25 font-mono text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          CVV Code
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          placeholder="***"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5A5A40]/25 font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. mobile@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5A5A40]/25 font-mono"
                    />
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFiatModal(null)}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPaying}
                    className="flex-1 py-2 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isPaying ? "Authorizing..." : "Submit Payment"}
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
