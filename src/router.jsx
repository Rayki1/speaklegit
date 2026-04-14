import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";

const routeLoaderPaths = new Set(["/difficulty", "/oneplayer", "/twoplayer"]);

const routeLoaders = {
  OnePlayer: () => import("./pages/OnePlayer"),
  TwoPlayer: () => import("./pages/TwoPlayer"),
  Difficulty: () => import("./pages/Difficulty"),
  Leaderboards: () => import("./pages/Leaderboards"),
  PronunciationGame: () => import("./pages/PronunciationGame"),
  SpellingGame: () => import("./pages/SpellingGame"),
  VocabularyGame: () => import("./pages/VocabularyGame"),
  MovieLines: () => import("./games/MovieLines"),
  PasswordDescriber: () => import("./games/PasswordDescriber"),
  GrammarSunk: () => import("./games/GrammarSunk"),
  HalfStoryChallenge: () => import("./games/HalfStoryChallenge"),
  StopCategories: () => import("./games/StopCategories"),
  ShopPage: () => import("./pages/Shop"),
  TwoPlayerPronunciationBattle: () => import("./pages/TwoPlayerPronunciationBattle"),
  TwoPlayerSpellingBattle: () => import("./pages/TwoPlayerSpellingBattle"),
  TwoPlayerVocabularyRace: () => import("./pages/TwoPlayerVocabularyRace"),
  TwoPlayerMovieLinesChallenge: () => import("./pages/TwoPlayerMovieLinesChallenge"),
  PhraseMasterGame: () => import("./pages/PhraseMasterGame"),
  VocabMatchGame: () => import("./pages/VocabMatchGame"),
  SentenceScrambleGame: () => import("./pages/SentenceScrambleGame"),
};

const OnePlayer = lazy(routeLoaders.OnePlayer);
const TwoPlayer = lazy(routeLoaders.TwoPlayer);
const Difficulty = lazy(routeLoaders.Difficulty);
const Leaderboards = lazy(routeLoaders.Leaderboards);
const PronunciationGame = lazy(routeLoaders.PronunciationGame);
const SpellingGame = lazy(routeLoaders.SpellingGame);
const VocabularyGame = lazy(routeLoaders.VocabularyGame);
const MovieLines = lazy(routeLoaders.MovieLines);
const PasswordDescriber = lazy(routeLoaders.PasswordDescriber);
const GrammarSunk = lazy(routeLoaders.GrammarSunk);
const HalfStoryChallenge = lazy(routeLoaders.HalfStoryChallenge);
const StopCategories = lazy(routeLoaders.StopCategories);
const ShopPage = lazy(routeLoaders.ShopPage);
const TwoPlayerPronunciationBattle = lazy(routeLoaders.TwoPlayerPronunciationBattle);
const TwoPlayerSpellingBattle = lazy(routeLoaders.TwoPlayerSpellingBattle);
const TwoPlayerVocabularyRace = lazy(routeLoaders.TwoPlayerVocabularyRace);
const TwoPlayerMovieLinesChallenge = lazy(routeLoaders.TwoPlayerMovieLinesChallenge);
const PhraseMasterGame = lazy(routeLoaders.PhraseMasterGame);
const VocabMatchGame = lazy(routeLoaders.VocabMatchGame);
const SentenceScrambleGame = lazy(routeLoaders.SentenceScrambleGame);

const prefetchedRouteModules = new Set();

function prefetchRouteModule(moduleKey) {
  const loader = routeLoaders[moduleKey];
  if (!loader || prefetchedRouteModules.has(moduleKey)) return;

  prefetchedRouteModules.add(moduleKey);
  loader().catch(() => {
    prefetchedRouteModules.delete(moduleKey);
  });
}

export function prefetchLikelyRoutes(pathname = "/") {
  const currentPath = String(pathname || "/").split("?")[0];

  if (currentPath === "/") {
    ["Login", "OnePlayer", "TwoPlayer", "Difficulty", "About"].forEach(prefetchRouteModule);
    return;
  }

  if (currentPath === "/oneplayer" || currentPath === "/difficulty") {
    [
      "PronunciationGame",
      "SpellingGame",
      "VocabularyGame",
      "PhraseMasterGame",
      "VocabMatchGame",
      "SentenceScrambleGame",
      "MovieLines",
      "Leaderboards",
    ].forEach(prefetchRouteModule);
    return;
  }

  if (currentPath === "/twoplayer") {
    [
      "TwoPlayerSpellingBattle",
      "TwoPlayerVocabularyRace",
      "TwoPlayerMovieLinesChallenge",
      "TwoPlayerPronunciationBattle",
      "PasswordDescriber",
      "GrammarSunk",
      "HalfStoryChallenge",
      "StopCategories",
    ].forEach(prefetchRouteModule);
    return;
  }

  if (currentPath.startsWith("/game/")) {
    ["Leaderboards", "ShopPage", "Difficulty", "OnePlayer"].forEach(prefetchRouteModule);
    return;
  }

  ["Landing", "OnePlayer"].forEach(prefetchRouteModule);
}

function RouteLoader() {
  return (
    <div className="min-h-screen grid place-items-center overflow-hidden bg-[#070b16] px-4 text-slate-200">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[12%] top-[14%] h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[18%] right-[16%] h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/5 p-7 text-center shadow-[0_20px_80px_rgba(8,15,30,0.45)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/20 via-sky-400/10 to-fuchsia-500/20 shadow-[0_0_40px_rgba(34,211,238,0.16)]">
          <div className="h-8 w-8 rounded-xl border border-cyan-200/25 bg-cyan-300/20 animate-pulse" />
        </div>
        <p className="mt-5 text-[10px] uppercase tracking-[0.32em] text-slate-400">Loading</p>
        <h2 className="mt-3 text-xl font-black text-white">Preparing your game room</h2>
        <p className="mt-2 text-sm text-slate-300/75">Syncing the next challenge and getting the interface ready.</p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-700/50">
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400" />
        </div>
      </div>
    </div>
  );
}

function withSuspense(element, shouldShowLoader = false) {
  return <Suspense fallback={shouldShowLoader ? <RouteLoader /> : null}>{element}</Suspense>;
}

function shouldShowRouteLoader(path) {
  return routeLoaderPaths.has(path) || path.startsWith("/game/");
}

const router = createBrowserRouter([
  { path: "/contact", element: withSuspense(<Contact />, shouldShowRouteLoader("/contact")) },
  { path: "/", element: withSuspense(<Landing />, shouldShowRouteLoader("/")) },
  { path: "/login", element: withSuspense(<Login />, shouldShowRouteLoader("/login")) },
  { path: "/register", element: withSuspense(<Register />, shouldShowRouteLoader("/register")) },
  { path: "/oneplayer", element: withSuspense(<OnePlayer />, shouldShowRouteLoader("/oneplayer")) },
  { path: "/twoplayer", element: withSuspense(<TwoPlayer />, shouldShowRouteLoader("/twoplayer")) },
  { path: "/difficulty", element: withSuspense(<Difficulty />, shouldShowRouteLoader("/difficulty")) },
  { path: "/leaderboards", element: withSuspense(<Leaderboards />, shouldShowRouteLoader("/leaderboards")) },
  { path: "/shop", element: withSuspense(<ShopPage />, shouldShowRouteLoader("/shop")) },
  { path: "/about", element: withSuspense(<About />, shouldShowRouteLoader("/about")) },
  { path: "/game/pronunciation", element: withSuspense(<PronunciationGame />, shouldShowRouteLoader("/game/pronunciation")) },
  { path: "/game/spelling", element: withSuspense(<SpellingGame />, shouldShowRouteLoader("/game/spelling")) },
  { path: "/game/vocabulary", element: withSuspense(<VocabularyGame />, shouldShowRouteLoader("/game/vocabulary")) },
  { path: "/game/movielines", element: withSuspense(<MovieLines />, shouldShowRouteLoader("/game/movielines")) },
  { path: "/game/two/spelling", element: withSuspense(<TwoPlayerSpellingBattle />, shouldShowRouteLoader("/game/two/spelling")) },
  { path: "/game/two/vocabulary", element: withSuspense(<TwoPlayerVocabularyRace />, shouldShowRouteLoader("/game/two/vocabulary")) },
  { path: "/game/two/movielines", element: withSuspense(<TwoPlayerMovieLinesChallenge />, shouldShowRouteLoader("/game/two/movielines")) },
  { path: "/game/two/password", element: withSuspense(<PasswordDescriber />, shouldShowRouteLoader("/game/two/password")) },
  { path: "/game/two/pronunciation-battle", element: withSuspense(<TwoPlayerPronunciationBattle />, shouldShowRouteLoader("/game/two/pronunciation-battle")) },
  { path: "/game/two/grammar-sunk", element: withSuspense(<GrammarSunk />, shouldShowRouteLoader("/game/two/grammar-sunk")) },
  { path: "/game/two/half-story", element: withSuspense(<HalfStoryChallenge />, shouldShowRouteLoader("/game/two/half-story")) },
  { path: "/game/two/stop", element: withSuspense(<StopCategories />, shouldShowRouteLoader("/game/two/stop")) },
  { path: "/game/phrase-master", element: withSuspense(<PhraseMasterGame />, shouldShowRouteLoader("/game/phrase-master")) },
  { path: "/game/vocab-match", element: withSuspense(<VocabMatchGame />, shouldShowRouteLoader("/game/vocab-match")) },
  { path: "/game/sentence-scramble", element: withSuspense(<SentenceScrambleGame />, shouldShowRouteLoader("/game/sentence-scramble")) },
]);

export default router;
