import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { UserContext } from "../context/UserContext";
import { apiUrl } from "../utils/api";

const FALLING_ITEMS = [
  { label: "ELOQUENCE", left: "3%", duration: "14s", delay: "-7s", size: "0.65rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "NOUN", left: "4%", duration: "10s", delay: "-3s", size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "PRONUNCIATION", left: "11%", duration: "18s", delay: "-12s", size: "0.60rem", color: "rgba(255,210,245,0.45)", isText: true },
  { label: "FLUENCY", left: "12%", duration: "13s", delay: "-5s", size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "SERENDIPITY", left: "20%", duration: "16s", delay: "-9s", size: "0.65rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "VERB", left: "20%", duration: "11s", delay: "-1s", size: "0.75rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "ARTICULATE", left: "28%", duration: "15s", delay: "-11s", size: "0.65rem", color: "rgba(255,210,245,0.45)", isText: true },
  { label: "GRAMMAR", left: "28%", duration: "12s", delay: "-4s", size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "ADJECTIVE", left: "37%", duration: "13s", delay: "-8s", size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "SYNTAX", left: "49%", duration: "12s", delay: "-6s", size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "VOCABULARY", left: "68%", duration: "20s", delay: "-14s", size: "0.60rem", color: "rgba(255,210,245,0.45)", isText: true },
  { label: "COHERENCE", left: "77%", duration: "15s", delay: "-2s", size: "0.65rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "PRONOUN", left: "77%", duration: "11s", delay: "-7s", size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "CONJUNCTION", left: "86%", duration: "14s", delay: "-10s", size: "0.60rem", color: "rgba(255,210,245,0.45)", isText: true },
  { label: "TENACIOUS", left: "94%", duration: "16s", delay: "-13s", size: "0.65rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "SPELLING", left: "94%", duration: "12s", delay: "-5s", size: "0.70rem", color: "rgba(255,210,245,0.50)", isText: true },
  { label: "ᗧ", left: "7%", duration: "9s", delay: "-4s", size: "1.6rem", color: "rgba(255,225,60,0.72)", isText: false },
  { label: "ᗣ", left: "15%", duration: "11s", delay: "-8s", size: "1.5rem", color: "rgba(100,215,255,0.68)", isText: false },
  { label: "★", left: "25%", duration: "8s", delay: "-2s", size: "1.4rem", color: "rgba(255,210,60,0.70)", isText: false },
  { label: "♦", left: "33%", duration: "10s", delay: "-6s", size: "1.2rem", color: "rgba(255,130,210,0.70)", isText: false },
  { label: "ᗧ", left: "42%", duration: "12s", delay: "-9s", size: "1.6rem", color: "rgba(255,225,60,0.68)", isText: false },
  { label: "●", left: "50%", duration: "7s", delay: "-3s", size: "1.1rem", color: "rgba(255,225,60,0.75)", isText: false },
  { label: "ᗣ", left: "55%", duration: "13s", delay: "-7s", size: "1.5rem", color: "rgba(255,110,190,0.68)", isText: false },
  { label: "▲", left: "62%", duration: "9s", delay: "-5s", size: "1.3rem", color: "rgba(170,110,255,0.70)", isText: false },
  { label: "★", left: "72%", duration: "11s", delay: "-1s", size: "1.4rem", color: "rgba(255,210,60,0.70)", isText: false },
  { label: "●", left: "80%", duration: "8s", delay: "-6s", size: "1.1rem", color: "rgba(255,225,60,0.75)", isText: false },
  { label: "ᗧ", left: "88%", duration: "10s", delay: "-4s", size: "1.6rem", color: "rgba(255,225,60,0.68)", isText: false },
  { label: "♦", left: "96%", duration: "14s", delay: "-11s", size: "1.2rem", color: "rgba(255,130,210,0.70)", isText: false },
];

function Login() {
  const navigate = useNavigate();
  const context = useContext(UserContext);

  if (!context) return null;

  const { login, loginAsGuest, user, logout } = context;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [guestUsername, setGuestUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.isGuest) {
      logout();
    }
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
        // fallback to direct payload
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
    const fallbackName = gmail ? gmail.split("@")[0] : "Player";
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

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(apiUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      await finishLogin(data);
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Cannot connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = (event) => {
    event.preventDefault();
    const cleanGuestUsername = guestUsername.trim();

    if (!cleanGuestUsername) {
      setError("Please enter a guest username.");
      return;
    }

    setError("");
    loginAsGuest(cleanGuestUsername);
    navigate("/difficulty", { replace: true, state: { showWelcome: true } });
  };

  return (
    <>
      <Navbar />
      <div className="landing-hero login-page-hero relative min-h-[100dvh] overflow-y-auto overflow-x-hidden scrollbar-hide px-3 pb-3 pt-[calc(env(safe-area-inset-top)+5.5rem)] sm:px-4 sm:pt-[calc(env(safe-area-inset-top)+5.9rem)] md:px-5 md:pb-6 md:pt-14 lg:h-[100dvh] lg:overflow-hidden lg:px-6 lg:pt-16 xl:pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 left-0 h-[500px] w-[500px] rounded-full bg-indigo-400/15 blur-[130px]" />
          <div className="absolute top-1/3 right-0 h-[420px] w-[420px] rounded-full bg-pink-400/15 blur-[110px]" />
          <div className="absolute bottom-0 left-1/4 h-[380px] w-[380px] rounded-full bg-purple-300/10 blur-[100px] animate-pulse [animation-delay:1s]" />
        </div>

        <div className="login-falling-overlay fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {FALLING_ITEMS.map((item, i) => (
            <span
              key={i}
              className="word-fall login-word-fall"
              style={{
                left: item.left,
                animationDuration: item.duration,
                animationDelay: item.delay,
                fontSize: item.size,
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
            <section className="relative hidden rounded-[2rem] border border-white/10 bg-black/20 p-4 shadow-[0_32px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:p-5 xl:p-7 lg:flex lg:max-h-full lg:flex-col lg:overflow-y-auto scrollbar-hide">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
                <div className="absolute -bottom-16 -right-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_55%)]" />
              </div>

              <div className="relative space-y-4 xl:space-y-6">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-1.5 xl:mb-4 xl:px-4 xl:py-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-200">Now live — start playing</span>
                  </div>
                  <h1 className="text-[2.45rem] font-black leading-[1.05] tracking-tight text-white lg:text-[2.9rem] xl:text-6xl">
                    Welcome to <span className="bg-gradient-to-r from-pink-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">SPEAKS</span>
                  </h1>
                  <p className="mt-2.5 max-w-lg text-sm leading-6 text-white/65 md:text-[15px] xl:leading-7">
                    Log in with your username and password, keep your progress, and continue your learning journey anytime.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { accent: "from-pink-500/30 to-fuchsia-600/20", border: "border-pink-500/25", dot: "bg-pink-400", tag: "Account login", title: "Username access", body: "Use your saved username and password to continue your account progress." },
                    { accent: "from-cyan-500/25 to-sky-600/15", border: "border-cyan-500/25", dot: "bg-cyan-400", tag: "Create one", title: "Quick sign up", body: "No account yet? Create one from the sign up page and save it directly to the database." },
                    { accent: "from-violet-500/25 to-purple-600/15", border: "border-violet-500/25", dot: "bg-violet-400", tag: "Quick try", title: "Guest mode", body: "You can still try the game using guest mode without creating an account." },
                  ].map(({ accent, border, dot, tag, title, body }) => (
                    <article key={title} className={`rounded-3xl border ${border} bg-gradient-to-br ${accent} p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)]`}>
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">{tag}</p>
                      </div>
                      <h3 className="mt-3 text-base font-black text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/70">{body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="relative flex items-center justify-center">
              <div className="w-full rounded-[2rem] border border-white/10 bg-black/35 p-5 shadow-[0_25px_90px_rgba(6,10,20,0.55)] backdrop-blur-2xl sm:p-6 xl:p-7">
                <div className="mb-6 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-cyan-200/80">Login Account</p>
                  <h2 className="mt-3 text-3xl font-black text-white">Welcome back</h2>
                  <p className="mt-2 text-sm leading-6 text-white/65">Enter your username and password to access your account.</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/60">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/60">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/10"
                    />
                  </div>

                  {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 px-4 py-3.5 text-sm font-black uppercase tracking-[0.24em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <form onSubmit={handleGuestMode} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/60">Guest Username</label>
                    <input
                      type="text"
                      value={guestUsername}
                      onChange={(e) => setGuestUsername(e.target.value)}
                      placeholder="Try as guest"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition focus:border-fuchsia-400/60 focus:bg-white/10"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-3.5 text-sm font-black uppercase tracking-[0.24em] text-fuchsia-100 transition hover:bg-fuchsia-500/20"
                  >
                    Continue as Guest
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-white/65">
                  Don&apos;t have an account? {" "}
                  <Link to="/register" className="font-bold text-cyan-300 transition hover:text-cyan-200">
                    Sign Up
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
