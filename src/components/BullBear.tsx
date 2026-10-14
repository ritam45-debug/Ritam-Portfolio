/**
 * "Bulls vs Bears" — a looping tribute to the market's eternal tug-of-war.
 * A bull charges from the left, a bear from the right; they clash in the
 * middle with a burst of sparks while a meter swings between them.
 * All motion is CSS keyframes; under reduced motion they simply face off.
 */
export function BullBear() {
  return (
    <section aria-label="Bulls versus bears" className="relative overflow-hidden border-b border-line bg-surface/40">
      <div className="bb-stage relative mx-auto h-[220px] max-w-6xl px-4 sm:h-[260px] sm:px-6">
        {/* price line that flips colour with the momentum */}
        <svg viewBox="0 0 1200 260" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path className="bb-line" d="M0 170 L80 150 L150 165 L230 120 L300 140 L380 95 L450 130 L520 110 L600 150 L680 100 L760 135 L840 80 L920 120 L1000 90 L1080 140 L1200 100"
            fill="none" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <line x1="0" x2="1200" y1="215" y2="215" stroke="var(--line)" strokeDasharray="3 8" />
        </svg>

        <p className="bb-title ticker absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-muted">Every trading day · <span className="text-pos">Bulls</span> vs <span className="text-neg">Bears</span></p>

        {/* Bull — charging right */}
        <div className="bb-bull absolute bottom-6 right-1/2 w-[150px] sm:w-[200px]">
          <svg viewBox="0 0 200 140" className="w-full" aria-hidden>
            <g fill="var(--pos)">
              <path d="M30 70 C18 64 10 74 14 88" fill="none" stroke="var(--pos)" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="88" cy="80" rx="56" ry="30" />
              <ellipse cx="72" cy="60" rx="34" ry="20" />
              <path d="M128 58 L170 68 L178 90 L160 100 L136 96 Z" />
              <g className="bb-legs-bull">
                <rect x="46" y="98" width="11" height="34" rx="4" />
                <rect x="64" y="100" width="11" height="32" rx="4" />
                <rect x="108" y="98" width="11" height="34" rx="4" />
                <rect x="126" y="100" width="11" height="32" rx="4" />
              </g>
            </g>
            <path d="M150 64 C156 40 176 34 188 44" fill="none" stroke="var(--fg)" strokeWidth="6" strokeLinecap="round" />
            <path d="M140 62 C140 44 154 36 164 38" fill="none" stroke="var(--fg)" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
            <circle cx="160" cy="76" r="3.5" fill="var(--bg)" />
            <circle cx="174" cy="90" r="2.5" fill="var(--bg)" />
          </svg>
          <p className="mt-1 text-center font-mono text-xs font-semibold text-pos">BULLS ▲</p>
        </div>

        {/* Bear — charging left */}
        <div className="bb-bear absolute bottom-6 left-1/2 w-[150px] sm:w-[200px]">
          <svg viewBox="0 0 200 140" className="w-full" aria-hidden>
            <g fill="var(--neg)">
              <ellipse cx="112" cy="82" rx="60" ry="36" />
              <circle cx="52" cy="66" r="24" />
              <circle cx="40" cy="44" r="8" />
              <circle cx="64" cy="42" r="8" />
              <ellipse cx="32" cy="74" rx="14" ry="10" />
              <g className="bb-legs-bear">
                <rect x="70" y="104" width="14" height="28" rx="6" />
                <rect x="94" y="106" width="14" height="26" rx="6" />
                <rect x="132" y="104" width="14" height="28" rx="6" />
                <rect x="154" y="106" width="14" height="26" rx="6" />
              </g>
              <path className="bb-paw" d="M64 84 C46 86 34 96 30 108 C38 112 46 108 52 100 C58 96 66 94 72 94 Z" />
            </g>
            <circle cx="48" cy="62" r="3.5" fill="var(--bg)" />
            <circle cx="22" cy="72" r="3" fill="var(--bg)" />
          </svg>
          <p className="mt-1 text-center font-mono text-xs font-semibold text-neg">▼ BEARS</p>
        </div>

        {/* Clash burst */}
        <div className="bb-burst pointer-events-none absolute bottom-[96px] left-1/2 sm:bottom-[118px]" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <span key={i} className="absolute h-1.5 w-5 rounded-full" style={{ background: i % 2 ? "var(--amber)" : "var(--fg)", transform: `rotate(${a}rad) translateX(18px)`, transformOrigin: "0 50%" }} />;
          })}
          <span className="absolute -left-6 -top-6 h-12 w-12 rounded-full" style={{ background: "radial-gradient(circle, var(--amber), transparent 70%)" }} />
        </div>

        {/* Tug-of-war meter */}
        <div className="absolute bottom-2 left-1/2 w-[min(420px,80%)] -translate-x-1/2" aria-hidden>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-neg/70">
            <div className="bb-meter absolute inset-y-0 left-0 rounded-full bg-pos" />
          </div>
        </div>
      </div>
    </section>
  );
}
