import { Link } from "react-router-dom";

export default function GameMenu({ mode }) {
  const onePlayerGames = [
    {
      title: "Pronunciation Practice",
      emoji: "🎤",
      description: "Master correct pronunciation with voice recognition feedback",
      path: "/game/pronunciation",
      accent: "from-purple-500 to-violet-600",
      glow: "rgba(168,85,247,0.3)",
      tag: null,
    },
    {
      title: "Spelling Challenge",
      emoji: "✏️",
      description: "Unscramble letters and form correct words before time runs out",
      path: "/game/spelling",
      accent: "from-blue-500 to-cyan-600",
      glow: "rgba(59,130,246,0.3)",
      tag: null,
    },
    {
      title: "Vocabulary Builder",
      emoji: "📖",
      description: "Learn new words with definition clues and smart hints",
      path: "/game/vocabulary",
      accent: "from-emerald-500 to-teal-600",
      glow: "rgba(34,197,94,0.3)",
      tag: null,
    },
    {
      title: "Movie Lines Challenge",
      emoji: "🎭",
      description: "Perform famous movie lines with emotion and expression",
      path: "/game/movielines",
      accent: "from-fuchsia-500 to-pink-600",
      glow: "rgba(217,70,239,0.3)",
      tag: "NEW",
    },
    {
      title: "Phrase Master",
      emoji: "💬",
      description: "Fill in the blank, then speak the full sentence aloud for bonus points",
      path: "/game/phrase-master",
      accent: "from-amber-500 to-orange-600",
      glow: "rgba(245,158,11,0.3)",
      tag: "NEW",
    },
    {
      title: "Vocab Match",
      emoji: "🔗",
      description: "Match words to their correct definitions as fast as you can",
      path: "/game/vocab-match",
      accent: "from-cyan-500 to-blue-600",
      glow: "rgba(6,182,212,0.3)",
      tag: "NEW",
    },
    {
      title: "Sentence Scramble",
      emoji: "🔀",
      description: "Tap scrambled words in the correct order to build a proper sentence",
      path: "/game/sentence-scramble",
      accent: "from-violet-500 to-indigo-600",
      glow: "rgba(139,92,246,0.3)",
      tag: "NEW",
    },
  ];

  const twoPlayerGames = [
    {
      title: "Password Describer",
      emoji: "🕵️",
      description: "Hold-to-reveal secret noun clues with score tracking for Player A and B",
      path: "/game/two/password",
      accent: "from-sky-500 to-blue-600",
      glow: "rgba(14,165,233,0.3)",
      tag: null,
    },
    {
      title: "Grammar Sunk",
      emoji: "⚓",
      description: "Battleship-style grammar shots on a 5×5 pronoun-verb grid",
      path: "/game/two/grammar-sunk",
      accent: "from-indigo-500 to-purple-600",
      glow: "rgba(99,102,241,0.3)",
      tag: null,
    },
    {
      title: "Half-Story Challenge",
      emoji: "📚",
      description: "Use random story starters and connectors to build one story together",
      path: "/game/two/half-story",
      accent: "from-emerald-500 to-green-600",
      glow: "rgba(16,185,129,0.3)",
      tag: null,
    },
    {
      title: "Stop Game (Categories)",
      emoji: "🛑",
      description: "Generate a letter, race a 60-second timer, and hit STOP with sound",
      path: "/game/two/stop",
      accent: "from-rose-500 to-red-600",
      glow: "rgba(244,63,94,0.3)",
      tag: "HOT",
    },
  ];

  const games = mode === "two"
    ? [
        ...onePlayerGames
          .map((game) => {
            if (game.title === "Phrase Master") return null;
            if (game.title === "Vocab Match") return null;
            if (game.title === "Sentence Scramble") return null;

            if (game.title === "Pronunciation Practice") {
              return {
                ...game,
                title: "Pronunciation Battle",
                description: "30-second turns per player with live voice scoring and streak bonuses.",
                path: "/game/two/pronunciation-battle",
              };
            }

            if (game.title === "Vocabulary Builder") {
              return {
                ...game,
                title: "Vocabulary Race",
                description: "One shared input, alternating turns, race to score from the same definition.",
                path: "/game/two/vocabulary",
              };
            }

            if (game.title === "Spelling Challenge") {
              return {
                ...game,
                description: "Two players race side-by-side on the same scrambled word with live scores.",
                path: "/game/two/spelling",
                tag: "HOT",
              };
            }

            if (game.title === "Movie Lines Challenge") {
              return {
                ...game,
                description: "Alternating two-player duel with shared movie lines and timer-based scoring.",
                path: "/game/two/movielines",
                tag: "NEW",
              };
            }

            return game;
          })
          .filter(Boolean),
        ...twoPlayerGames,
      ]
    : onePlayerGames;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {games.map((game) => (
        <Link
          key={game.path}
          to={game.path}
          className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] active:scale-[0.98] active:translate-y-0"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = `1px solid ${game.glow.replace("0.3", "0.5")}`;
            e.currentTarget.style.boxShadow = `0 0 0 1px ${game.glow.replace("0.3", "0.25")}, 0 16px 60px ${game.glow.replace("0.3", "0.35")}, 0 4px 24px rgba(0,0,0,0.5)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
            e.currentTarget.style.boxShadow = "0 4px 32px rgba(0,0,0,0.4)";
          }}
        >
          {/* Ambient inner glow on hover */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500 rounded-2xl"
            style={{ background: `radial-gradient(ellipse at top left, ${game.glow.replace("0.3", "0.15")}, transparent 65%)` }}
          />

          {/* Top neon bar */}
          <div
            className={`h-[3px] w-full bg-gradient-to-r ${game.accent} flex-shrink-0`}
            style={{ boxShadow: `0 0 10px ${game.glow.replace("0.3", "0.6")}, 0 0 20px ${game.glow.replace("0.3", "0.3")}` }}
          />

          <div className="relative flex flex-col flex-1 p-4 sm:p-5 gap-3 sm:gap-4">
            {/* Header row: icon + tag */}
            <div className="flex items-start justify-between gap-3">
              <div
                className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl text-2xl sm:text-3xl shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${game.glow.replace("0.3", "0.22")}, ${game.glow.replace("0.3", "0.06")})`,
                  border: `1px solid ${game.glow.replace("0.3", "0.4")}`,
                  boxShadow: `0 4px 20px ${game.glow.replace("0.3", "0.25")}`,
                }}
              >
                {game.emoji}
              </div>
              {game.tag && (
                <span
                  className={`shrink-0 rounded-full px-2.5 sm:px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] bg-gradient-to-r ${game.accent} text-white`}
                  style={{ boxShadow: `0 0 14px ${game.glow.replace("0.3", "0.55")}` }}
                >
                  {game.tag}
                </span>
              )}
            </div>

            {/* Title + description */}
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-base sm:text-lg text-white leading-snug mb-1.5 sm:mb-2 truncate transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text"
                style={{ backgroundImage: `linear-gradient(90deg, #fff 60%, ${game.glow.replace("0.3", "1")})`, WebkitBackgroundClip: "text" }}
              >
                {game.title}
              </h3>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed group-hover:text-white/70 transition-colors duration-300 line-clamp-2">
                {game.description}
              </p>
            </div>

            {/* PLAY NOW — transparent pixel-font CTA */}
            <div
              className="relative flex items-center justify-between rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 overflow-hidden border transition-all duration-300 group-hover:border-white/25 group-active:scale-95"
              style={{
                background: `linear-gradient(90deg, ${game.glow.replace("0.3", "0.10")}, transparent)`,
                borderColor: `${game.glow.replace("0.3", "0.2")}`,
              }}
            >
              {/* Shimmer sweep on hover */}
              <div
                className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                style={{ background: `linear-gradient(90deg, transparent, ${game.glow.replace("0.3", "0.18")}, transparent)` }}
              />
              <span
                className="relative arcade-title text-[10px] sm:text-xs tracking-[0.28em] transition-all duration-300 group-hover:tracking-[0.36em]"
                style={{
                  background: `linear-gradient(90deg, rgba(255,255,255,0.55), ${game.glow.replace("0.3", "0.9")})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: `drop-shadow(0 0 6px ${game.glow.replace("0.3", "0.7")})`,
                }}
              >
                PLAY NOW
              </span>
              <span
                className="relative text-sm sm:text-base transition-all duration-300 group-hover:translate-x-1.5 group-hover:scale-125"
                style={{
                  color: game.glow.replace("0.3", "0.7"),
                  filter: `drop-shadow(0 0 4px ${game.glow.replace("0.3", "0.8")})`,
                }}
              >
                →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

