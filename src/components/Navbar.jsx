import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";

const links = [
  { label: "HOME", to: "/" },
  { label: "ABOUT", to: "/about" },
  { label: "CONTACT", to: "/contact" },
];

function Navbar() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = location.pathname === "/login";
  const isDifficultyPage = location.pathname === "/difficulty";
  const isPlayerMode = ["/oneplayer", "/twoplayer"].includes(location.pathname);
  const isLeaderboardPage = location.pathname === "/leaderboards";
  const isGamePage = location.pathname.startsWith("/game/");
  const isShopPage = location.pathname === "/shop";
  const isLandingPage = location.pathname === "/";
  const isAboutPage = location.pathname === "/about";
  const isContactPage = location.pathname === "/contact";
  const isActionHeavyPage = isDifficultyPage || isPlayerMode || isLeaderboardPage || isGamePage || isShopPage;

  // Determine which nav links to show
  const showNavLinks = !isLoginPage && !isDifficultyPage;
  const showHome = isLandingPage || isAboutPage || isContactPage;
  const showAboutContact = !isLoginPage && !isDifficultyPage && !isPlayerMode && !isGamePage && !isShopPage && !isLeaderboardPage;
  const showPlayNow = !isLoginPage && !isDifficultyPage && !isPlayerMode && !isGamePage && !isShopPage && !isLeaderboardPage;

  // Filter visible links for mobile menu
  const visibleLinks = links.filter((link) => {
    if (link.label === "HOME" && !showHome) return false;
    if (!showAboutContact && (link.label === "ABOUT" || link.label === "CONTACT")) return false;
    return true;
  });

  const closeMobile = () => setMobileOpen(false);
  const coinsLoaded = Number.isFinite(user?.coins);

  const handleLogoClick = () => {
    navigate("/");
    closeMobile();
  };

  const triggerBackNavigation = (target, destination) => {
    void target;
    navigate(destination);
    closeMobile();
  };

  const handleLandingNavClick = (to) => (event) => {
    // If user taps the currently active nav route, treat it as a scroll-to-top action.
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      event.preventDefault();
    }

    closeMobile();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 select-none transition-all duration-300 px-3 sm:px-6 md:px-8 py-3 md:py-4
          ${
            isLoginPage
              ? "bg-transparent"
              : "bg-white/5 backdrop-blur-md border-b border-white/10 shadow-lg"
          }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          {/* LOGO */}
          <div
            onClick={handleLogoClick}
            className="flex min-w-0 items-center gap-2 group sm:gap-3 cursor-pointer"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md sm:h-10 sm:w-10">
              <img
                src="/logo-removebg-preview.png"
                alt="Speaks Logo"
                width="40"
                height="40"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="block h-8 w-auto translate-x-[1px] object-contain transform-gpu transition-transform duration-200 group-hover:scale-110 sm:h-10"
              />
            </span>
            <span className={`text-white font-bold leading-none whitespace-nowrap text-[1.08rem] sm:text-lg ${isActionHeavyPage ? "tracking-[0.08em] sm:tracking-[0.14em]" : "tracking-[0.12em] sm:tracking-[0.16em]"}`}>
              SPEAKS
            </span>
          </div>

          {/* NAV LINKS - Desktop only */}
          {showNavLinks && (
            <nav className="hidden lg:flex items-center gap-8">
              {links.map((link) => {
                if (link.label === "HOME" && !showHome) return null;
                if (!showAboutContact && (link.label === "ABOUT" || link.label === "CONTACT")) return null;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={handleLandingNavClick(link.to)}
                    className={({ isActive }) =>
                      `text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:text-pink-400 ${
                        isActive
                          ? "text-pink-500 underline underline-offset-8"
                          : "text-white/70"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
          )}

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            {/* 3D PLAY NOW BUTTON */}
            {showPlayNow && (
              <button
                onClick={() => navigate("/login")}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-br from-pink-500 via-pink-600 to-purple-700 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-[0_6px_0_0_rgba(219,39,119,0.5),0_10px_20px_rgba(219,39,119,0.4)] hover:shadow-[0_4px_0_0_rgba(219,39,119,0.5),0_8px_16px_rgba(219,39,119,0.5)] hover:translate-y-[2px] active:shadow-[0_2px_0_0_rgba(219,39,119,0.5)] active:translate-y-[4px] transition-all duration-150"
              >
                PLAY NOW
              </button>
            )}

            {/* GAME MODE ACTIONS - Shop and Coin */}
            {(isPlayerMode || isGamePage) && (
              <>
                <button
                  onClick={() => navigate("/leaderboards")}
                  className="p-1.5 sm:p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition btn-3d"
                >
                  🏆
                </button>

                <button
                  onClick={() => navigate("/shop")}
                  className="flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl bg-gradient-to-br from-yellow-400/30 to-amber-500/30 border border-yellow-300/50 text-yellow-100 text-[10px] sm:text-xs font-black tracking-wide btn-3d shadow-[0_5px_0_0_rgba(161,98,7,0.45),0_10px_20px_rgba(234,179,8,0.25)] hover:shadow-[0_3px_0_0_rgba(161,98,7,0.45),0_8px_16px_rgba(234,179,8,0.3)] hover:translate-y-[2px] active:shadow-[0_1px_0_0_rgba(161,98,7,0.45)] active:translate-y-[4px]"
                >
                  <span aria-hidden="true">💰</span>
                  <span className="inline-flex min-w-[2ch] justify-end tabular-nums" aria-live="polite">
                    {coinsLoaded ? (
                      user.coins
                    ) : (
                      <span className="h-4 w-8 rounded bg-yellow-200/30 animate-pulse" aria-hidden="true" />
                    )}
                  </span>
                </button>
              </>
            )}

            {/* BACK BUTTON on Login Page */}
            {isLoginPage && (
              <button
                onClick={() => triggerBackNavigation("login-back", "/")}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-[11px] sm:text-xs tracking-wider shadow-[0_6px_0_#7c1c72,0_10px_20px_rgba(219,39,119,0.35)] hover:shadow-[0_4px_0_#7c1c72,0_8px_16px_rgba(219,39,119,0.4)] hover:translate-y-[2px] hover:from-pink-500 hover:to-purple-500 active:shadow-none active:translate-y-[6px] transition-all duration-150"
              >
                BACK
              </button>
            )}

            {/* BACK / EXIT BUTTON on other pages */}
            {(isDifficultyPage || isPlayerMode || isLeaderboardPage || isGamePage) && (
              <>
                {isDifficultyPage && (
                  <button
                    onClick={() => navigate("/leaderboards")}
                    className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-150 shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]"
                    title="Leaderboard"
                  >
                    🏆
                  </button>
                )}
                <button
                  onClick={() => triggerBackNavigation("game-back", isPlayerMode ? "/difficulty" : isLeaderboardPage || isGamePage ? -1 : "/")}
                  className="px-2.5 sm:px-6 py-1.5 sm:py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-[10px] sm:text-xs tracking-wider shadow-[0_6px_0_#7c1c72,0_10px_20px_rgba(219,39,119,0.35)] hover:shadow-[0_4px_0_#7c1c72,0_8px_16px_rgba(219,39,119,0.4)] hover:translate-y-[2px] hover:from-pink-500 hover:to-purple-500 active:shadow-none active:translate-y-[6px] transition-all duration-150"
                >
                  {isPlayerMode || isLeaderboardPage || isGamePage ? "BACK" : "EXIT"}
                </button>
              </>
            )}

            {/* HAMBURGER BUTTON - Mobile only, shown when nav links exist */}
            {showNavLinks && visibleLinks.length > 0 && (
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
                className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
              >
                <span
                  className={`block h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${
                    mobileOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-white rounded-full mt-1.5 transition-all duration-300 ${
                    mobileOpen ? "opacity-0 scale-x-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-white rounded-full mt-1.5 transition-all duration-300 ${
                    mobileOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {showNavLinks && visibleLinks.length > 0 && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeMobile}
            className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
              mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Slide-down panel */}
          <div
            className={`fixed top-[60px] left-0 right-0 z-40 px-4 lg:hidden transition-all duration-300 ease-out ${
              mobileOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-3 pointer-events-none"
            }`}
          >
            <nav className="rounded-2xl bg-midnight/95 border border-white/15 shadow-2xl overflow-hidden">
              {visibleLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={handleLandingNavClick(link.to)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-4 text-sm font-black uppercase tracking-widest border-b border-white/10 last:border-b-0 transition-colors duration-200 ${
                      isActive
                        ? "text-pink-400 bg-pink-500/10"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <span className="text-pink-400 text-xs">›</span>
                  {link.label}
                </NavLink>
              ))}
              {showPlayNow && (
                <button
                  onClick={() => { navigate("/login"); closeMobile(); }}
                  className="w-full flex items-center gap-3 px-6 py-4 text-sm font-black uppercase tracking-widest text-pink-300 hover:text-pink-200 hover:bg-pink-500/10 active:bg-pink-500/20 transition-colors duration-200"
                >
                  <span>🎮</span>
                  PLAY NOW
                </button>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;