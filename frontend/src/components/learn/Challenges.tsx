"use client";

import { CHALLENGES } from "@/config/challenges";
import { useLocalStorage } from "@/lib/hooks";
import { useState } from "react";

interface ChallengesProps {
  onTryInPlayground: (text: string, tokenizer: string) => void;
}

const STORAGE_KEY = "tp-challenges-v1";
const STARTER_TEXTS: Record<string, string> = {
  "fewer-tokens-than-words": "Tokenization playground experimentation",
  "five-words-fifteen-tokens": "Unbelievably zzquanchy phylloxera hiccupped ïmpórtäntly.",
  "bert-three-gpt4o-one": "Tokenization",
  "emoji-price": "🧑‍🚀 🏳️‍🌈 🍕",
  "space-doubling": "word word",
  "half-emoji": "🍕 pizza bytes",
  "whitespace-bill": "word                                                               gap",
  "json-vs-prose": '{"age": 36}',
};

export function Challenges({ onTryInPlayground }: ChallengesProps) {
  const [state, setState, hydrated] = useLocalStorage<Record<string, boolean>>(STORAGE_KEY, {});
  const [openHint, setOpenHint] = useState<string | null>(null);

  const toggleDone = (id: string) => {
    setState((current) => ({ ...current, [id]: !current[id] }));
  };

  const doneCount = CHALLENGES.filter((c) => state[c.id]).length;

  return (
    <section aria-label="Experiments" className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">🧪 Experiments</h2>
        <span
          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600"
          aria-live="polite"
        >
          {doneCount} / {CHALLENGES.length} solved
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        The fastest way to internalize tokenization is to poke at it. Your progress is saved in this
        browser.
      </p>

      <ul className="space-y-2">
        {CHALLENGES.map((challenge) => {
          const done = hydrated ? Boolean(state[challenge.id]) : false;
          const hintOpen = openHint === challenge.id;
          return (
            <li
              key={challenge.id}
              className={`rounded-xl border p-3 transition-colors ${
                done
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={done}
                  aria-label={`Mark challenge complete: ${challenge.title}`}
                  onClick={() => toggleDone(challenge.id)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white text-transparent hover:border-emerald-400"
                  }`}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${done ? "text-emerald-800 line-through" : ""}`}>
                    {challenge.title}
                  </p>
                  {hintOpen && (
                    <p className="mt-1.5 rounded-lg bg-amber-50 p-2 text-xs leading-relaxed text-amber-900">
                      💡 {challenge.hint}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenHint(hintOpen ? null : challenge.id)}
                      aria-expanded={hintOpen}
                      className="inline-flex h-7 items-center rounded-lg bg-white px-2.5 text-xs font-medium text-slate-600 ring-1 ring-slate-300 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      {hintOpen ? "Hide hint" : "Hint"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onTryInPlayground(
                          STARTER_TEXTS[challenge.id] ?? challenge.hint,
                          challenge.tokenizer,
                        )
                      }
                      className="inline-flex h-7 items-center rounded-lg bg-white px-2.5 text-xs font-medium text-indigo-600 ring-1 ring-indigo-300 transition-colors hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      Try in playground →
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
