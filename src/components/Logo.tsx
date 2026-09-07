import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  useImage?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  showText = true,
  size = "md",
  useImage = true,
}) => {
  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "w-9 h-9";
      case "md":
        return "w-11 h-11";
      case "lg":
        return "w-16 h-16";
      case "xl":
        return "w-24 h-24";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-lg";
      case "md":
        return "text-2xl";
      case "lg":
        return "text-3xl";
      case "xl":
        return "text-4xl";
    }
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="vault-iq-logo">
      {useImage ? (
        <img
          src={showText ? "/vault-iq-mark.png" : "/vault-iq-logo.png"}
          alt="Vault IQ Logo"
          className={`${getIconSize()} rounded-xl object-contain drop-shadow-md border border-cyan-500/25 bg-[#080B12] p-0.5`}
          onError={(e) => {
            // fallback if image not found
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : (
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            className={`${getIconSize()} drop-shadow-md`}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00C0F0" />
                <stop offset="100%" stopColor="#0066FF" />
              </linearGradient>
              <linearGradient id="tealGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00F0FF" />
                <stop offset="100%" stopColor="#00E676" />
              </linearGradient>
              <linearGradient id="vaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2A303C" />
                <stop offset="50%" stopColor="#19202C" />
                <stop offset="100%" stopColor="#0F141C" />
              </linearGradient>
              <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E676" />
                <stop offset="100%" stopColor="#00C0F0" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#00C0F0" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Base Dark Titanium Circular Plate */}
            <circle cx="50" cy="50" r="47" fill="url(#vaultGrad)" stroke="url(#tealGrad)" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#00C0F0" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

            {/* Precision Dial Ticks around Rim */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="50"
                y1="6"
                x2="50"
                y2={deg % 90 === 0 ? "9.5" : "8"}
                stroke={deg % 90 === 0 ? "#00E676" : "#00C0F0"}
                strokeWidth={deg % 90 === 0 ? "1.5" : "1"}
                strokeLinecap="round"
                transform={`rotate(${deg} 50 50)`}
                opacity="0.8"
              />
            ))}

            {/* Upward Growth Bars */}
            <rect x="36" y="44" width="4.5" height="18" rx="2" fill="url(#tealGrad)" opacity="0.45" />
            <rect x="43.5" y="35" width="4.5" height="27" rx="2" fill="url(#tealGrad)" opacity="0.75" />
            <rect x="51" y="26" width="4.5" height="36" rx="2" fill="url(#tealGrad)" />

            {/* Upward Surging Growth Arrow */}
            <path
              d="M32 54 L42 42 L50 49 L68 28"
              stroke="#00E676"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
            <path
              d="M60 28 L68 28 L68 36"
              fill="none"
              stroke="#00E676"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Stylized Centered 'V' Monogram Wings */}
            <path
              d="M24 33 L45 71 L51 71 L33 33 Z"
              fill="url(#blueGrad)"
              filter="url(#glow)"
              opacity="0.9"
            />
            <path
              d="M76 33 L55 71 L49 71 L67 33 Z"
              fill="url(#blueGrad)"
              opacity="0.4"
            />

            {/* Centered Vault Safe Dial Outer Ring */}
            <circle cx="50" cy="50" r="14" fill="#141A24" stroke="url(#tealGrad)" strokeWidth="1.8" />
            <circle cx="50" cy="50" r="11" fill="none" stroke="#00F0FF" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />

            {/* Vault Wheel Spokes */}
            <rect x="48.8" y="38" width="2.4" height="24" rx="1.2" fill="#00F0FF" />
            <rect x="38" y="48.8" width="24" height="2.4" rx="1.2" fill="#00F0FF" />

            {/* Glowing Core Pivot */}
            <circle cx="50" cy="50" r="5" fill="url(#glowGrad)" stroke="#111827" strokeWidth="1" />
            <circle cx="50" cy="50" r="2" fill="#FFFFFF" />
          </svg>
        </div>
      )}

      {showText && (
        <div className="flex flex-col select-none">
          <span
            className={`${getTextSize()} font-display font-bold tracking-tight text-[#2D302D] dark:text-white flex items-center gap-1 leading-none`}
          >
            Vault <span className="bg-gradient-to-r from-[#00C0F0] to-[#00E676] bg-clip-text text-transparent">IQ</span>
          </span>
          {size !== "sm" && (
            <span className="text-[10px] uppercase tracking-[0.22em] font-mono text-gray-500 dark:text-gray-400 font-semibold mt-1">
              Track. Plan. Grow.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
