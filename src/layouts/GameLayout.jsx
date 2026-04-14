import Navbar from "../components/Navbar";

function GameLayout({ title, children, scrollable = false, transparent = false }) {
  return (
    <div className={`flex min-h-[100dvh] h-[100dvh] md:h-screen flex-col overflow-x-hidden ${transparent ? "bg-transparent" : "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"}`}>
      <Navbar />
      <main className={`page-shell flex-1 min-h-0 pt-20 pb-3 md:pb-4 scrollbar-hide ${scrollable ? "overflow-y-auto" : "overflow-hidden"}`}>
        {title && (
          <h1 className="arcade-title mb-2 md:mb-3 text-center text-2xl md:text-3xl lg:text-4xl font-black drop-shadow-[0_0_20px_currentColor] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400">
            {title}
          </h1>
        )}
        {children}
      </main>
    </div>
  );
}

export default GameLayout;
