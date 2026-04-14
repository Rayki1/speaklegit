import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/api";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { UserContext } from "../context/UserContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const FALLING_ITEMS = [
  // English words (soft pink-white)
  { label: "ELOQUENCE",     left: "3%",  duration: "14s", delay: "-7s",   size: "0.65rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "NOUN",          left: "4%",  duration: "10s", delay: "-3s",   size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "PRONUNCIATION", left: "11%", duration: "18s", delay: "-12s",  size: "0.60rem", color: "rgba(255,210,245,0.45)", isText: true },
  { label: "FLUENCY",       left: "12%", duration: "13s", delay: "-5s",   size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "SERENDIPITY",   left: "20%", duration: "16s", delay: "-9s",   size: "0.65rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "VERB",          left: "20%", duration: "11s", delay: "-1s",   size: "0.75rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "ARTICULATE",    left: "28%", duration: "15s", delay: "-11s",  size: "0.65rem", color: "rgba(255,210,245,0.45)", isText: true },
  { label: "GRAMMAR",       left: "28%", duration: "12s", delay: "-4s",   size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "ADJECTIVE",     left: "37%", duration: "13s", delay: "-8s",   size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "SYNTAX",        left: "49%", duration: "12s", delay: "-6s",   size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "VOCABULARY",    left: "68%", duration: "20s", delay: "-14s",  size: "0.60rem", color: "rgba(255,210,245,0.45)", isText: true },
  { label: "COHERENCE",     left: "77%", duration: "15s", delay: "-2s",   size: "0.65rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "PRONOUN",       left: "77%", duration: "11s", delay: "-7s",   size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "CONJUNCTION",   left: "86%", duration: "14s", delay: "-10s",  size: "0.60rem", color: "rgba(255,210,245,0.45)", isText: true },
  { label: "TENACIOUS",     left: "94%", duration: "16s", delay: "-13s",  size: "0.65rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "SPELLING",      left: "94%", duration: "12s", delay: "-5s",   size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  // Arcade symbols (bright, eye-catching)
  { label: "ᗧ",             left: "7%",  duration: "9s",  delay: "-4s",   size: "1.6rem",  color: "rgba(255,225,60,0.72)",  isText: false },
  { label: "ᗣ",             left: "15%", duration: "11s", delay: "-8s",   size: "1.5rem",  color: "rgba(100,215,255,0.68)", isText: false },
  { label: "★",             left: "25%", duration: "8s",  delay: "-2s",   size: "1.4rem",  color: "rgba(255,210,60,0.70)",  isText: false },
  { label: "♦",             left: "33%", duration: "10s", delay: "-6s",   size: "1.2rem",  color: "rgba(255,130,210,0.70)", isText: false },
  { label: "ᗧ",             left: "42%", duration: "12s", delay: "-9s",   size: "1.6rem",  color: "rgba(255,225,60,0.68)",  isText: false },
  { label: "●",             left: "50%", duration: "7s",  delay: "-3s",   size: "1.1rem",  color: "rgba(255,225,60,0.75)",  isText: false },
  { label: "ᗣ",             left: "55%", duration: "13s", delay: "-7s",   size: "1.5rem",  color: "rgba(255,110,190,0.68)", isText: false },
  { label: "▲",             left: "62%", duration: "9s",  delay: "-5s",   size: "1.3rem",  color: "rgba(170,110,255,0.70)", isText: false },
  { label: "★",             left: "72%", duration: "11s", delay: "-1s",   size: "1.4rem",  color: "rgba(255,210,60,0.70)",  isText: false },
  { label: "●",             left: "80%", duration: "8s",  delay: "-6s",   size: "1.1rem",  color: "rgba(255,225,60,0.75)",  isText: false },
  { label: "ᗧ",             left: "88%", duration: "10s", delay: "-4s",   size: "1.6rem",  color: "rgba(255,225,60,0.68)",  isText: false },
  { label: "♦",             left: "96%", duration: "14s", delay: "-11s",  size: "1.2rem",  color: "rgba(255,130,210,0.70)", isText: false },
];

function Login() {
  const navigate = useNavigate();
  const context = useContext(UserContext);
  if (!context) {
    return null;
  }
  const { login, loginAsGuest, user, logout } = context;
  const googleButtonRef = useRef(null);
  const googleButtonSlotRef = useRef(null);
  const initializedRef = useRef(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [signupToken, setSignupToken] = useState("");
  const [gmail, setGmail] = useState("");
  const [username, setUsername] = useState("");
  const [guestUsername, setGuestUsername] = useState("");
  const [googleButtonWidth, setGoogleButtonWidth] = useState(320);

  useEffect(() => {
    if (user?.isGuest) {
      logout();
    }
  }, []);

  useEffect(() => {
    const updateButtonWidth = () => {
      const slotWidth = googleButtonSlotRef.current?.clientWidth || window.innerWidth || 320;
      // Respect real container width so tablet split layouts never overflow.
      const safeWidth = Math.max(220, Math.min(320, Math.floor(slotWidth)));
      setGoogleButtonWidth(safeWidth);
    };

    updateButtonWidth();
    window.addEventListener("resize", updateButtonWidth);

    const observer = new ResizeObserver(() => {
      updateButtonWidth();
    });
    if (googleButtonSlotRef.current) {
      observer.observe(googleButtonSlotRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateButtonWidth);
      observer.disconnect();
    };
  }, []);

  const resolveUserPayload = async (data) => {
    const token = data?.token;
    const directUser = data?.user || data?.userData || data?.profile || null;
    if (token) {
      try {
        const profileRes = await fetch(apiUrl("/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        if (profileRes.ok && profileData?.user) {
          return profileData.user;
        }
      } catch {
        // fall back to direct payload if /me fails
      }
    }
    if (directUser) {
      return directUser;
    }
    throw new Error("Missing login token.");
  };

  const finishLogin = async (data) => {
    const token = data?.token;
    if (!token) {
      throw new Error("Missing login token.");
    }
    const resolvedUser = await resolveUserPayload(data);
    const gmail = resolvedUser.gmail || resolvedUser.email || "";
    const fallbackName = gmail ? gmail.split("@")[0] : "Guest";
    const displayName = resolvedUser.username || resolvedUser.name || resolvedUser.fullName || fallbackName;
    const normalizedUser = {
      ...resolvedUser,
      gmail,
      username: displayName,
      name: displayName,
      loggedIn: true,
      isGuest: false,
    };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    login(normalizedUser);
    navigate("/difficulty", { replace: true, state: { showWelcome: true } });
  };

  const handleGuestMode = (event) => {
    event.preventDefault();
    const cleanUsername = guestUsername.trim();

    if (!cleanUsername) {
      setError("Please enter a guest username.");
      return;
    }

    setError("");
    loginAsGuest(cleanUsername);
    navigate("/difficulty", { replace: true, state: { showWelcome: true } });
  };

  const handleGoogleCredential = async (response) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/google-login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Google login failed.");
        return;
      }

      if (data.needsUsername) {
        setNeedsUsername(true);
        setSignupToken(data.signupToken);
        setGmail(data.gmail || "");
        return;
      }

      await finishLogin(data);
    } catch (err) {
      console.error("GOOGLE LOGIN FRONTEND ERROR:", err);
      setError("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Missing VITE_GOOGLE_CLIENT_ID in frontend .env file.");
      return;
    }

    if (!window.google?.accounts?.id || !googleButtonRef.current) {
      return;
    }

    if (!initializedRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      initializedRef.current = true;
    }

    googleButtonRef.current.innerHTML = "";

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      width: googleButtonWidth,
      text: "continue_with",
    });
  }, [googleButtonWidth]);

  const handleUsernameSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/google-complete-profile"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupToken, username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save username.");
        return;
      }

      await finishLogin(data);
    } catch (err) {
      console.error("USERNAME SAVE ERROR:", err);
      setError("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="landing-hero login-page-hero relative min-h-[100dvh] overflow-y-auto overflow-x-hidden scrollbar-hide px-3 pb-3 pt-[calc(env(safe-area-inset-top)+5.5rem)] sm:px-4 sm:pt-[calc(env(safe-area-inset-top)+5.9rem)] md:px-5 md:pb-6 md:pt-14 lg:h-[100dvh] lg:overflow-hidden lg:px-6 lg:pt-16 xl:pt-20">
        {/* Soft depth blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 left-0 h-[500px] w-[500px] rounded-full bg-indigo-400/15 blur-[130px]" />
          <div className="absolute top-1/3 right-0 h-[420px] w-[420px] rounded-full bg-pink-400/15 blur-[110px]" />
          <div className="absolute bottom-0 left-1/4 h-[380px] w-[380px] rounded-full bg-purple-300/10 blur-[100px] animate-pulse [animation-delay:1s]" />
        </div>

        {/* Falling words + arcade symbols — fixed overlay behind everything */}
        <div className="login-falling-overlay fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {FALLING_ITEMS.map((item, i) => (
            <span
              key={i}
              className="word-fall login-word-fall"
              style={{
                left: item.left,
                animationDuration: item.duration,
                animationDelay: item.delay,
                fontSize: item.isText ? item.size : item.size,
                color: item.color,
                fontFamily: item.isText
                  ? '"Press Start 2P", "Courier New", monospace'
                  : '"Press Start 2P", monospace',
              }}
            >
              {item.label}
            </span>
          ))}
        </div>

        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl items-stretch py-1 md:py-2 lg:py-3">
          <div className="grid min-h-full w-full gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] xl:gap-6">

            {/* ── LEFT PANEL ── */}
            <section className="relative hidden rounded-[2rem] border border-white/10 bg-black/20 p-4 shadow-[0_32px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:p-5 xl:p-7 lg:flex lg:max-h-full lg:flex-col lg:overflow-y-auto scrollbar-hide">
              {/* Gradient overlays */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
                <div className="absolute -bottom-16 -right-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_55%)]" />
              </div>

              <div className="relative space-y-4 xl:space-y-6">
                {/* Badge + Headline */}
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 xl:mb-4 xl:px-4 xl:py-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-200">Now live — start playing</span>
                  </div>
                  <h1 className="text-[2.45rem] font-black leading-[1.05] tracking-tight text-white lg:text-[2.9rem] xl:text-6xl">
                    Welcome to{" "}
                    <span className="bg-gradient-to-r from-pink-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
                      SPEAKS
                    </span>
                  </h1>
                  <p className="mt-2.5 max-w-lg text-sm leading-6 text-white/65 md:text-[15px] xl:leading-7">
                    Master pronunciation, spelling, and vocabulary through short, game-style sessions — solo or with a friend on the same device.
                  </p>
                </div>

                {/* Three feature cards */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { accent: "from-pink-500/30 to-fuchsia-600/20", border: "border-pink-500/25", dot: "bg-pink-400", dotGlow: "rgba(236,72,153,0.9)", tag: "Saved profile", title: "Google sign-in", body: "Keep coins, rank, and your preferred play path across every session." },
                    { accent: "from-cyan-500/25 to-sky-600/15", border: "border-cyan-500/25", dot: "bg-cyan-400", dotGlow: "rgba(34,211,238,0.9)", tag: "Quick try", title: "Guest mode", body: "Jump in fast with just a username — no sign-up needed." },
                    { accent: "from-violet-500/25 to-purple-600/15", border: "border-violet-500/25", dot: "bg-violet-400", dotGlow: "rgba(167,139,250,0.9)", tag: "Game mix", title: "Solo or versus", body: "Swap between personal practice and competitive two-player rounds." },
                  ].map(({ accent, border, dot, dotGlow, tag, title, body }) => (
                    <div key={tag} className={`group relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${accent} p-3.5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg xl:p-4`}>
                      <div className="mb-3 flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} style={{ boxShadow: `0 0 8px ${dotGlow}` }} />
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/50">{tag}</p>
                      </div>
                      <p className="text-sm font-bold text-white md:text-[15px]">{title}</p>
                      <p className="mt-1.5 text-xs leading-5 text-white/55">{body}</p>
                    </div>
                  ))}
                </div>

                {/* Steps */}
                <div className="rounded-2xl border border-white/8 bg-black/20 p-3.5 md:p-4 xl:p-5">
                  <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.32em] text-white/35">How it works</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { step: "01", color: "from-pink-500 to-fuchsia-600", title: "Choose a mode", body: "Start solo or invite a friend to the same device." },
                      { step: "02", color: "from-violet-500 to-purple-600", title: "Play rounds", body: "Practice speech, spelling, and vocabulary in focused loops." },
                      { step: "03", color: "from-cyan-500 to-sky-600", title: "Track progress", body: "Sign in with Google to save coins, rank, and your results." },
                    ].map(({ step, color, title, body }) => (
                      <div key={step} className="flex gap-3">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-[10px] font-black text-white shadow-lg`}>{step}</div>
                        <div>
                          <p className="text-sm font-bold leading-5 text-white">{title}</p>
                          <p className="mt-1 text-xs leading-5 text-white/50">{body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why sign in strip */}
                <div className="flex flex-wrap gap-2.5 xl:gap-3">
                  {[
                    { icon: "💾", label: "Save progress" },
                    { icon: "🏆", label: "Leaderboard rank" },
                    { icon: "🪙", label: "Earn & keep coins" },
                    { icon: "🎮", label: "Full game access" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/70 backdrop-blur-sm">
                      <span className="text-sm">{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── RIGHT PANEL (form) ── */}
            <section className="mx-auto flex w-full max-w-[460px] min-h-0 flex-col gap-3 pt-0 sm:gap-4 lg:h-full lg:max-h-full lg:overflow-hidden">
              {/* Icon + heading */}
              <div className="text-center lg:text-left">
                <div className="mb-2.5 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-pink-100/90 backdrop-blur-xl lg:justify-start">
                  Login portal
                </div>
                <div className="mb-3 flex justify-center lg:justify-start">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 blur-2xl opacity-80" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600 shadow-[0_8px_32px_rgba(236,72,153,0.5)] sm:h-14 sm:w-14">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white drop-shadow-md sm:h-7 sm:w-7">
                        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h2 className="text-[1.75rem] font-extrabold tracking-tight leading-tight text-white sm:text-[2rem]">Sign in to play</h2>
                <p className="mx-auto mt-1.5 max-w-md text-[0.95rem] leading-6 text-white/65 lg:mx-0">Choose Google to save progress, or enter as a guest for a quick session.</p>
              </div>

              {/* Card */}
              <div className="relative overflow-hidden rounded-[1.7rem] border border-white/15 bg-black/30 p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-5 md:p-6 xl:p-7 lg:min-h-0 lg:flex-1">
                {/* Inner glow */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-fuchsia-500/15 blur-3xl" />
                  <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-violet-500/15 blur-3xl" />
                </div>

                <div className="relative pb-2 md:pb-3 lg:flex lg:min-h-0 lg:flex-col">
            {!needsUsername ? (
              <div className="flex min-h-0 flex-col gap-3.5 sm:gap-5">

                {/* Google sign-in */}
                <div className="min-h-0 space-y-3.5 sm:space-y-5 lg:overflow-y-auto lg:pr-1 scrollbar-hide">
                  <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-3.5 text-center sm:p-5">
                    <p className="mb-1 text-xs font-semibold text-white/80">Recommended</p>
                    <p className="mb-3 text-xs text-white/45 sm:mb-4">
                      Save progress, earn coins, and appear on the leaderboard.
                    </p>
                    <div ref={googleButtonSlotRef} className="mx-auto w-full max-w-[320px]">
                      <div ref={googleButtonRef} className="w-full" />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center gap-2.5 sm:gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35 sm:tracking-[0.35em]">or try guest mode</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  {/* Guest form */}
                  <form onSubmit={handleGuestMode} className="flex min-h-0 flex-col gap-2.5 sm:gap-3">
                    <div className="space-y-2.5 sm:space-y-3">
                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                          Guest Username
                        </label>
                        <input
                          value={guestUsername}
                          onChange={(e) => setGuestUsername(e.target.value)}
                          placeholder="Pick a cool username…"
                          maxLength={20}
                          className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-2.5 text-sm text-white placeholder-white/35 backdrop-blur-sm transition focus:border-pink-400/60 focus:outline-none focus:ring-2 focus:ring-pink-400/25 sm:py-3"
                        />
                      </div>

                      <div className="flex gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/8 px-3.5 py-2.5 sm:py-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300">
                          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs leading-relaxed text-amber-200/75">
                          Guest progress is not saved. Coins and rank are lost when you close the app.
                        </p>
                      </div>
                    </div>

                    <div className="pt-1.5 lg:sticky lg:bottom-0 lg:z-[1] lg:bg-gradient-to-t lg:from-[#2a1f52] lg:via-[#2a1f52]/95 lg:to-transparent lg:pt-2">
                      <button
                        type="submit"
                        className="group w-full overflow-hidden rounded-xl border border-white/15 bg-white/8 py-2.5 text-sm font-semibold tracking-wide text-white/90 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/14 active:scale-[0.98] sm:py-3"
                      >
                        Continue as Guest →
                      </button>
                    </div>
                  </form>

                  {loading && <p className="text-center text-xs text-pink-200 animate-pulse">Connecting...</p>}
                  {error && <p className="text-center text-xs text-red-300">{error}</p>}

                  <p className="text-center text-xs text-white/55">
                    {" "}
                    <Link to="/register" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
                     
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUsernameSubmit} className="space-y-4">
                <div className="mb-2 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-white">One last step</p>
                  <p className="text-xs text-white/45">Choose a username to complete your profile.</p>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Google Account</label>
                  <input
                    type="email"
                    value={gmail}
                    readOnly
                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-white/55 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-white/35 backdrop-blur-sm transition focus:border-pink-400/60 focus:outline-none focus:ring-2 focus:ring-pink-400/25"
                  />
                </div>

                {error && <p className="text-xs text-red-300">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_8px_32px_rgba(236,72,153,0.35)] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(236,72,153,0.55)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? "Saving..." : "Save & Continue →"}
                </button>
              </form>
            )}
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
