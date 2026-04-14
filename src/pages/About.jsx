import LandingLayout from "../layouts/LandingLayout";

function About() {
  return (
    <LandingLayout>
      <div className="mx-auto max-w-6xl px-4 py-16 space-y-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%] min-h-[3.5rem] md:min-h-[5.5rem]">
            About SPEAKS
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-white/80 leading-relaxed min-h-[3.5rem]">
            Your journey to English fluency starts here. Master pronunciation, spelling, and vocabulary through immersive gameplay.
          </p>
        </div>
        
        {/* Mission Card - Large Featured */}
        <div className="relative group about-fade-up about-delay-1">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-shimmer bg-[length:200%_100%]"></div>
          <div className="relative bg-gradient-to-br from-purple-950/60 via-[#100c28] to-slate-950/95 border border-purple-500/25 rounded-3xl p-8 md:p-12 transition-all duration-500 transform-gpu hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(139,92,246,0.25)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white min-h-[2.5rem]">Our Mission</h2>
            </div>
            <p className="text-lg text-white/80 leading-relaxed min-h-[9rem]">
              SPEAKS is a fun and engaging way to build pronunciation, spelling, and vocabulary skills. 
              Every task is presented in English, with clear prompts and friendly feedback to help you 
              learn naturally and confidently. We believe language learning should be interactive, 
              enjoyable, and accessible to everyone.
            </p>
          </div>
        </div>

        {/* Core Features Grid */}
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white">What Makes Us Different</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Interactive Learning Card */}
            <div className="about-feature-card about-delay-1 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950/75 to-slate-900/92 border border-blue-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="about-card-sheen"></div>
              <div className="relative p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500 about-float-icon">
                  <span className="text-2xl">🎮</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Interactive Learning</h3>
                <p className="text-white/70 leading-relaxed">
                  Practice with voice recognition, spelling challenges, and vocabulary exercises designed 
                  to make learning feel like a game. Every interaction is instant and rewarding.
                </p>
              </div>
            </div>

            {/* Progress Tracking Card */}
            <div className="about-feature-card about-delay-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/75 to-slate-900/92 border border-emerald-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="about-card-sheen"></div>
              <div className="relative p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500 about-float-icon">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Track Your Growth</h3>
                <p className="text-white/70 leading-relaxed">
                  Monitor your progress with detailed statistics, earn badges, and celebrate your 
                  achievements along the way. See your improvement in real-time.
                </p>
              </div>
            </div>

            {/* Gamification Card */}
            <div className="about-feature-card about-delay-3 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/75 to-stone-900/92 border border-amber-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="about-card-sheen"></div>
              <div className="relative p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500 about-float-icon">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Gamified Experience</h3>
                <p className="text-white/70 leading-relaxed">
                  Earn points, unlock achievements, and climb leaderboards. Stay motivated with 
                  daily streaks, challenges, and rewards that make learning addictive.
                </p>
              </div>
            </div>

            {/* Voice Recognition Card */}
            <div className="about-feature-card about-delay-4 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/75 to-slate-900/92 border border-purple-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="about-card-sheen"></div>
              <div className="relative p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500 about-float-icon">
                  <span className="text-2xl">�</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Smart Voice Tech</h3>
                <p className="text-white/70 leading-relaxed">
                  Advanced speech recognition provides instant feedback on your pronunciation. 
                  Practice speaking with confidence and get real-time corrections.
                </p>
              </div>
            </div>

            {/* Adaptive Learning Card */}
            <div className="about-feature-card about-delay-5 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/75 to-slate-900/92 border border-indigo-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="about-card-sheen"></div>
              <div className="relative p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500 about-float-icon">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Adaptive Difficulty</h3>
                <p className="text-white/70 leading-relaxed">
                  Choose from easy, medium, or hard difficulty levels. The game adapts to your 
                  skill level, ensuring you're always challenged but never overwhelmed.
                </p>
              </div>
            </div>

            {/* Community Card */}
            <div className="about-feature-card about-delay-6 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/75 to-slate-900/92 border border-rose-500/25">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-pink-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="about-card-sheen"></div>
              <div className="relative p-8 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500 about-float-icon">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Global Community</h3>
                <p className="text-white/70 leading-relaxed">
                  Join thousands of learners worldwide. Compete on leaderboards, share achievements, 
                  and learn together in a supportive environment.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Learning Approach Section */}
        <div className="relative group about-fade-up about-delay-2">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-shimmer bg-[length:200%_100%]"></div>
          <div className="relative bg-gradient-to-br from-cyan-950/50 via-[#0a1020] to-slate-950/95 border border-cyan-500/20 rounded-3xl p-10 md:p-12 space-y-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(6,182,212,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white">Our Approach</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-xl font-bold text-purple-400">Immersive English</h4>
                <p className="text-white/70 leading-relaxed">
                  Every instruction, prompt, and feedback is in English. This immersion approach 
                  helps you think in English naturally, accelerating your learning journey.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-xl font-bold text-pink-400">Instant Feedback</h4>
                <p className="text-white/70 leading-relaxed">
                  Get immediate corrections and explanations. Our system recognizes patterns in 
                  your mistakes and provides targeted practice for improvement.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-xl font-bold text-cyan-400">Fun First</h4>
                <p className="text-white/70 leading-relaxed">
                  Learning should never be boring. We've designed every aspect to be engaging, 
                  colorful, and rewarding so you'll want to practice every day.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-xl font-bold text-emerald-400">Proven Results</h4>
                <p className="text-white/70 leading-relaxed">
                  Our users report significant improvements in pronunciation clarity, spelling 
                  accuracy, and vocabulary retention within just a few weeks of practice.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="about-feature-card about-delay-1 text-center p-8 space-y-2 rounded-3xl bg-gradient-to-br from-purple-950/70 to-slate-900/90 border border-purple-500/25">
            <div className="about-card-sheen"></div>
            <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              1,250+
            </div>
            <p className="text-white/70 font-semibold">Curated Lessons</p>
          </div>
          <div className="about-feature-card about-delay-2 text-center p-8 space-y-2 rounded-3xl bg-gradient-to-br from-cyan-950/70 to-slate-900/90 border border-cyan-500/25">
            <div className="about-card-sheen"></div>
            <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              84,200+
            </div>
            <p className="text-white/70 font-semibold">Voice Checkups</p>
          </div>
          <div className="about-feature-card about-delay-3 text-center p-8 space-y-2 rounded-3xl bg-gradient-to-br from-emerald-950/70 to-slate-900/90 border border-emerald-500/25">
            <div className="about-card-sheen"></div>
            <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              15,000+
            </div>
            <p className="text-white/70 font-semibold">Flow Sequences</p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="relative group about-fade-up about-delay-3">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-shimmer bg-[length:200%_100%]"></div>
          <div className="relative bg-gradient-to-br from-purple-950/55 via-pink-950/30 to-slate-900/90 backdrop-blur-xl border border-purple-500/25 rounded-3xl p-10 md:p-12 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(236,72,153,0.25)]" id="contact">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                <span className="text-3xl">💬</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white">Contact Us</h2>
            </div>
            <p className="mb-8 text-lg text-white/80 leading-relaxed">
              Questions or ideas? We would love to hear from you. Share your feedback with the team.
            </p>
            <div className="flex items-center gap-4 text-white/80 group/email hover:text-white transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center group-hover/email:scale-110 transition-transform">
                <span className="text-2xl">📧</span>
              </div>
              <div>
                <p className="text-sm text-white/50 uppercase tracking-wider">Email</p>
                <p className="font-semibold text-lg">hello@speaks.app</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </LandingLayout>
  );
}

export default About;
