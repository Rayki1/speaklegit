import { useMemo, useState } from "react";
import TwoPlayerGameFrame from "../components/TwoPlayerGameFrame";
import { connectors, storyStarters } from "../utils/twoPlayerData";

function HalfStoryChallenge() {
  const [storyIndex, setStoryIndex] = useState(0);
  const [connectorIndex, setConnectorIndex] = useState(0);

  const shuffledStarters = useMemo(() => {
    const items = [...storyStarters];
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, []);

  const shuffledConnectors = useMemo(() => {
    const items = [...connectors];
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, []);

  return (
    <TwoPlayerGameFrame
      title="Half-Story Challenge"
      subtitle="Build one story together by taking turns with prompts."
      howToPlaySteps={[
        "Read the Story Starter aloud, then Player A says one sentence and Player B continues with the next sentence to build one connected story.",
        "Press New Connector to force a transition word; the next player must begin their sentence using that connector naturally.",
      ]}
    >
      <div className="space-y-3">
        <div className="rounded-3xl bg-gradient-to-br from-white to-indigo-50 border border-slate-200 p-4 md:p-5 text-center shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">Story Starter</p>
          <p className="text-2xl md:text-4xl font-black text-slate-800 leading-tight">
            {shuffledStarters[storyIndex % shuffledStarters.length]}
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 p-4 md:p-5 text-center shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">Connector</p>
          <p className="text-3xl md:text-5xl font-black text-slate-800">
            {shuffledConnectors[connectorIndex % shuffledConnectors.length]}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStoryIndex((prev) => prev + 1)}
            className="w-full rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-slate-900 font-bold py-3 transition-all duration-300 hover:-translate-y-0.5"
          >
            New Story Starter
          </button>

          <button
            type="button"
            onClick={() => setConnectorIndex((prev) => prev + 1)}
            className="w-full rounded-2xl bg-sky-100 hover:bg-sky-200 text-slate-900 font-bold py-3 transition-all duration-300 hover:-translate-y-0.5"
          >
            New Connector
          </button>
        </div>
      </div>
    </TwoPlayerGameFrame>
  );
}

export default HalfStoryChallenge;
