import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Custom-crafted geometric "M" glyph that forms the logo for MoneyLedger.
 * Combines structural ledger pillars with an ascending financial graph chevron
 * and currency emerald accent.
 */
export const LogoM: React.FC<LogoProps> = ({ className = 'w-7 h-7', size }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="MoneyLedger M Logo"
      role="img"
    >
      <defs>
        <linearGradient id="ml-m-gradient" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f172a" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="ml-chevron-gradient" x1="9" y1="7" x2="16" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Left Ledger Column */}
      <rect
        x="3"
        y="4.5"
        width="5"
        height="23"
        rx="2"
        fill="url(#ml-m-gradient)"
      />

      {/* Right Ledger Column */}
      <rect
        x="24"
        y="4.5"
        width="5"
        height="23"
        rx="2"
        fill="url(#ml-m-gradient)"
      />

      {/* Dynamic Central "M" V-Shape & Ledger Chevron */}
      {/* Left diagonal down to apex */}
      <path
        d="M6 5.5L16 19.5L18.8 15.5L10.5 4.5H6V5.5Z"
        fill="url(#ml-chevron-gradient)"
      />

      {/* Right diagonal down to apex */}
      <path
        d="M26 5.5L16 19.5L13.2 15.5L21.5 4.5H26V5.5Z"
        fill="url(#ml-m-gradient)"
      />

      {/* Central Currency Bar node (accentuating the financial ledger aspect) */}
      <circle cx="16" cy="19.5" r="2.2" fill="#10b981" />
      <path
        d="M13.5 10H18.5"
        stroke="#10b981"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

interface WordmarkProps {
  className?: string;
  iconSize?: string;
  textSize?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const MoneyLedgerWordmark: React.FC<WordmarkProps> = ({
  className = '',
  iconSize = 'w-7 h-7',
  textSize = 'text-xl',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-0.5 select-none font-bold tracking-tight text-slate-900 group cursor-pointer ${className}`}
    >
      <span className="flex items-center shrink-0 transition-transform duration-200 group-hover:scale-105">
        <LogoM className={iconSize} />
      </span>
      <span className={`${textSize} tracking-tight font-extrabold -ml-0.5 text-slate-900`}>
        oney<span className="text-slate-900 font-extrabold">Ledger</span>
      </span>
    </div>
  );
};
