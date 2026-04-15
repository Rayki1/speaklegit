import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { UserContext } from "../context/UserContext";
import { apiUrl } from "../utils/api";

function Register() {
  const navigate = useNavigate();
  const context = useContext(UserContext);
  const login = context?.login;

  const [username, setUsername] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim();
    const cleanGmail = gmail.trim().toLowerCase();

    if (!cleanUsername || !cleanGmail || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(apiUrl("/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          gmail: cleanGmail,
          password,
        }),
      });

      const rawResponse = await res.text();
      let data = {};

      try {
        data = rawResponse ? JSON.parse(rawResponse) : {};
      } catch (parseError) {
        console.error("REGISTER PARSE ERROR:", parseError, rawResponse);
        setError(rawResponse || "The server returned an invalid response.");
        return;
      }

      if (!res.ok) {
        const detailText = String(data.detail || "").trim();
        const messageText = String(data.message || "").trim();
        const rawText = String(rawResponse || "").trim();

        let exactIssue = detailText || messageText || rawText;

        if (!exactIssue || /^registration failed$/i.test(exactIssue)) {
          exactIssue = `Server issue (HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}). Check backend env vars and logs.`;
        }

        setError(exactIssue);
        return;
      }

      if (data?.token && data?.user && login) {
        const normalizedUser = {
          ...data.user,
          gmail: data.user.gmail || cleanGmail,
          username: data.user.username || cleanUsername,
          name: data.user.username || cleanUsername,
          loggedIn: true,
          isGuest: false,
        };

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        login(normalizedUser);
        navigate("/difficulty", { replace: true, state: { showWelcome: true } });
        return;
      }

      navigate("/login", { replace: true });
    } catch (err) {
      console.error("REGISTER FETCH ERROR:", err);
      setError(`Cannot connect to backend server: ${err?.message || "Unknown network error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="landing-hero relative min-h-[100dvh] overflow-hidden px-4 pb-8 pt-[calc(env(safe-area-inset-top)+5.5rem)] sm:px-5 md:px-6 lg:px-8 lg:pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 left-0 h-[500px] w-[500px] rounded-full bg-indigo-400/15 blur-[130px]" />
          <div className="absolute top-1/3 right-0 h-[420px] w-[420px] rounded-full bg-pink-400/15 blur-[110px]" />
          <div className="absolute bottom-0 left-1/4 h-[380px] w-[380px] rounded-full bg-purple-300/10 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-full max-w-xl items-center justify-center py-6">
          <div className="w-full rounded-[2rem] border border-white/10 bg-black/35 p-6 shadow-[0_25px_90px_rgba(6,10,20,0.55)] backdrop-blur-2xl sm:p-7">
            <div className="mb-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-cyan-200/80">Sign Up</p>
              <h1 className="mt-3 text-3xl font-black text-white">Create Account</h1>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Create your username-based account and save it directly to the database.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/60">Username</label>
                <input
                  type="text"
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/60">Gmail</label>
                <input
                  type="email"
                  placeholder="Enter Gmail"
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/60">Password</label>
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/60">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition focus:border-cyan-400/60 focus:bg-white/10"
                />
              </div>

              {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 px-4 py-3.5 text-sm font-black uppercase tracking-[0.24em] text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/65">
              Already have an account? {" "}
              <Link to="/login" className="font-bold text-cyan-300 transition hover:text-cyan-200">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
