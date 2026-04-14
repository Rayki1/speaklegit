import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import LandingLayout from "../layouts/LandingLayout";
import Button from "../components/Button";
import RollingNumber from "../components/RollingNumber";

function Landing() {
  // Core Values scroll animation state
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const scrollSectionRef = useRef(null);

  const phrases = [
    "Empowering Communication",
    "Expert Mentorship", 
    "Lasting Confidence"
  ];

  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = 0;

      if (!scrollSectionRef.current) return;
      
      const section = scrollSectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Only track when section is in view
      if (rect.top <= 0 && rect.bottom > viewportHeight) {
        const scrollProgress = Math.abs(rect.top) / (sectionHeight - viewportHeight);
        const totalPhrases = phrases.length;
        const newPhrase = Math.min(Math.floor(scrollProgress * totalPhrases), totalPhrases - 1);
        setCurrentPhrase((prev) => (prev === newPhrase ? prev : newPhrase));
      }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [phrases.length]);

  // SPEAKS specific vocabulary content
  const vocabularyWords = [
    { term: "Articulation", phonetic: "/ˌärtˌikyəˈlāSH(ə)n/", type: "Pronunciation" },
    { term: "Coherence", phonetic: "/kōˈhirəns/", type: "Fluency" },
    { term: "Nuance", phonetic: "/ˈn(y)ooäns/", type: "Vocabulary" },
    { term: "Intonation", phonetic: "/ˌintəˈnāSH(ə)n/", type: "Speaking" },
    { term: "Synthesize", phonetic: "/ˈsinTHəˌsīz/", type: "Writing" },
    { term: "Eloquence", phonetic: "/ˈeləkwəns/", type: "Mastery" },
  ];

  return (
    <LandingLayout>
      <div className="section-stack pb-12 md:pb-16 lg:pb-20">
        {/* Hero Section */}
        <section className="fade-in relative flex min-h-[68vh] items-center overflow-hidden rounded-[2rem] px-5 py-10 md:min-h-[70vh] md:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="mesh-overlay" />
            <div className="absolute left-[-8%] top-[6%] h-52 w-52 rounded-full bg-cyan-300/15 blur-3xl" />
            <div className="absolute bottom-[-8%] right-[4%] h-64 w-64 rounded-full bg-pink-400/20 blur-3xl" />
          </div>
          <div className="hero-grid relative z-10 w-full">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-pink-200/90 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
                Master English with confidence
              </div>
              <div className="space-y-4">
                <h1 className="arcade-title text-5xl leading-[1.08] md:text-6xl lg:text-7xl xl:text-8xl">
                  SPEAKS
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/88 md:text-lg lg:text-xl lg:leading-8">
                  Train pronunciation, spelling, and vocabulary inside a game space built to make practice feel fast, clear, and rewarding.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 lg:justify-start">
                <Link to="/login">
                  <Button className="px-8 py-3 text-base shadow-[0_14px_30px_rgba(255,255,255,0.18)]">Start Playing</Button>
                </Link>
                <Link to="/about">
                  <Button variant="secondary" className="px-8 py-3 text-base">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="aurora-panel rounded-2xl px-4 py-4 text-left">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-cyan-200/70">Practice Flow</p>
                  <p className="mt-2 text-lg font-bold text-white">Voice, words, and quick reaction rounds</p>
                </div>
                <div className="aurora-panel rounded-2xl px-4 py-4 text-left">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-pink-200/70">Session Style</p>
                  <p className="mt-2 text-lg font-bold text-white">Short bursts that stay easy to repeat daily</p>
                </div>
                <div className="aurora-panel rounded-2xl px-4 py-4 text-left">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-violet-200/70">Outcome</p>
                  <p className="mt-2 text-lg font-bold text-white">Better speech confidence with visible progress</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="floating-drift aurora-panel relative overflow-hidden rounded-[2rem] p-5 md:p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_32%)]" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Live track</p>
                      <p className="mt-1 text-lg font-bold text-white">Communication Sprint</p>
                    </div>
                    <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200">Ready</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="signal-card rounded-2xl p-4">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-pink-200/65">Pronunciation</p>
                      <p className="mt-3 text-3xl font-black text-white">92%</p>
                      <p className="mt-2 text-sm text-white/65">Speech clarity score after guided repetition.</p>
                    </div>
                    <div className="signal-card rounded-2xl p-4">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-200/65">Streak</p>
                      <p className="mt-3 text-3xl font-black text-white">14 days</p>
                      <p className="mt-2 text-sm text-white/65">Small sessions designed to keep momentum stable.</p>
                    </div>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/30 p-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.26em] text-white/45">
                      <span>Learning path</span>
                      <span>3 steps</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        "Warm up with guided speech prompts",
                        "Lock spelling and vocabulary under time pressure",
                        "Repeat challenge sets and climb the leaderboard",
                      ].map((step, index) => (
                        <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 text-xs font-black text-white">
                            0{index + 1}
                          </div>
                          <p className="text-sm leading-6 text-white/80">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SPEAKS DATA MARQUEE */}
        <section className="relative overflow-hidden">
          <div className="mb-12 md:mb-14 lg:mb-16 text-center space-y-3 md:space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Expert-crafted lessons for effortless communication
            </h2>
            <p className="mx-auto max-w-3xl text-base text-white/55 md:text-lg">Every round focuses on one clear communication skill, so the app feels playful without losing structure.</p>
          </div>

          <div className="mask-edges flex overflow-hidden py-10">
            <div className="animate-marquee flex gap-6 whitespace-nowrap">
              {[...vocabularyWords, ...vocabularyWords].map((word, index) => (
                <div 
                  key={index} 
                  className="w-72 flex-shrink-0 rounded-3xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-xl transition-all hover:border-pink-500/30 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400">
                      {word.type}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{word.term}</h3>
                  <p className="font-mono text-sm text-white/30 italic">{word.phonetic}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 md:mt-16 lg:mt-20 grid grid-cols-1 gap-8 md:gap-10 lg:gap-12 md:grid-cols-3">
            <div className="group flex flex-col items-center p-8 transition-all hover:bg-white/[0.02] rounded-3xl">
              <div className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter text-white">
                <RollingNumber end={1250} />
                <span className="text-pink-500 text-4xl md:text-6xl ml-1">+</span>
              </div>
              <p className="mt-4 text-center">
                <span className="block text-xl font-bold text-white/90">Curated Lessons</span>
                <span className="text-sm font-medium uppercase tracking-[0.3em] text-white/30">From A1 to C2 Levels</span>
              </p>
            </div>

            <div className="group flex flex-col items-center p-8 transition-all hover:bg-white/[0.02] rounded-3xl">
              <div className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter text-white">
                <RollingNumber end={84200} />
                <span className="text-purple-500 text-4xl md:text-6xl ml-1">+</span>
              </div>
              <p className="mt-4 text-center">
                <span className="block text-xl font-bold text-white/90">Voice Checkups</span>
                <span className="text-sm font-medium uppercase tracking-[0.3em] text-white/30">Real-time Feedback</span>
              </p>
            </div>

            <div className="group flex flex-col items-center p-8 transition-all hover:bg-white/[0.02] rounded-3xl">
              <div className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter text-white">
                <RollingNumber end={15000} />
                <span className="text-blue-500 text-4xl md:text-6xl ml-1">+</span>
              </div>
              <p className="mt-4 text-center">
                <span className="block text-xl font-bold text-white/90">Flow Sequences</span>
                <span className="text-sm font-medium uppercase tracking-[0.3em] text-white/30">Engaging Game Paths</span>
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose SPEAKS + Core Values + Features */}
        <section className="space-y-10 md:space-y-12">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose SPEAKS?</h2>
            <p className="mx-auto max-w-2xl text-white/70">
              Build your English skills with our innovative learning approach
            </p>
          </div>

          <div 
            ref={scrollSectionRef}
            className="relative h-[300vh]"
          >
            <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
              <div className="relative h-full w-full max-w-6xl">
                {phrases.map((phrase, index) => (
                  <div
                    key={index}
                    className="absolute inset-0 flex items-center justify-center transition-all duration-700"
                    style={{
                      opacity: currentPhrase === index ? 1 : 0,
                      transform: currentPhrase === index 
                        ? "translateY(0)" 
                        : currentPhrase > index 
                          ? "translateY(-100%)" 
                          : "translateY(100%)",
                    }}
                  >
                    <h2 className="text-center text-5xl font-black leading-tight tracking-tight text-white md:text-7xl lg:text-8xl">
                      {phrase}
                    </h2>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 perspective-1000">
            <div className="card-3d group relative rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 p-8 backdrop-blur-sm transition-all duration-500 hover:border-pink-500/50" style={{ animationDelay: '0ms' }}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">🎤</div>
                <h3 className="text-2xl font-bold text-white mb-3">Pronunciation Practice</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Use voice recognition technology to practice speaking English words correctly with instant feedback.
                </p>
              </div>
            </div>
            
            <div className="card-3d group relative rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-8 backdrop-blur-sm transition-all duration-500 hover:border-blue-500/50" style={{ animationDelay: '100ms' }}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">📝</div>
                <h3 className="text-2xl font-bold text-white mb-3">Spelling Challenges</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Improve your spelling skills by unscrambling letters and forming correct words in fun puzzles.
                </p>
              </div>
            </div>
            
            <div className="card-3d group relative rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-8 backdrop-blur-sm transition-all duration-500 hover:border-purple-500/50" style={{ animationDelay: '200ms' }}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">📚</div>
                <h3 className="text-2xl font-bold text-white mb-3">Vocabulary Builder</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Expand your vocabulary with image-based clues and contextual learning exercises.
                </p>
              </div>
            </div>
            
            <div className="card-3d group relative rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-8 backdrop-blur-sm transition-all duration-500 hover:border-amber-500/50" style={{ animationDelay: '300ms' }}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">🏆</div>
                <h3 className="text-2xl font-bold text-white mb-3">Gamified Learning</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Earn points, unlock badges, and maintain streaks to stay motivated on your learning journey.
                </p>
              </div>
            </div>
            
            <div className="card-3d group relative rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-8 backdrop-blur-sm transition-all duration-500 hover:border-green-500/50" style={{ animationDelay: '400ms' }}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">📊</div>
                <h3 className="text-2xl font-bold text-white mb-3">Track Progress</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Monitor your improvement with detailed statistics on words practiced and levels completed.
                </p>
              </div>
            </div>
            
            <div className="card-3d group relative rounded-3xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 p-8 backdrop-blur-sm transition-all duration-500 hover:border-indigo-500/50" style={{ animationDelay: '500ms' }}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">🌍</div>
                <h3 className="text-2xl font-bold text-white mb-3">English-Only Mode</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Immerse yourself completely with simple instructions, clear prompts, and friendly feedback all in English.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="glow-panel relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950/55 via-violet-950/45 to-pink-950/55 p-6 text-center md:p-8 lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.2),transparent_35%)]" />
          <div className="relative mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
              Start with one session
            </div>
            <h2 className="text-3xl font-bold md:text-4xl">Ready to Start Your Journey?</h2>
            <p className="text-base md:text-lg text-white/80">
              Choose guest mode for a quick try or sign in with Google to keep your progress, coins, and leaderboard score.
            </p>
            <div className="grid gap-3 text-left sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">Fast entry</p>
                <p className="mt-2 text-sm font-semibold text-white/85">Start in seconds with guest mode.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">Saved progress</p>
                <p className="mt-2 text-sm font-semibold text-white/85">Use Google login to keep long-term progress.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">Competition</p>
                <p className="mt-2 text-sm font-semibold text-white/85">Track score growth on the leaderboard.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/login">
                <Button className="px-8 py-3 text-base">Get Started Free</Button>
              </Link>
              <Link to="/leaderboards">
                <Button variant="secondary" className="px-8 py-3 text-base">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
}

export default Landing;