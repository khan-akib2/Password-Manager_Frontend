let logoCount = 0;

export default function Logo({ size = 32, showText = true, textSize = "text-lg" }) {
  const id = `logo-${++logoCount}`;
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="logo-shield shrink-0">
        <defs>
          <linearGradient id={`sg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id={`lg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>
        <path d="M20 3L5 9v10c0 8.5 6.4 16.4 15 18.4C29.6 35.4 36 27.5 36 19V9L20 3z"
          fill="#111118" stroke={`url(#sg-${id})`} strokeWidth="1.5" />
        <rect x="14" y="20" width="12" height="9" rx="2" fill={`url(#lg-${id})`} opacity="0.9" />
        <path d="M16 20v-3a4 4 0 018 0v3" stroke={`url(#lg-${id})`} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <circle cx="20" cy="24" r="1.5" fill="#0a0a0f" />
        <rect x="19.2" y="24" width="1.6" height="2.5" rx="0.8" fill="#0a0a0f" />
      </svg>
      {showText && (
        <span className={`font-bold tracking-tight ${textSize}`}>
          <span className="text-white">Safe</span>
          <span className="gradient-text-sm">Buddy</span>
        </span>
      )}
    </div>
  );
}
