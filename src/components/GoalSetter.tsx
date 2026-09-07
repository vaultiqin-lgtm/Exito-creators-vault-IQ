import React, { useState, useRef } from "react";
import { FinancialGoal } from "../types";
import {
  Plus,
  Trash2,
  TrendingUp,
  Image as ImageIcon,
  PiggyBank,
  ChevronRight,
  ArrowRight,
  Info,
  Sparkles,
  Download,
} from "lucide-react";
import { motion } from "motion/react";

interface GoalSetterProps {
  goals: FinancialGoal[];
  setGoals: React.Dispatch<React.SetStateAction<FinancialGoal[]>>;
  onSavingsAdded: (amount: number) => void;
}

export const GoalSetter: React.FC<GoalSetterProps> = ({
  goals,
  setGoals,
  onSavingsAdded,
}) => {
  // New Goal Input States
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialSavings, setInitialSavings] = useState("");
  const [coverImage, setCoverImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Savings Input per goal
  const [addSavingsAmount, setAddSavingsAmount] = useState<Record<string, string>>({});

  // Preset Cover Images for standard goals (Bike, Car, House, Travel)
  const presets = [
    {
      name: "Superbike",
      url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60",
    },
    {
      name: "Luxury Car",
      url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60",
    },
    {
      name: "Dream House",
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60",
    },
    {
      name: "World Travel",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
    },
  ];

  // Handle local image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Create Goal
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const initial = parseFloat(initialSavings) || 0;

    if (!goalName.trim() || isNaN(target) || target <= 0) return;

    // Default to the first preset image if no custom image selected
    const selectedImage = coverImage || presets[2].url;

    const newGoal: FinancialGoal = {
      id: Math.random().toString(36).substring(2, 9),
      name: goalName.trim(),
      targetAmount: target,
      currentSavings: Math.max(0, initial),
      coverImage: selectedImage,
    };

    setGoals((prev) => [...prev, newGoal]);

    // If there was any initial savings added, trigger the AI appreciation pipeline!
    if (initial > 0) {
      onSavingsAdded(initial);
    }

    // Reset Inputs
    setGoalName("");
    setTargetAmount("");
    setInitialSavings("");
    setCoverImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Delete Goal
  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Add savings specifically to a goal
  const handleAddSavingsToGoal = (id: string) => {
    const amountStr = addSavingsAmount[id];
    const amountToAdd = parseFloat(amountStr);

    if (isNaN(amountToAdd) || amountToAdd <= 0) return;

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updatedSavings = g.currentSavings + amountToAdd;
        return {
          ...g,
          currentSavings: updatedSavings,
        };
      })
    );

    // Call callback to trigger parent level AI appreciation banner
    onSavingsAdded(amountToAdd);

    // Clear specific input
    setAddSavingsAmount((prev) => ({ ...prev, [id]: "" }));
  };

  // Export individual Financial Goal Audit document
  const downloadGoalDocument = (goal: FinancialGoal) => {
    const percent = Math.min(100, Math.round((goal.currentSavings / goal.targetAmount) * 100)) || 0;
    const remaining = Math.max(0, goal.targetAmount - goal.currentSavings);

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Vault IQ Financial Goal Audit Statement</title>
        <style>
          body { font-family: 'Arial', sans-serif; color: #2D302D; line-height: 1.6; padding: 40px; }
          .goal-card { border: 2px solid #5A5A40; border-radius: 12px; padding: 30px; max-width: 600px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #DEDDDA; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: bold; color: #5A5A40; letter-spacing: 2px; }
          .title { font-size: 14px; color: #888; margin-top: 5px; text-transform: uppercase; font-weight: bold; }
          .details-grid { margin-bottom: 30px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #EAEAEA; padding-bottom: 5px; font-size: 13px; }
          .label { font-weight: bold; color: #666; }
          .value { text-align: right; font-weight: 500; color: #2D302D; }
          .progress-box { background: #F5F5F0; padding: 18px; border-radius: 10px; margin-top: 25px; text-align: center; }
          .amount-val { font-size: 32px; font-weight: bold; color: #5A5A40; margin-top: 5px; }
          .footer { text-align: center; font-size: 10px; color: #999; margin-top: 40px; border-top: 1px solid #DEDDDA; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="goal-card">
          <div class="header">
            <div class="logo">VAULT IQ</div>
            <div class="title">FINANCIAL DREAM GOAL AUDIT STATEMENT</div>
          </div>
          <div class="details-grid">
            <div class="row">
              <span class="label">Goal Reference ID:</span>
              <span class="value">#VIQ-GOAL-${goal.id.toUpperCase()}</span>
            </div>
            <div class="row">
              <span class="label">Goal Description:</span>
              <span class="value">${goal.name}</span>
            </div>
            <div class="row">
              <span class="label">Target Capital Goal:</span>
              <span class="value">₹${goal.targetAmount.toLocaleString("en-IN")}</span>
            </div>
            <div class="row">
              <span class="label">Current Savings Accumulated:</span>
              <span class="value">₹${goal.currentSavings.toLocaleString("en-IN")}</span>
            </div>
            <div class="row">
              <span class="label">Balance Outstanding to Target:</span>
              <span class="value">₹${remaining.toLocaleString("en-IN")}</span>
            </div>
            <div class="row">
              <span class="label">Milestone Completion:</span>
              <span class="value"><strong>${percent}%</strong> Completed</span>
            </div>
            <div class="row">
              <span class="label">Audit Certified Date:</span>
              <span class="value">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>
          <div class="progress-box">
            <span class="label" style="text-transform: uppercase; font-size: 11px; tracking: 1px;">ACCUMULATED SAVINGS BALANCE</span>
            <div class="amount-val">₹${goal.currentSavings.toLocaleString("en-IN")} / ₹${goal.targetAmount.toLocaleString("en-IN")}</div>
          </div>
          <div class="footer">
            Generated via Vault IQ Personal Finance Engine.<br/>
            Track and achieve your dream aspirations systematically.
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Goal_${goal.name.replace(/[^a-zA-Z0-9]/g, "_")}_${goal.id}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8" id="goal-setter-root">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
          Goal Setter & Dream Achiever
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create financial goals for buying bikes, houses, cars, and add savings specifically towards them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Goal Creator Form Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-[#2A2B29] rounded-3xl p-6 border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm space-y-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-[#5A5A40] dark:text-[#C2C2A3]" size={18} />
            Create Financial Goal
          </h2>

          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Dream Goal Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dream Bike, Villa, Car"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Target Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={100}
                    placeholder="e.g. 150000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Initial Savings (₹)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 5000"
                    value={initialSavings}
                    onChange={(e) => setInitialSavings(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl focus:ring-2 focus:ring-[#5A5A40]/30 outline-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Custom Cover Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Goal Cover Image
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] hover:border-[#5A5A40] dark:hover:border-[#C2C2A3] text-gray-600 dark:text-gray-300 font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <ImageIcon size={14} /> Upload Custom Photo
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />

                {coverImage && (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#DEDDDA] dark:border-[#3E403D]">
                    <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white font-bold text-xs flex items-center justify-center transition-colors"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Preset selectors if no upload */}
              {!coverImage && (
                <div className="mt-3">
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-gray-400 mb-1.5">
                    Or select a preset theme cover:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {presets.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setCoverImage(p.url)}
                        className="h-10 rounded-lg overflow-hidden border border-[#DEDDDA] dark:border-[#3E403D] hover:border-[#5A5A40] dark:hover:border-[#C2C2A3] relative cursor-pointer"
                        title={p.name}
                      >
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors"></div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 font-medium rounded-xl shadow-md transition-all cursor-pointer text-sm"
              id="goal-creator-submit"
            >
              <Plus size={16} /> Establish Goal
            </button>
          </form>
        </div>

        {/* Goals Progress Grid view */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#5A5A40]/10 dark:bg-[#C2C2A3]/10 border border-[#DEDDDA] dark:border-[#3E403D] rounded-2xl p-4 flex gap-3 items-start">
            <Info className="text-[#5A5A40] dark:text-[#C2C2A3] mt-0.5 shrink-0" size={18} />
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-[#5A5A40] dark:text-[#C2C2A3]">
                AI Appreciation Integration
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Whenever you add your accumulated savings specifically towards any goal here, the AI instantly detects the savings trigger and appreciates you with personalized motivational popups displayed at the top of the dashboard!
              </p>
            </div>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#2A2B29] rounded-3xl border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm text-sm text-gray-400">
              No financial goals set yet. Build your dream bike, villa, or car goal above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((g) => {
                const percent = Math.min(100, Math.round((g.currentSavings / g.targetAmount) * 100)) || 0;
                return (
                  <div
                    key={g.id}
                    className="bg-white dark:bg-[#2A2B29] rounded-3xl overflow-hidden border border-[#DEDDDA] dark:border-[#3E403D] shadow-sm flex flex-col justify-between"
                  >
                    {/* Goal Card Header Image */}
                    <div className="h-32 relative">
                      <img src={g.coverImage} alt={g.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                        <h3 className="font-display font-bold text-lg truncate pr-2">{g.name}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => downloadGoalDocument(g)}
                            className="p-1.5 bg-black/50 hover:bg-[#5A5A40] text-white rounded-lg transition-all cursor-pointer border border-white/20 flex items-center gap-1 text-[10px] font-bold"
                            title="Download Goal Document (.docx)"
                          >
                            <Download size={13} /> Document
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(g.id)}
                            className="p-1.5 bg-black/40 hover:bg-rose-600 rounded-lg text-white transition-all cursor-pointer border border-white/20"
                            title="Delete goal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Goal Card Body Progress */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 font-semibold uppercase tracking-wider">
                            Accumulated Savings
                          </span>
                          <span className="text-gray-400 font-semibold uppercase tracking-wider">
                            Target Goal
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-lg font-mono font-bold text-[#5A5A40] dark:text-[#C2C2A3]">
                            ₹{g.currentSavings.toLocaleString("en-IN")}
                          </span>
                          <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                            ₹{g.targetAmount.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-[#5A5A40] to-[#C2C2A3] rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[11px] font-semibold text-gray-400 font-mono">
                          <span>Progress Gauge</span>
                          <span className="text-[#5A5A40] dark:text-[#C2C2A3]">{percent}% Achieved</span>
                        </div>
                      </div>

                      {/* Add Savings Specific to Goal Form Box */}
                      <div className="pt-3 border-t border-[#DEDDDA] dark:border-[#3E403D] flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 font-bold text-xs select-none">
                            ₹
                          </span>
                          <input
                            type="number"
                            min={1}
                            placeholder="Add savings"
                            value={addSavingsAmount[g.id] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAddSavingsAmount((prev) => ({ ...prev, [g.id]: val }));
                            }}
                            className="w-full pl-6 pr-2 py-1.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-lg focus:ring-1 focus:ring-[#5A5A40] outline-none font-mono text-xs"
                          />
                        </div>
                        <button
                          onClick={() => handleAddSavingsToGoal(g.id)}
                          className="px-3 py-1.5 bg-[#5A5A40] hover:bg-[#4E5440] dark:bg-[#C2C2A3] dark:hover:bg-[#B2B293] text-white dark:text-gray-900 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          Add <PiggyBank size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
