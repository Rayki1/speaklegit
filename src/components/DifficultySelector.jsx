const difficulties = [
  {
    level: "easy",
    label: "EASY MODE",
    emoji: "🟢",
    description: "Simple 3-6 letter words. Build foundation with basic vocabulary and pronunciation.",
    color: "from-emerald-400 to-teal-600",
    glow: "hover:shadow-[0_0_34px_rgba(16,185,129,0.35)]",
    border: "border-emerald-400/50",
    overlay: "from-emerald-400/14 via-emerald-300/6 to-transparent",
    buttonText: "text-emerald-950",
    pressShadow: "active:shadow-[0_10px_26px_rgba(16,185,129,0.32)]",
    interactiveSurface: "active:bg-emerald-500/14 sm:hover:bg-emerald-500/10",
    interactiveBorder: "active:border-emerald-300/80 sm:hover:border-emerald-300/70",
    orbGlow: "group-active:shadow-[0_0_28px_rgba(16,185,129,0.4)] sm:group-hover:shadow-[0_0_26px_rgba(16,185,129,0.35)]",
    buttonGlow: "active:shadow-[0_8px_20px_rgba(16,185,129,0.35)] sm:hover:shadow-[0_10px_24px_rgba(16,185,129,0.30)]",
  },
  {
    level: "medium",
    label: "MEDIUM MODE",
    emoji: "🟡",
    description: "Intermediate 6-10 letter words. Expand vocabulary and refine speaking skills.",
    color: "from-amber-400 to-orange-600",
    glow: "hover:shadow-[0_0_34px_rgba(245,158,11,0.35)]",
    border: "border-amber-400/55",
    overlay: "from-amber-300/16 via-yellow-200/8 to-transparent",
    buttonText: "text-amber-950",
    pressShadow: "active:shadow-[0_10px_26px_rgba(245,158,11,0.32)]",
    interactiveSurface: "active:bg-amber-500/14 sm:hover:bg-amber-500/10",
    interactiveBorder: "active:border-amber-300/80 sm:hover:border-amber-300/70",
    orbGlow: "group-active:shadow-[0_0_28px_rgba(245,158,11,0.4)] sm:group-hover:shadow-[0_0_26px_rgba(245,158,11,0.35)]",
    buttonGlow: "active:shadow-[0_8px_20px_rgba(245,158,11,0.35)] sm:hover:shadow-[0_10px_24px_rgba(245,158,11,0.30)]",
  },
  {
    level: "hard",
    label: "HARD MODE",
    emoji: "🔴",
    description: "Advanced 10+ letter words. Master complex vocabulary and challenging pronunciations.",
    color: "from-rose-500 to-red-700",
    glow: "hover:shadow-[0_0_34px_rgba(244,63,94,0.35)]",
    border: "border-rose-500/55",
    overlay: "from-rose-400/14 via-red-300/7 to-transparent",
    buttonText: "text-rose-50",
    pressShadow: "active:shadow-[0_10px_26px_rgba(244,63,94,0.32)]",
    interactiveSurface: "active:bg-rose-500/14 sm:hover:bg-rose-500/10",
    interactiveBorder: "active:border-rose-300/80 sm:hover:border-rose-300/70",
    orbGlow: "group-active:shadow-[0_0_28px_rgba(244,63,94,0.4)] sm:group-hover:shadow-[0_0_26px_rgba(244,63,94,0.35)]",
    buttonGlow: "active:shadow-[0_8px_20px_rgba(244,63,94,0.35)] sm:hover:shadow-[0_10px_24px_rgba(244,63,94,0.30)]",
  },
];

function DifficultySelector({ onSelect }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="mb-5 text-center sm:mb-8 lg:mb-10">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.45em] text-pink-400/80 sm:text-xs">
            ✦ Challenge Selection ✦
          </p>
          <h1 className="arcade-title text-2xl leading-tight text-white drop-shadow-[0_0_30px_rgba(236,72,153,0.5)] sm:text-4xl md:text-5xl lg:text-6xl">
            SELECT DIFFICULTY
          </h1>
          <div className="mx-auto mt-2 h-px w-20 bg-gradient-to-r from-transparent via-pink-500 to-transparent sm:mt-3 sm:w-32" />
          <p className="mt-2 text-xs font-medium italic text-purple-300/80 sm:text-sm md:text-base">
            Choose your challenge level to enhance your English skills
          </p>
        </div>

        <div className="flex h-full flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-4 lg:gap-6">
          {difficulties.map((diff) => (
            <button
              key={diff.level}
              type="button"
              onClick={() => onSelect(diff.level)}
              className={`group relative w-full overflow-hidden rounded-2xl border-2 ${diff.border} bg-[#0d0d18]/80 text-left backdrop-blur-xl touch-manipulation transition-all duration-300 active:translate-y-[2px] active:scale-[0.985] active:shadow-[0_0_26px_rgba(255,255,255,0.08)] ${diff.interactiveSurface} ${diff.interactiveBorder} ${diff.pressShadow} sm:hover:-translate-y-1 ${diff.glow} focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40`}
            >
              <div className={`h-1 w-full bg-gradient-to-r ${diff.color}`} />
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${diff.overlay} opacity-0 transition-opacity duration-300 group-active:opacity-90 sm:group-hover:opacity-85`} />

              <div className="flex min-h-[122px] items-center gap-4 px-4 py-3.5 sm:hidden">
                <div className={`shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl border ${diff.border} bg-black/30 text-3xl shadow-inner transition-transform duration-300 group-active:scale-95 sm:group-hover:scale-110 ${diff.orbGlow}`}>
                  {diff.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="arcade-title text-sm font-black tracking-wider text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
                    {diff.label}
                  </h3>
                  <p className="mt-0.5 min-h-[38px] line-clamp-2 text-[11px] leading-relaxed text-white/78 italic">
                    {diff.description}
                  </p>
                </div>
                <div className={`shrink-0 rounded-xl bg-gradient-to-r ${diff.color} px-4 py-2.5 arcade-title text-[11px] tracking-widest ${diff.buttonText} shadow-lg transition-all duration-150 group-active:translate-y-[1px] group-active:brightness-95 ${diff.buttonGlow}`}>
                  START
                </div>
              </div>

              <div className="hidden h-full flex-col items-center gap-4 p-5 text-center sm:flex md:p-6 lg:gap-5 lg:p-8">
                <div className={`relative flex h-20 w-20 items-center justify-center rounded-full border-2 ${diff.border} bg-black/30 text-4xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-transform duration-300 group-active:scale-95 sm:group-hover:scale-110 lg:h-24 lg:w-24 lg:text-5xl ${diff.orbGlow}`}>
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${diff.color} opacity-15 transition-opacity duration-300 sm:group-hover:opacity-25`} />
                  {diff.emoji}
                </div>

                <div className="min-h-[148px] space-y-2 md:min-h-[160px] lg:min-h-[168px]">
                  <h3 className="arcade-title text-lg font-black leading-tight tracking-wide text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] lg:text-2xl">
                    {diff.label}
                  </h3>
                  <p className="min-h-[72px] text-xs font-medium italic leading-relaxed text-white/78 md:min-h-[84px] md:text-sm">
                    {diff.description}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  {[...Array(diff.level === "easy" ? 1 : diff.level === "medium" ? 2 : 3)].map((_, i) => (
                    <span key={i} className={`h-2 w-2 rounded-full bg-gradient-to-br ${diff.color} shadow-sm`} />
                  ))}
                  {[...Array(3 - (diff.level === "easy" ? 1 : diff.level === "medium" ? 2 : 3))].map((_, i) => (
                    <span key={i} className="h-2 w-2 rounded-full bg-white/10" />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(diff.level);
                  }}
                  className={`w-full rounded-xl bg-gradient-to-r ${diff.color} py-3 arcade-title text-sm tracking-[0.18em] ${diff.buttonText} shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-200 hover:brightness-110 active:translate-y-[2px] active:scale-[0.985] active:brightness-95 ${diff.buttonGlow} lg:py-3.5 lg:text-base`}
                >
                  START
                </button>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-5 text-center text-[10px] font-medium uppercase tracking-[0.35em] text-white/25 sm:mt-6">
          Tap a card to begin
        </p>
      </div>
    </div>
  );
}

export default DifficultySelector;
