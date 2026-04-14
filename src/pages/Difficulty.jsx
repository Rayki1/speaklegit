import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import GameLayout from "../layouts/GameLayout";
import Button from "../components/Button";
import { UserContext } from "../context/UserContext";

function Difficulty() {
  const userContext = useContext(UserContext);
  const user = userContext?.user;
  const location = useLocation();
  const profileLetter = (user?.username || user?.gmail || "U").charAt(0).toUpperCase();

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (location.state?.showWelcome) {
      setShowWelcome(true);
      // Delay clearing so the popup has time to render first
      setTimeout(() => window.history.replaceState({}, document.title), 500);
    }
  }, []);

  return (
    <GameLayout scrollable>

      <div className="relative mx-auto max-w-4xl px-3 py-3 sm:px-4 md:py-4">

        {/* USER HEADER */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg md:mb-5">
          {/* top accent bar */}
          <div className="h-0.5 w-full bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-500" />
          <div className="grid grid-cols-3 items-center gap-3 px-5 py-4 md:px-6">

            {/* LEFT */}
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-pink-400/90">Signed in as</p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <p className="text-xs font-medium text-white/60">
                  {user?.isGuest ? "Guest Mode" : user?.gmail || "No Gmail linked"}
                </p>
              </div>
            </div>

            {/* CENTER */}
            <div className="text-center">
              <h2 className="text-xl font-black tracking-tight text-white drop-shadow-[0_0_16px_rgba(236,72,153,0.6)] md:text-2xl">
                {user?.username || "Guest"}
              </h2>
              {user?.isGuest && (
                <span className="mt-0.5 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Guest
                </span>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex justify-end">
              {user?.profilePicture ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-pink-500/40 blur-md" />
                  <img
                    src={user.profilePicture}
                    alt={user.username || "Profile"}
                    className="relative h-12 w-12 rounded-full border-2 border-pink-400/70 object-cover shadow-[0_0_20px_rgba(236,72,153,0.5)] md:h-14 md:w-14"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 blur-lg opacity-60" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-pink-400/50 bg-gradient-to-br from-pink-500 to-purple-600 text-base font-black text-white shadow-[0_0_20px_rgba(236,72,153,0.5)] md:h-14 md:w-14 md:text-lg">
                    {profileLetter}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TITLE */}
        <div className="mb-5 text-center md:mb-6">
          <h1 className="arcade-title mb-2 text-3xl tracking-[0.08em] text-white drop-shadow-[0_0_30px_rgba(236,72,153,0.5)] md:text-4xl lg:text-5xl">
            CHOOSE YOUR MODE
          </h1>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
          <p className="mt-3 text-sm font-medium italic tracking-widest text-white/60 md:text-base">
            ✦ Play solo or team up with a friend ✦
          </p>
        </div>

        {/* GAME MODE CARDS - 3D tilt */}
        <div className="grid gap-5 md:grid-cols-2 md:gap-6">

          {/* ONE PLAYER */}
          <div className="mode-card-3d group relative overflow-hidden rounded-2xl border border-pink-500/30 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(236,72,153,0.2)] transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-fuchsia-400 to-purple-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

            <div className="relative space-y-4 p-5 md:space-y-5 md:p-7">
              <div className="text-center">
                <div className="mb-4 relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 scale-150 rounded-full bg-pink-500/30 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-pink-400/30 bg-gradient-to-br from-pink-500/30 to-purple-600/20 shadow-[0_0_25px_rgba(236,72,153,0.3)] md:h-24 md:w-24">
                    <span className="text-4xl md:text-5xl drop-shadow-lg">👤</span>
                  </div>
                </div>

                <h3 className="arcade-title mb-2 text-2xl font-black uppercase text-white group-hover:text-pink-200 transition-colors duration-300 md:text-3xl">
                  One Player
                </h3>

                <p className="mx-auto max-w-xs text-sm font-light leading-relaxed text-white/70 md:text-base">
                  Practice at your own pace. Perfect your{" "}
                  <span className="font-semibold text-pink-300">pronunciation, spelling,</span>{" "}
                  and <span className="font-semibold text-pink-300">vocabulary</span> skills solo.
                </p>
              </div>

              {/* feature pills */}
              <div className="flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-pink-400/30 bg-pink-400/10 px-3 py-1 text-xs font-medium text-pink-300">🎤 Pronunciation</span>
                <span className="rounded-full border border-pink-400/30 bg-pink-400/10 px-3 py-1 text-xs font-medium text-pink-300">✏️ Spelling</span>
                <span className="rounded-full border border-pink-400/30 bg-pink-400/10 px-3 py-1 text-xs font-medium text-pink-300">📖 Vocabulary</span>
              </div>

              <Link to="/oneplayer" className="block">
                <Button className="btn-3d w-full bg-gradient-to-r from-pink-600 to-purple-600 py-3.5 text-sm shadow-[0_6px_0_#7c1c72] hover:shadow-[0_4px_0_#7c1c72] hover:translate-y-[2px] hover:from-pink-500 hover:to-purple-500 active:shadow-none active:translate-y-[6px] md:py-4 md:text-base">
                  START JOURNEY
                </Button>
              </Link>
            </div>
          </div>

          {/* TWO PLAYER */}
          <div className="mode-card-3d group relative overflow-hidden rounded-2xl border border-purple-500/30 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(168,85,247,0.2)] transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-400 to-indigo-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

            <div className="relative space-y-4 p-5 md:space-y-5 md:p-7">
              <div className="text-center">
                <div className="mb-4 relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 scale-150 rounded-full bg-purple-500/30 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-purple-400/30 bg-gradient-to-br from-purple-500/30 to-indigo-600/20 shadow-[0_0_25px_rgba(168,85,247,0.3)] md:h-24 md:w-24">
                    <span className="text-4xl md:text-5xl drop-shadow-lg">👥</span>
                  </div>
                </div>

                <h3 className="arcade-title mb-2 text-2xl font-black uppercase text-white group-hover:text-purple-200 transition-colors duration-300 md:text-3xl">
                  Two Player
                </h3>

                <p className="mx-auto max-w-xs text-sm font-light leading-relaxed text-white/70 md:text-base">
                  Play{" "}
                  <span className="font-semibold text-purple-300">6 interactive games</span>{" "}
                  on one device: Password Describer, Grammar Sunk, Half-Story, and Stop Categories.
                </p>
              </div>

              {/* feature pills */}
              <div className="flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs font-medium text-purple-300">🕵️ Password</span>
                <span className="rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs font-medium text-purple-300">⚓ Grammar</span>
                <span className="rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs font-medium text-purple-300">🛑 Stop Game</span>
              </div>

              <Link to="/twoplayer" className="block">
                <Button className="btn-3d w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm shadow-[0_6px_0_#3730a3] hover:shadow-[0_4px_0_#3730a3] hover:translate-y-[2px] hover:from-purple-500 hover:to-indigo-500 active:shadow-none active:translate-y-[6px] md:py-4 md:text-base">
                  TWO PLAYER GAMES
                </Button>
              </Link>
            </div>
          </div>

        </div>


      </div>

      {/* Welcome Popup */}
      {showWelcome && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md cursor-pointer"
          onClick={() => setShowWelcome(false)}
        >
          <div
            className="relative mx-4 max-w-sm w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl p-10 shadow-2xl animate-[scale-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 rounded-3xl" style={{
              background: `radial-gradient(ellipse at top, rgba(236,72,153,0.25), transparent 70%), radial-gradient(ellipse at bottom, rgba(139,92,246,0.25), transparent 70%)`
            }} />

            <div className="relative text-center">
              <div className="mb-5 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-500 blur-xl opacity-60 animate-pulse" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-500 shadow-2xl shadow-pink-500/50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-white">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </div>
                </div>
              </div>

              <h2 className="mb-1 text-3xl font-extrabold text-white">Welcome,</h2>
              <p className="text-2xl font-bold text-pink-300 mb-4">{user?.username || "Guest"}!</p>
              <p className="text-sm text-white/60 leading-relaxed">Get ready to enhance your English skills!</p>

              <button
                onClick={() => setShowWelcome(false)}
                className="mt-7 px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-sm tracking-wider shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                LET'S GO!
              </button>
              <p className="mt-4 text-xs text-white/30">Tap anywhere to continue</p>
            </div>
          </div>
        </div>
      )}
    </GameLayout>
  );
}

export default Difficulty;