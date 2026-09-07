import React, { useState, useEffect } from "react";
import { Calendar, CreditCard, Plus, Trash2, Check, AlertCircle, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const STANDARDIZED_SUBSCRIPTIONS = [
  { name: "Netflix", defaultAmount: 649, logoType: "netflix", color: "bg-rose-600 text-white", url: "https://www.netflix.com/youraccount" },
  { name: "Amazon Prime Video", defaultAmount: 1499, logoType: "prime", color: "bg-sky-500 text-white", url: "https://www.amazon.in/amazonprime" },
  { name: "JioHotstar", defaultAmount: 899, logoType: "jiohotstar", color: "bg-blue-700 text-white", url: "https://www.hotstar.com/my-account" },
  { name: "ZEE5", defaultAmount: 699, logoType: "zee5", color: "bg-purple-600 text-white", url: "https://www.zee5.com/myaccount" },
  { name: "SonyLIV", defaultAmount: 999, logoType: "sonyliv", color: "bg-indigo-600 text-white", url: "https://www.sonyliv.com/subscription" },
  { name: "Sun NXT", defaultAmount: 480, logoType: "sunnxt", color: "bg-amber-600 text-white", url: "https://www.sunnxt.com/" },
  { name: "Amazon MX Player", defaultAmount: 299, logoType: "mxplayer", color: "bg-cyan-600 text-white", url: "https://www.amazon.in/minitv" },
  { name: "Airtel Xstream", defaultAmount: 149, logoType: "airtel", color: "bg-red-700 text-white", url: "https://www.airtelxstream.in/" },
  { name: "Spotify", defaultAmount: 119, logoType: "spotify", color: "bg-emerald-500 text-white", url: "https://www.spotify.com/account/premium" },
];

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: "Monthly" | "Quarterly" | "Annually";
  nextRenewalDate: string; // YYYY-MM-DD
  logoType: string;
}

interface SubscriptionTrackerProps {
  username: string;
}

export const SubscriptionTracker: React.FC<SubscriptionTrackerProps> = ({ username = "User" }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  
  // Form input states with standardized dropdown
  const [selectedServiceName, setSelectedServiceName] = useState<string>(STANDARDIZED_SUBSCRIPTIONS[0].name);
  const [amount, setAmount] = useState<string>(STANDARDIZED_SUBSCRIPTIONS[0].defaultAmount.toString());
  const [frequency, setFrequency] = useState<"Monthly" | "Quarterly" | "Annually">("Monthly");
  const [nextRenewalDate, setNextRenewalDate] = useState("");

  // Load subscriptions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`vault_iq_subscriptions_${username}`);
    if (saved) {
      setSubscriptions(JSON.parse(saved));
    } else {
      // Seed default subscriptions from standardized list
      const defaultSubs: Subscription[] = [
        { id: "s1", name: "Netflix", amount: 649, frequency: "Monthly", nextRenewalDate: getFutureDate(3), logoType: "netflix" },
        { id: "s2", name: "Spotify", amount: 119, frequency: "Monthly", nextRenewalDate: getFutureDate(1), logoType: "spotify" },
        { id: "s3", name: "Amazon Prime Video", amount: 1499, frequency: "Annually", nextRenewalDate: getFutureDate(12), logoType: "prime" }
      ];
      setSubscriptions(defaultSubs);
      localStorage.setItem(`vault_iq_subscriptions_${username}`, JSON.stringify(defaultSubs));
    }
  }, [username]);

  // Handle dropdown change
  const handleServiceSelect = (serviceName: string) => {
    setSelectedServiceName(serviceName);
    const serviceObj = STANDARDIZED_SUBSCRIPTIONS.find((s) => s.name === serviceName);
    if (serviceObj) {
      setAmount(serviceObj.defaultAmount.toString());
    }
  };

  // Save to localStorage
  const saveSubscriptions = (updated: Subscription[]) => {
    setSubscriptions(updated);
    localStorage.setItem(`vault_iq_subscriptions_${username}`, JSON.stringify(updated));
  };

  function getFutureDate(daysAhead: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split("T")[0];
  }

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceName || !amount || !nextRenewalDate) return;

    const matchedService = STANDARDIZED_SUBSCRIPTIONS.find((s) => s.name === selectedServiceName);
    const resolvedLogoType = matchedService ? matchedService.logoType : "custom";

    const newSub: Subscription = {
      id: Math.random().toString(36).substring(2, 9),
      name: selectedServiceName,
      amount: parseFloat(amount),
      frequency,
      nextRenewalDate,
      logoType: resolvedLogoType,
    };

    const updated = [newSub, ...subscriptions];
    saveSubscriptions(updated);

    // Reset form to first option
    setSelectedServiceName(STANDARDIZED_SUBSCRIPTIONS[0].name);
    setAmount(STANDARDIZED_SUBSCRIPTIONS[0].defaultAmount.toString());
    setNextRenewalDate("");
    setFrequency("Monthly");
  };

  const handleDeleteSub = (id: string) => {
    const updated = subscriptions.filter((s) => s.id !== id);
    saveSubscriptions(updated);
  };

  // Renew Action: Extend the renewal date
  const handleRenewSub = (id: string) => {
    const updated = subscriptions.map((s) => {
      if (s.id === id) {
        const currentRenewal = new Date(s.nextRenewalDate);
        if (s.frequency === "Monthly") {
          currentRenewal.setMonth(currentRenewal.getMonth() + 1);
        } else if (s.frequency === "Quarterly") {
          currentRenewal.setMonth(currentRenewal.getMonth() + 3);
        } else {
          currentRenewal.setFullYear(currentRenewal.getFullYear() + 1);
        }
        return {
          ...s,
          nextRenewalDate: currentRenewal.toISOString().split("T")[0]
        };
      }
      return s;
    });
    saveSubscriptions(updated);
  };

  // Check if a subscription is renewing within 5 days or already overdue
  const isApproaching = (renewalDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = new Date(renewalDateStr);
    renewal.setHours(0, 0, 0, 0);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= -30 && diffDays <= 5;
  };

  // Return the official checkout/payment portal page for standardized providers
  const getServicePayUrl = (sub: Subscription) => {
    const match = STANDARDIZED_SUBSCRIPTIONS.find(
      (s) => s.name.toLowerCase() === sub.name.toLowerCase() || s.logoType === sub.logoType
    );
    return match ? match.url : `https://www.google.com/search?q=pay+${encodeURIComponent(sub.name)}`;
  };

  // Get active alerts (3 days or 1 day prior)
  const getAlerts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return subscriptions.filter((s) => {
      const renewal = new Date(s.nextRenewalDate);
      renewal.setHours(0, 0, 0, 0);
      const diffTime = renewal.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === 1 || diffDays === 3 || diffDays <= 0;
    });
  };

  const activeAlerts = getAlerts();

  // Helper to match colors for predefined services
  const getServiceColor = (nameOrType: string) => {
    const match = STANDARDIZED_SUBSCRIPTIONS.find(
      (s) => s.name.toLowerCase() === nameOrType.toLowerCase() || s.logoType === nameOrType.toLowerCase()
    );
    return match ? match.color : "bg-[#5A5A40] text-white";
  };

  return (
    <div className="space-y-8" id="subscription-tracker-root">
      {/* Header title */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Recurring Subscription Tracker
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track upcoming digital renewals for standardized streaming and music platforms, prevent unintended card deductions, and manage automated cycles.
        </p>
      </div>

      {/* Renewal alerts center */}
      <AnimatePresence>
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm font-mono">
              <AlertTriangle size={18} />
              <span>SUBSCRIPTION RENEWAL WARNING DESK (Live Checks)</span>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-300">
              The scheduler identified the following active services due for renewal within 3 days, 1 day, or overdue. Take quick actions to avoid unintended transaction charges:
            </p>

            <div className="space-y-3">
              {activeAlerts.map((sub) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const renewal = new Date(sub.nextRenewalDate);
                renewal.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const alertText = diffDays < 0 ? "Overdue" : diffDays === 0 ? "Today" : `In ${diffDays} day${diffDays > 1 ? "s" : ""}`;

                return (
                  <div
                    key={sub.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white dark:bg-[#2A2B29] border border-amber-500/20 rounded-xl gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm ${getServiceColor(sub.name)}`}>
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{sub.name}</h4>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold font-mono uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Renewing {alertText} ({sub.nextRenewalDate})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block font-mono uppercase">Amount</span>
                        <span className="text-sm font-bold font-mono text-gray-900 dark:text-white">₹{sub.amount}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRenewSub(sub.id)}
                          className="px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={12} /> Renewed
                        </button>
                        <button
                          onClick={() => handleDeleteSub(sub.id)}
                          className="px-3 py-1.5 bg-rose-500 text-white hover:bg-rose-600 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} /> Cancelled
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Create form with Standardized Dropdown */}
        <div className="lg:col-span-1 bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6 h-fit">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Plus size={18} className="text-[#5A5A40] dark:text-[#C2C2A3]" />
            Schedule Subscription
          </h2>

          <form onSubmit={handleAddSubscription} className="space-y-4">
            {/* Standardized Dropdown Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Select Platform / Service
              </label>
              <select
                value={selectedServiceName}
                onChange={(e) => handleServiceSelect(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none text-sm font-medium"
                id="subscription-select-dropdown"
              >
                {STANDARDIZED_SUBSCRIPTIONS.map((service) => (
                  <option key={service.name} value={service.name}>
                    {service.name} (₹{service.defaultAmount})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 199"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Subscription["frequency"])}
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none text-sm"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Next Renewal Date
              </label>
              <input
                type="date"
                required
                value={nextRenewalDate}
                onChange={(e) => setNextRenewalDate(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              id="btn-add-subscription"
            >
              Add Scheduled Subscription
            </button>
          </form>
        </div>

        {/* Right Side: Active listing */}
        <div className="lg:col-span-2 bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard size={18} className="text-[#5A5A40] dark:text-[#C2C2A3]" />
            Your Scheduled Recurring Accounts
          </h2>

          {subscriptions.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              No subscriptions logged yet. Select a service above to start tracking renewals!
            </div>
          ) : (
            <div className="divide-y divide-[#DEDDDA] dark:divide-[#3E403D] space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between pt-4 first:pt-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm uppercase shadow-sm ${getServiceColor(sub.name)}`}>
                      {sub.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {sub.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-medium text-gray-400 uppercase bg-gray-50 dark:bg-[#1C1D1B]/40 px-1.5 py-0.5 rounded border border-[#DEDDDA] dark:border-[#3E403D]">
                          {sub.frequency}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Next Renewal: {sub.nextRenewalDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-gray-900 dark:text-white block">
                        ₹{sub.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[9px] text-gray-400 uppercase block font-mono">
                        recurring charge
                      </span>
                    </div>

                    {isApproaching(sub.nextRenewalDate) && (
                      <a
                        href={getServicePayUrl(sub)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#5A5A40] text-white dark:bg-[#C2C2A3] dark:text-gray-900 font-bold text-xs rounded-xl shadow-sm hover:scale-105 transition-all inline-flex items-center justify-center cursor-pointer font-sans"
                        title={`Redirect to official portal to pay for ${sub.name}`}
                      >
                        Pay
                      </a>
                    )}

                    <button
                      onClick={() => handleDeleteSub(sub.id)}
                      className="p-2 text-rose-500 hover:text-white hover:bg-rose-600 rounded-xl transition-all cursor-pointer border border-[#DEDDDA] dark:border-[#3E403D]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
