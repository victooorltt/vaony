/**
 * Signature element: a function curve that draws itself across the hero's
 * coordinate plane. Pure SVG + CSS animation, zero image weight.
 */
export function FunctionCurve({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 360"
      fill="none"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* axes */}
      <line x1="40" y1="320" x2="580" y2="320" stroke="#000B36" strokeOpacity="0.2" />
      <line x1="40" y1="320" x2="40" y2="20" stroke="#000B36" strokeOpacity="0.2" />
      <text x="560" y="342" fontFamily="monospace" fontSize="12" fill="#000B36" fillOpacity="0.4">x</text>
      <text x="18" y="30" fontFamily="monospace" fontSize="12" fill="#000B36" fillOpacity="0.4">f(x)</text>

      {/* the curve: draws itself on load */}
      <path
        d="M 40 300 C 140 300, 160 160, 260 150 S 420 220, 480 120 S 560 40, 580 36"
        stroke="url(#curveGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="1400"
        strokeDashoffset="1400"
        className="animate-draw"
      />

      {/* plotted points */}
      <circle cx="260" cy="150" r="6" fill="#2924FD" />
      <circle cx="260" cy="150" r="11" fill="#2924FD" fillOpacity="0.15" />
      <circle cx="480" cy="120" r="6" fill="#FFB020" />
      <circle cx="480" cy="120" r="11" fill="#FFB020" fillOpacity="0.2" />
      <text x="274" y="142" fontFamily="monospace" fontSize="11" fill="#060D90">(you, today)</text>
      <text x="424" y="104" fontFamily="monospace" fontSize="11" fill="#B27300">(you, +10 sessions)</text>

      <defs>
        <linearGradient id="curveGrad" x1="40" y1="320" x2="580" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2924FD" />
          <stop offset="1" stopColor="#060D90" />
        </linearGradient>
      </defs>
    </svg>
  );
}
