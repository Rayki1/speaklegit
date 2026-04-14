import { RouterProvider } from "react-router-dom";
import { Component, useEffect, useRef } from "react";
import router, { prefetchLikelyRoutes } from "./router";
import "./styles/globals.css";
import { UserProvider } from "./context/UserContext";
import bgMusic from "./utils/bgMusic";

class RouterErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Router render failure:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen grid place-items-center bg-[#070b16] text-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-300/30 bg-rose-500/10 p-6 text-center shadow-[0_20px_70px_rgba(244,63,94,0.2)]">
          <p className="text-[10px] uppercase tracking-[0.32em] text-rose-200/85">Navigation Error</p>
          <h1 className="mt-3 text-2xl font-black text-rose-100">Page failed to load</h1>
          <p className="mt-2 text-sm text-rose-100/80">Reload to recover. If this repeats, a route chunk may have failed during network fetch.</p>
          <button
            className="mt-5 h-11 w-full rounded-xl bg-rose-500/85 hover:bg-rose-500 text-white font-bold tracking-[0.12em]"
            onClick={() => window.location.reload()}
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
}

function App() {
  const clickSound = useRef(null);

  useEffect(() => {
    let idleId;
    let idleTimeout;

    const queuePrefetch = (path) => {
      const execute = () => prefetchLikelyRoutes(path);
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(execute, { timeout: 2400 });
        return;
      }
      idleTimeout = window.setTimeout(execute, 700);
    };

    queuePrefetch(window.location.pathname);

    const unsubscribe = router.subscribe?.((state) => {
      queuePrefetch(state.location?.pathname || window.location.pathname);
    });

    // Pre-initialise audio objects so they're ready before first interaction.
    bgMusic.init();
    clickSound.current = new Audio("/mc.m4a");
    clickSound.current.preload = "auto";
    clickSound.current.volume = 1;

    const playSound = () => {
      if (!clickSound.current) return;

      try {
        clickSound.current.pause();
        clickSound.current.currentTime = 0;
        clickSound.current.play().catch(() => {});
      } catch (err) {
        console.log("Sound error:", err);
      }
    };

    const handleClick = (e) => {
      // Start background music on first user gesture (autoplay policy).
      bgMusic.start();

      const element = e.target.closest(
        "button, a, [role='button'], input[type='button'], input[type='submit']"
      );

      if (!element) return;
      if (element.disabled) return;

      playSound();
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      if (unsubscribe) unsubscribe();
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (idleTimeout) window.clearTimeout(idleTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen font-sans text-slate-100">
      <UserProvider>
        <RouterErrorBoundary>
          <RouterProvider router={router} />
        </RouterErrorBoundary>
      </UserProvider>
    </div>
  );
}

export default App;