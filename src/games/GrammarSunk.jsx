import { Fragment, useMemo, useState } from "react";
import TwoPlayerGameFrame from "../components/TwoPlayerGameFrame";
import { pronouns, tenses, verbs } from "../utils/twoPlayerData";

function GrammarSunk() {
  const [board, setBoard] = useState(() =>
    pronouns.map(() => verbs.map(() => null))
  );

  const activeTense = useMemo(() => {
    return tenses[Math.floor(Math.random() * tenses.length)];
  }, []);

  const markCell = (rowIndex, colIndex) => {
    setBoard((prev) => {
      const next = prev.map((row) => [...row]);
      if (next[rowIndex][colIndex] !== null) {
        return next;
      }
      next[rowIndex][colIndex] = Math.random() > 0.5 ? "hit" : "miss";
      return next;
    });
  };

  return (
    <TwoPlayerGameFrame
      title="Grammar Sunk"
      subtitle="Battleship-style grammar target board for speaking practice."
      howToPlaySteps={[
        "Before clicking any cell, choose one pronoun + verb pair and say a full sentence using the required tense (example: They have studied every night).",
        "If the sentence is correct, click that pair cell to take your shot; blue means Hit, gray means Miss, and each cell can be used only once.",
      ]}
    >
      <div className="space-y-3">
        <div className="rounded-3xl bg-gradient-to-br from-white to-indigo-50 border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-sm text-slate-500">Required Tense</p>
          <p className="text-2xl md:text-3xl font-black text-slate-800">{activeTense}</p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[560px] rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-2 shadow-sm">
            <div className="grid grid-cols-6 gap-2">
              <div className="rounded-xl bg-slate-100 p-3 text-center font-bold text-slate-500">#</div>
              {verbs.map((verb) => (
                <div key={verb} className="rounded-xl bg-slate-100 p-3 text-center font-bold text-slate-700">
                  {verb}
                </div>
              ))}

              {pronouns.map((pronoun, rowIndex) => (
                <Fragment key={pronoun}>
                  <div key={`${pronoun}-label`} className="rounded-xl bg-slate-100 p-3 text-center font-bold text-slate-700">
                    {pronoun}
                  </div>
                  {verbs.map((verb, colIndex) => {
                    const state = board[rowIndex][colIndex];
                    return (
                      <button
                        type="button"
                        key={`${pronoun}-${verb}`}
                        onClick={() => markCell(rowIndex, colIndex)}
                        className={`rounded-xl p-3 font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                          state === "hit"
                            ? "bg-blue-500 text-white"
                            : state === "miss"
                              ? "bg-slate-300 text-slate-700"
                              : "bg-sky-50 hover:bg-sky-100 text-slate-800"
                        }`}
                      >
                        {state === null ? "Shoot" : state === "hit" ? "Hit" : "Miss"}
                      </button>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TwoPlayerGameFrame>
  );
}

export default GrammarSunk;
