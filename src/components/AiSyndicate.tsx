import React, { useState } from "react";
import { Sparkles, MessageSquare, Bot, ArrowRight, Shield, Award, LineChart, Briefcase, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AiSystem {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  borderColor: string;
  quickPrompts: string[];
  systemPrompt: string;
}

const AI_SYSTEMS: AiSystem[] = [
  {
    id: "wealthvault",
    name: "WealthVault AI",
    role: "Lead Financial Strategist",
    description: "Architects optimal asset allocation, liquid cash reserves, and premium wealth-compounding portfolios tailored to your base salary.",
    icon: LineChart,
    color: "from-amber-600/10 to-yellow-600/10 text-amber-500",
    borderColor: "border-amber-500/20",
    quickPrompts: [
      "Analyze a ₹65,000 monthly salary split for maximum compounding yield.",
      "How much liquid cash reserve should I secure before investing in index funds?",
      "Suggest a low-risk recurring deposit strategy for dynamic emergency funds."
    ],
    systemPrompt: "You are WealthVault AI, an elite wealth strategist. Provide high-level, luxury-tier financial advice on asset allocation, salary division, and compounding wealth. Address the user with prestige. Use bullet points and clear, luxury-oriented structure."
  },
  {
    id: "taxshield",
    name: "TaxShield AI",
    role: "Chartered Accountant Pro",
    description: "Specialist in Indian tax codes, legal exemptions under Section 80C/80D, and structured premium tax-saving investments.",
    icon: Shield,
    color: "from-emerald-600/10 to-teal-600/10 text-emerald-500",
    borderColor: "border-emerald-500/20",
    quickPrompts: [
      "What is the most tax-efficient way to invest ₹1.5 Lakhs under Section 80C?",
      "How does Section 80D medical insurance deduction benefit a family with senior parents?",
      "Explain tax slabs for a ₹15 Lakhs annual income under the new tax regime."
    ],
    systemPrompt: "You are TaxShield AI, a premier Indian Tax Advisory Consultant. Deliver precise, legally accurate breakdowns of tax exemptions, deductions under Section 80C/80D, and tax planning strategies. Present answers with pristine executive clarity."
  },
  {
    id: "cibilguard",
    name: "CIBIL Guard AI",
    role: "Credit & Debt Advisor",
    description: "Engineers CIBIL credit score repair, debt consolidation workflows, and customized EMI buffer strategies.",
    icon: Award,
    color: "from-blue-600/10 to-indigo-600/10 text-blue-500",
    borderColor: "border-blue-500/20",
    quickPrompts: [
      "What actions can restore my CIBIL score from 680 to 780+ fast?",
      "How does missing an EMI payment impact my overall borrow-profile?",
      "Provide a debt snowball strategy for 3 concurrent active loan EMIs."
    ],
    systemPrompt: "You are CIBIL Guard AI, an expert in credit optimization and debt restructuring. Give detailed, protective steps to repair credit rating, build solid EMI payment safety loops, and optimize borrowing power safely."
  },
  {
    id: "hustlecore",
    name: "HustleCore AI",
    role: "Side-Gig & Growth Mentor",
    description: "Identifies premium freelance vectors, digital product monetizations, and high-leverage side-income engines.",
    icon: Briefcase,
    color: "from-purple-600/10 to-pink-600/10 text-purple-500",
    borderColor: "border-purple-500/20",
    quickPrompts: [
      "What high-paying side-gigs fit a digital designer with 5 hours/week?",
      "Draft a luxury client pitch template for freelance financial consulting.",
      "How can I scale an educational newsletter into a subscription business?"
    ],
    systemPrompt: "You are HustleCore AI, a business development and monetization mentor. Deliver action-biased side-hustle roadmaps, freelance strategy scripts, and scalable secondary-income vectors with rich tactical value."
  }
];

export const AiSyndicate: React.FC = () => {
  const [selectedAi, setSelectedAi] = useState<AiSystem>(AI_SYSTEMS[0]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<{ role: "user" | "ai"; text: string; system: string }[]>([
    {
      role: "ai",
      text: "Welcome to the WealthVault Syndicate. I am WealthVault AI, your Lead Financial Strategist. Ask me any query regarding premium asset allocation, liquidity management, or capital compounding structures.",
      system: "wealthvault"
    }
  ]);

  const handleSelectAi = (ai: AiSystem) => {
    setSelectedAi(ai);
    // Add introductory message for selected AI system
    const intros: Record<string, string> = {
      wealthvault: "Welcome to the WealthVault Syndicate. I am WealthVault AI, your Lead Financial Strategist. Ask me any query regarding premium asset allocation, liquidity management, or capital compounding structures.",
      taxshield: "Greetings. I am TaxShield AI, your executive Tax & Regulatory advisor. Query me regarding legal Indian tax exemptions, deductions under 80C/80D, or corporate structure optimization.",
      cibilguard: "Secure connection established. I am CIBIL Guard AI. I am primed to analyze your borrowing profile, outline rapid credit-score restorations, and structure debt-reduction plans.",
      hustlecore: "Welcome to the high-growth arena. I am HustleCore AI. I map premium skills to dynamic secondary income systems and elite freelance pricing models."
    };
    setConversation([
      {
        role: "ai",
        text: intros[ai.id] || `Hello, I am ${ai.name}. How can I assist you with expert advisory today?`,
        system: ai.id
      }
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const finalQuery = textToSend || query;
    if (!finalQuery.trim() || isLoading) return;

    setQuery("");
    const updatedConversation = [
      ...conversation,
      { role: "user" as const, text: finalQuery, system: selectedAi.id }
    ];
    setConversation(updatedConversation);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/syndicate-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId: selectedAi.id,
          systemPrompt: selectedAi.systemPrompt,
          userPrompt: finalQuery,
          history: updatedConversation.slice(-6) // Send recent message history for context
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversation((prev) => [
          ...prev,
          { role: "ai", text: data.response, system: selectedAi.id }
        ]);
      } else {
        const errorData = await response.json();
        setConversation((prev) => [
          ...prev,
          { role: "ai", text: `Advisory connection timeout. Error: ${errorData.error || "System unreachable."}`, system: selectedAi.id }
        ]);
      }
    } catch (err) {
      console.error("Syndicate query error:", err);
      setConversation((prev) => [
        ...prev,
        { role: "ai", text: "Security connection failed. Please ensure your backend is compiled and online.", system: selectedAi.id }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="ai-syndicate-root">
      {/* Premium Header */}
      <div className="border-b border-[#DEDDDA] dark:border-[#3E403D]/60 pb-6">
        <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-semibold tracking-widest uppercase mb-1.5">
          <Bot size={14} className="animate-pulse" />
          <span>Multi-AI System Syndicate</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-light text-gray-900 dark:text-white">
          Elite Intelligence Syndicate
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
          Leverage a panel of four specialized, role-hardened AI advisors running concurrently to guide your tax, debt, side-income, and asset preservation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: System Selection */}
        <div className="lg:col-span-5 space-y-4">
          <span className="block text-[10px] font-mono font-bold tracking-wider text-gray-400 uppercase">
            Select Active Advisor
          </span>

          <div className="space-y-3.5">
            {AI_SYSTEMS.map((sys) => {
              const Icon = sys.icon;
              const isSelected = selectedAi.id === sys.id;
              return (
                <button
                  key={sys.id}
                  onClick={() => handleSelectAi(sys)}
                  className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? "bg-white dark:bg-[#252624] border-amber-500/50 dark:border-amber-500/30 shadow-md ring-1 ring-amber-500/20"
                      : "bg-[#FBFBFA] dark:bg-[#1E1F1D] border-[#DEDDDA] dark:border-[#3E403D] hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  {/* Subtle hover gradient background */}
                  <div className="absolute inset-0 bg-linear-to-r from-amber-500/0 via-amber-500/2 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl bg-linear-to-br ${sys.color} shrink-0 border ${sys.borderColor}`}>
                      <Icon size={20} />
                    </div>
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-sm text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
                          {sys.name}
                        </h3>
                        <span className="text-[9px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full font-semibold font-mono tracking-wide">
                          {sys.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {sys.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-4 right-4 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Conversation Panel */}
        <div className="lg:col-span-7 flex flex-col h-135 bg-white dark:bg-[#2A2B29] rounded-4xl border border-[#DEDDDA] dark:border-[#3E403D] overflow-hidden shadow-sm">
          {/* Panel Header */}
          <div className="px-6 py-4 border-b border-[#DEDDDA] dark:border-[#3E403D] flex items-center justify-between bg-gray-50/50 dark:bg-[#1E1F1D]/30">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-linear-to-br ${selectedAi.color} rounded-xl`}>
                {React.createElement(selectedAi.icon, { size: 16 })}
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-900 dark:text-white font-display">
                  {selectedAi.name}
                </span>
                <span className="block text-[10px] text-gray-400 font-mono">
                  Role: {selectedAi.role} (Online)
                </span>
              </div>
            </div>

            <button
              onClick={() => handleSelectAi(selectedAi)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
              title="Reset Conversation"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin">
            <AnimatePresence initial={false}>
              {conversation.map((msg, idx) => {
                const isAi = msg.role === "ai";
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed ${
                        isAi
                          ? "bg-gray-50 dark:bg-[#1C1D1B]/40 text-gray-700 dark:text-gray-300 border border-[#DEDDDA]/60 dark:border-[#3E403D]/40"
                          : "bg-amber-500 text-white font-medium shadow-sm"
                      }`}
                    >
                      {/* Preserving clean spacing & lines */}
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 dark:bg-[#1C1D1B]/40 rounded-3xl p-4 text-xs text-gray-400 flex items-center gap-2 border border-[#DEDDDA]/60 dark:border-[#3E403D]/40">
                  <Loader2 size={14} className="animate-spin text-amber-500" />
                  <span className="font-mono">Analyzing strategic financial variables...</span>
                </div>
              </div>
            )}
          </div>

          {/* Curated quick prompts */}
          <div className="px-6 py-2.5 bg-gray-50/50 dark:bg-[#1E1F1D]/10 border-t border-[#DEDDDA]/50 dark:border-[#3E403D]/40">
            <span className="block text-[9px] font-mono font-bold uppercase text-gray-400 mb-1.5">
              Curated Executive Prompts:
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedAi.quickPrompts.map((p, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(p)}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 bg-white dark:bg-[#1E1F1D] border border-[#DEDDDA] dark:border-[#3E403D] hover:border-amber-500/50 dark:hover:border-amber-500/40 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] text-left transition-all max-w-full truncate hover:scale-[1.01] cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input field */}
          <div className="p-4 border-t border-[#DEDDDA] dark:border-[#3E403D] flex gap-2 bg-white dark:bg-[#2A2B29]">
            <input
              type="text"
              placeholder={`Consult with ${selectedAi.name}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-[#1C1D1B]/40 border border-[#DEDDDA] dark:border-[#3E403D] text-[#2D302D] dark:text-[#E4E3E0] rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !query.trim()}
              className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
