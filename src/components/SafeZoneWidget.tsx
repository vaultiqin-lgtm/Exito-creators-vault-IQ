import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  Smartphone,
  Banknote,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Settings2,
  X,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SecurityRecovery } from "./SecurityRecovery";

interface SafeZoneWidgetProps {
  username: string;
  onTransferBack: (amount: number) => void;
}

export const SafeZoneWidget: React.FC<SafeZoneWidgetProps> = ({ username, onTransferBack }) => {
  // Cash and UPI balances
  const [cashBalance, setCashBalance] = useState<number>(10000);
  const [upiBalance, setUpiBalance] = useState<number>(15000);
  
  // PIN security states
  const [safeZonePin, setSafeZonePin] = useState<string>("1234");
  const [pinLength, setPinLength] = useState<4 | 6>(4);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);
  const [showPinConfigModal, setShowPinConfigModal] = useState<boolean>(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);
  
  // Unlock input
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  // PIN config modal states
  const [newPin, setNewPin] = useState<string>("");
  const [newPinLength, setNewPinLength] = useState<4 | 6>(4);
  const [configSuccess, setConfigSuccess] = useState<string>("");

  // Deposit/Withdraw states inside unlocked state
  const [targetCategory, setTargetCategory] = useState<"cash" | "upi">("cash");
  const [transferType, setTransferType] = useState<"deposit" | "withdraw">("withdraw");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string>("");

  // Load balances and PIN from localStorage
  useEffect(() => {
    const savedCash = localStorage.getItem(`vault_iq_safe_zone_cash_${username}`);
    const savedUpi = localStorage.getItem(`vault_iq_safe_zone_upi_${username}`);
    const savedPin = localStorage.getItem(`vault_iq_safe_zone_pin_${username}`);
    const savedLen = localStorage.getItem(`vault_iq_safe_zone_pin_len_${username}`);

    if (savedCash !== null) {
      setCashBalance(parseFloat(savedCash));
    }
    if (savedUpi !== null) {
      setUpiBalance(parseFloat(savedUpi));
    }
    if (savedPin) {
      setSafeZonePin(savedPin);
      setPinLength(savedPin.length === 6 ? 6 : 4);
    }
    if (savedLen) {
      setPinLength(parseInt(savedLen) === 6 ? 6 : 4);
    }
  }, [username]);

  const saveCashBalance = (amt: number) => {
    setCashBalance(amt);
    localStorage.setItem(`vault_iq_safe_zone_cash_${username}`, amt.toString());
  };

  const saveUpiBalance = (amt: number) => {
    setUpiBalance(amt);
    localStorage.setItem(`vault_iq_safe_zone_upi_${username}`, amt.toString());
  };

  const totalSafeZoneBalance = cashBalance + upiBalance;

  // Handle unlock attempt
  const handleVerifyPin = (pinToTest?: string) => {
    const code = pinToTest !== undefined ? pinToTest : enteredPin;
    if (code === safeZonePin) {
      setIsUnlocked(true);
      setShowUnlockModal(false);
      setEnteredPin("");
      setPinError("");
      setActionSuccess("Safe Zone Unlocked! Cash and UPI stashes are accessible.");
      setTimeout(() => setActionSuccess(""), 5000);
    } else {
      setPinError(`Incorrect ${pinLength}-digit PIN code. Please retry.`);
      setEnteredPin("");
    }
  };

  // Auto-verify when all digits are entered
  useEffect(() => {
    if (enteredPin.length === pinLength) {
      handleVerifyPin(enteredPin);
    }
  }, [enteredPin, pinLength]);

  const handleOpenUnlock = () => {
    setEnteredPin("");
    setPinError("");
    setShowUnlockModal(true);
  };

  const handleLockVault = () => {
    setIsUnlocked(false);
    setTransferAmount("");
  };

  // Handle transfer
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(transferAmount);
    if (isNaN(val) || val <= 0) return;

    if (transferType === "withdraw") {
      const currentCategoryBal = targetCategory === "cash" ? cashBalance : upiBalance;
      if (val > currentCategoryBal) {
        setPinError(`Insufficient funds in ${targetCategory.toUpperCase()} stash.`);
        return;
      }

      if (targetCategory === "cash") {
        saveCashBalance(cashBalance - val);
      } else {
        saveUpiBalance(upiBalance - val);
      }

      onTransferBack(val);
      setActionSuccess(`Transferred ₹${val.toLocaleString("en-IN")} from ${targetCategory.toUpperCase()} Stash to Active Budget!`);
    } else {
      // Deposit
      if (targetCategory === "cash") {
        saveCashBalance(cashBalance + val);
      } else {
        saveUpiBalance(upiBalance + val);
      }
      setActionSuccess(`Stashed ₹${val.toLocaleString("en-IN")} into ${targetCategory.toUpperCase()} Safe Zone!`);
    }

    setTransferAmount("");
    setTimeout(() => setActionSuccess(""), 5000);
  };

  // Save new PIN config
  const handleSavePinConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== newPinLength) {
      setPinError(`Please enter a valid ${newPinLength}-digit numeric PIN.`);
      return;
    }
    setSafeZonePin(newPin);
    setPinLength(newPinLength);
    localStorage.setItem(`vault_iq_safe_zone_pin_${username}`, newPin);
    localStorage.setItem(`vault_iq_safe_zone_pin_len_${username}`, newPinLength.toString());
    setConfigSuccess(`Safe Zone PIN updated to ${newPinLength}-digit code successfully!`);
    setTimeout(() => {
      setConfigSuccess("");
      setShowPinConfigModal(false);
      setNewPin("");
    }, 1500);
  };

  return (
    <div
      className="bg-[#1C1D1B] dark:bg-[#151615] text-[#E4E3E0] rounded-4xl p-6 border border-[#5A5A40]/30 shadow-xl relative overflow-hidden space-y-4"
      id="safe-zone-widget-root"
    >
      {/* Ambient glowing shield decoration */}
      <div className="absolute right-0 top-0 -translate-y-4 translate-x-4 w-28 h-28 bg-[#00C0F0]/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-[#5A5A40]/20 text-[#00F0FF] rounded-2xl border border-cyan-500/20">
            {isUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#00C0F0] block uppercase tracking-widest">
              Psychological Safe Zone
            </span>
            <h3 className="text-sm font-bold text-white">Dual Contingency Stash (Cash & UPI)</h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isUnlocked && (
            <button
              onClick={() => {
                setNewPin("");
                setNewPinLength(pinLength);
                setShowPinConfigModal(true);
              }}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Configure Safe Zone PIN"
            >
              <Settings2 size={16} />
            </button>
          )}

          <button
            onClick={isUnlocked ? handleLockVault : handleOpenUnlock}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-[#00C0F0] cursor-pointer"
            title={isUnlocked ? "Lock Stash" : "Unlock with PIN"}
          >
            {isUnlocked ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Aggregate Balance & Breakdown Display */}
      <div className="pt-2">
        <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
          Total Safe Zone Reserve
        </div>
        <div className="text-3xl font-mono font-extrabold text-white mt-0.5 flex items-baseline gap-2">
          {isUnlocked ? `₹${totalSafeZoneBalance.toLocaleString("en-IN")}` : "••••••••"}
          <span className="text-xs font-mono font-normal text-emerald-400">
            {isUnlocked && "(Cash + UPI)"}
          </span>
        </div>
        <span className="text-[10px] text-gray-400 mt-1 block leading-relaxed">
          *Guarded by custom {pinLength}-digit PIN. Excluded from active daily spending equations.
        </span>
      </div>

      {/* Cash vs UPI Partition Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Cash Category */}
        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
            <Banknote size={14} />
            <span>Cash Savings</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">
            {isUnlocked ? `₹${cashBalance.toLocaleString("en-IN")}` : "••••••"}
          </div>
          <span className="text-[9px] text-gray-400 font-mono block">Physical Emergency Cash</span>
        </div>

        {/* UPI Category */}
        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
            <Smartphone size={14} />
            <span>UPI Savings</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">
            {isUnlocked ? `₹${upiBalance.toLocaleString("en-IN")}` : "••••••"}
          </div>
          <span className="text-[9px] text-gray-400 font-mono block">Digital Liquid UPI Stash</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-400 rounded-r text-xs font-mono font-semibold">
          {actionSuccess}
        </div>
      )}

      {/* Unlocked Deposit / Withdraw Controls */}
      {isUnlocked && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-white/10 pt-4 space-y-3"
        >
          <form onSubmit={handleTransferSubmit} className="space-y-3">
            {/* Category Selector: Cash vs UPI */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTargetCategory("cash")}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold font-mono transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  targetCategory === "cash"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "border-white/10 text-gray-400 hover:bg-white/5"
                }`}
              >
                <Banknote size={13} /> Cash Stash
              </button>
              <button
                type="button"
                onClick={() => setTargetCategory("upi")}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold font-mono transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  targetCategory === "upi"
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                    : "border-white/10 text-gray-400 hover:bg-white/5"
                }`}
              >
                <Smartphone size={13} /> UPI Stash
              </button>
            </div>

            {/* Withdraw / Deposit Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTransferType("withdraw")}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold font-mono transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                  transferType === "withdraw"
                    ? "bg-rose-600 border-rose-500 text-white shadow-sm"
                    : "border-white/10 text-gray-400 hover:bg-white/5"
                }`}
              >
                <ArrowDownRight size={13} /> Withdraw to Budget
              </button>
              <button
                type="button"
                onClick={() => setTransferType("deposit")}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold font-mono transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                  transferType === "deposit"
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                    : "border-white/10 text-gray-400 hover:bg-white/5"
                }`}
              >
                <ArrowUpRight size={13} /> Deposit to Stash
              </button>
            </div>

            {/* Input & Execute */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 text-xs">₹</span>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder={`Amount (${targetCategory.toUpperCase()})`}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full pl-6 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#00C0F0]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-[#00C0F0] to-[#00E676] hover:opacity-90 text-[#1C1D1B] font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Execute
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ==========================================
          SAFE ZONE PIN UNLOCK MODAL
         ========================================== */}
      <AnimatePresence>
        {showUnlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2A2B29] border border-cyan-500/30 rounded-4xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-[#E4E3E0] relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-cyan-500/15 text-[#00F0FF] rounded-2xl">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Unlock Safe Zone</h3>
                    <p className="text-xs text-gray-400">Enter your {pinLength}-digit security PIN</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* PIN Dots Indicator */}
              <div className="space-y-4">
                <div className="flex justify-center gap-2.5 relative py-2">
                  {Array.from({ length: pinLength }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-11 h-13 border rounded-2xl flex items-center justify-center font-mono font-bold text-xl transition-all ${
                        enteredPin.length > idx
                          ? "border-cyan-400 bg-cyan-500/10 text-cyan-300"
                          : "border-white/10 bg-white/5 text-gray-500"
                      }`}
                    >
                      {enteredPin.length > idx ? "●" : ""}
                    </div>
                  ))}

                  {/* Hidden numeric capture input */}
                  <input
                    type="text"
                    pattern="\d*"
                    inputMode="numeric"
                    maxLength={pinLength}
                    autoFocus
                    value={enteredPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setEnteredPin(val);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                  />
                </div>

                {pinError && (
                  <p className="text-xs text-rose-400 font-semibold text-center font-mono">
                    {pinError}
                  </p>
                )}

                <div className="text-[10px] text-gray-400 text-center font-mono">
                  Tap the boxes or use keypad to enter your PIN
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowUnlockModal(false)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyPin()}
                    className="flex-1 py-2 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Verify & Unlock
                  </button>
                </div>

                {/* Forgot Safe Zone PIN Icon & Link */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnlockModal(false);
                      setShowRecoveryModal(true);
                    }}
                    className="text-xs text-[#00C0F0] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-xl hover:bg-cyan-500/10 transition-colors"
                    id="btn-forgot-safe-zone-pin"
                  >
                    <KeyRound size={14} className="text-[#00C0F0]" />
                    <span>Forgot Safe Zone PIN?</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          SAFE ZONE GMAIL PIN RECOVERY MODAL
         ========================================== */}
      {showRecoveryModal && (
        <SecurityRecovery
          target="safe_zone"
          username={username}
          onSuccess={(newPinCode) => {
            if (newPinCode) {
              setSafeZonePin(newPinCode);
              setPinLength(newPinCode.length === 6 ? 6 : 4);
            }
            setIsUnlocked(true);
            setShowRecoveryModal(false);
            setActionSuccess("Safe Zone PIN recovered and stash unlocked successfully!");
            setTimeout(() => setActionSuccess(""), 5000);
          }}
          onCancel={() => setShowRecoveryModal(false)}
        />
      )}

      {/* ==========================================
          CONFIGURE SAFE ZONE PIN MODAL
         ========================================== */}
      <AnimatePresence>
        {showPinConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2A2B29] border border-[#5A5A40]/40 rounded-4xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-[#E4E3E0]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound size={18} className="text-[#00F0FF]" />
                  <h3 className="text-sm font-bold text-white">Configure Safe Zone PIN</h3>
                </div>
                <button
                  onClick={() => setShowPinConfigModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSavePinConfig} className="space-y-4">
                {/* Select 4-digit or 6-digit length */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                    Choose PIN Length
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewPinLength(4);
                        setNewPin("");
                      }}
                      className={`py-2 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                        newPinLength === 4
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                          : "border-white/10 text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      4-Digit PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPinLength(6);
                        setNewPin("");
                      }}
                      className={`py-2 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                        newPinLength === 6
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                          : "border-white/10 text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      6-Digit PIN
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                    Enter New {newPinLength}-Digit Numeric PIN
                  </label>
                  <input
                    type="password"
                    maxLength={newPinLength}
                    required
                    placeholder={`e.g. ${newPinLength === 6 ? "123456" : "1234"}`}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-center font-mono font-bold text-lg text-white focus:outline-none focus:border-[#00C0F0]"
                  />
                </div>

                {configSuccess && (
                  <p className="text-xs text-emerald-400 font-semibold font-mono text-center">
                    {configSuccess}
                  </p>
                )}

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPinConfigModal(false)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-gradient-to-r from-[#00C0F0] to-[#00E676] text-[#1C1D1B] font-bold rounded-xl text-xs"
                  >
                    Save PIN
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
