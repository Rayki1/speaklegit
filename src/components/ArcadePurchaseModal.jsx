function ArcadePurchaseModal({
  open,
  icon = "🪙",
  title,
  description,
  cost,
  inventoryCount = 0,
  confirmLabel = "Purchase",
  confirmDisabled = false,
  helperText = null,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-white/10 bg-[#12121e]/95 shadow-[0_24px_90px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95">
        <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400"></div>
        <div className="absolute -top-20 -left-8 h-48 w-48 rounded-full bg-pink-600/20 blur-[90px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-8 h-52 w-52 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"></div>

        <div className="relative p-6 md:p-7">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/30 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 text-3xl shadow-[0_0_35px_rgba(250,204,21,0.18)]">
              {icon}
            </div>
          </div>

          <h2 className="text-center text-2xl md:text-3xl font-black tracking-wide text-white">
            {title}
          </h2>

          <p className="mt-3 text-center text-sm md:text-base leading-relaxed text-white/65">
            {description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-300/70 font-bold">
                Cost
              </p>
              <p className="mt-1 text-2xl font-black text-yellow-400">
                {cost} <span className="text-lg">🪙</span>
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/70 font-bold">
                Stock
              </p>
              <p className="mt-1 text-2xl font-black text-cyan-300">{inventoryCount}</p>
            </div>
          </div>

          {helperText && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs md:text-sm text-white/70">
              {helperText}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="h-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all active:scale-95"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-white/50 text-white font-black shadow-lg shadow-purple-900/30 transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .animate-in {
          animation-duration: 0.35s;
          animation-fill-mode: both;
        }
        .fade-in { animation-name: fadeIn; }
        .zoom-in-95 { animation-name: zoomIn95; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoomIn95 {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default ArcadePurchaseModal;