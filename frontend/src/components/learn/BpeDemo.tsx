"use client";

import { useMemo, useState } from "react";

/**
 * A tiny, fully client-side BPE trainer used by lesson 8.
 * It mirrors the real algorithm: count adjacent pairs across the corpus,
 * merge the most frequent one, repeat — snapshotting each step.
 */

const CORPUS: [string, number][] = [
  ["low", 5],
  ["lower", 2],
  ["lowest", 2],
  ["newest", 6],
  ["widest", 3],
];

const NUM_MERGES = 9;
const END = "</w>";

interface WordState {
  word: string;
  freq: number;
  symbols: string[];
}

interface BpeStep {
  /** Words in the state AFTER this step's merge (initial split state for step 0). */
  words: WordState[];
  /** The pair that was merged to REACH this state (null for step 0). */
  merged: [string, string] | null;
  /** How often the merged pair appeared before the merge. */
  mergeCount: number;
  /** Top pair counts of this state — the top one is the NEXT merge. */
  topPairs: { pair: [string, string]; count: number }[];
  vocab: string[];
}

function initialWords(): WordState[] {
  return CORPUS.map(([word, freq]) => ({
    word,
    freq,
    symbols: [...word.split(""), END],
  }));
}

function countPairs(words: WordState[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of words) {
    for (let i = 0; i < word.symbols.length - 1; i++) {
      const key = `${word.symbols[i]}\u0000${word.symbols[i + 1]}`;
      counts.set(key, (counts.get(key) ?? 0) + word.freq);
    }
  }
  return counts;
}

function topPairsFrom(counts: Map<string, number>): { pair: [string, string]; count: number }[] {
  return [...counts.entries()]
    .map(([key, count]) => {
      const [a, b] = key.split("\u0000");
      return { pair: [a, b] as [string, string], count };
    })
    .sort((x, y) => y.count - x.count || x.pair[0].localeCompare(y.pair[0]))
    .slice(0, 5);
}

function buildSteps(): BpeStep[] {
  const steps: BpeStep[] = [];
  let words = initialWords();

  for (let step = 0; step <= NUM_MERGES; step++) {
    const counts = countPairs(words);
    const topPairs = topPairsFrom(counts);
    const vocab = [...new Set(words.flatMap((w) => w.symbols))].sort();
    steps.push({
      words: words.map((w) => ({ ...w, symbols: [...w.symbols] })),
      merged: null,
      mergeCount: 0,
      topPairs,
      vocab,
    });

    if (step === NUM_MERGES) break;
    const best = topPairs[0];
    if (!best) break;

    // Apply the merge across the corpus.
    const [a, b] = best.pair;
    words = words.map((word) => {
      const symbols: string[] = [];
      let i = 0;
      while (i < word.symbols.length) {
        if (i < word.symbols.length - 1 && word.symbols[i] === a && word.symbols[i + 1] === b) {
          symbols.push(a + b);
          i += 2;
        } else {
          symbols.push(word.symbols[i]);
          i += 1;
        }
      }
      return { ...word, symbols };
    });
  }

  // Record what each step merged: step k+1 shows the result of the merge
  // chosen at step k, so the merged pair belongs to step k+1.
  for (let step = 0; step < steps.length - 1; step++) {
    const before = steps[step].words;
    const after = steps[step + 1].words;
    for (let w = 0; w < before.length; w++) {
      if (before[w].symbols.length !== after[w].symbols.length) {
        for (let s = 0; s < after[w].symbols.length; s++) {
          if (before[w].symbols[s] !== after[w].symbols[s]) {
            steps[step + 1].merged = [before[w].symbols[s], before[w].symbols[s + 1]];
            steps[step + 1].mergeCount = steps[step].topPairs[0]?.count ?? 0;
            break;
          }
        }
        break;
      }
    }
  }

  return steps;
}

export function BpeDemo() {
  const steps = useMemo(buildSteps, []);
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];

  return (
    <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
        Interactive demo · step {stepIndex} of {steps.length - 1}
      </p>

      <p className="mt-2 min-h-10 text-sm leading-relaxed text-indigo-900">
        {step.merged ? (
          <>
            We merged <Marked>[{step.merged[0]}][{step.merged[1]}]</Marked> — it appeared{" "}
            <strong>{step.mergeCount}×</strong> in the corpus — into the new token{" "}
            <Marked>{step.merged[0] + step.merged[1]}</Marked> (shown in green). The vocabulary is
            now <strong>{step.vocab.length}</strong> tokens.
          </>
        ) : (
          <>
            Here is our tiny corpus. Every word starts fully split into characters (plus{" "}
            <Marked>{END}</Marked>, a marker for &ldquo;end of word&rdquo;). The vocabulary is{" "}
            <strong>{step.vocab.length}</strong> tokens. Press Next to merge the most frequent
            pair.
          </>
        )}
      </p>

      {/* Corpus words */}
      <div className="mt-3 space-y-1.5">
        {step.words.map((word, i) => (
          <div key={word.word} className="flex items-center gap-2 text-sm">
            <span className="w-20 shrink-0 text-right font-mono text-xs text-slate-500">
              {word.word}×{word.freq}
            </span>
            <div className="flex flex-wrap gap-1">
              {word.symbols.map((symbol, s) => {
                const isPartOfNew =
                  step.merged !== null && symbol === step.merged[0] + step.merged[1];
                return (
                  <span
                    key={s}
                    className={`rounded px-1.5 py-0.5 font-mono text-xs transition-colors ${
                      isPartOfNew
                        ? "bg-emerald-400 font-bold text-emerald-950"
                        : "bg-white text-slate-700 ring-1 ring-indigo-200"
                    }`}
                  >
                    {symbol}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pair counts */}
      <div className="mt-3">
        <p className="text-xs font-semibold text-indigo-700">
          Most frequent adjacent pairs right now (the first one merges on Next):
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {step.topPairs.map(({ pair, count }, pairIndex) => {
            const isNext = pairIndex === 0;
            return (
              <span
                key={`${pair[0]}${pair[1]}`}
                className={`rounded px-1.5 py-0.5 font-mono text-xs ${
                  isNext
                    ? "bg-emerald-400 font-bold text-emerald-950"
                    : "bg-white text-slate-600 ring-1 ring-indigo-200"
                }`}
              >
                [{pair[0]}][{pair[1]}] → {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Vocabulary */}
      <div className="mt-3">
        <p className="text-xs font-semibold text-indigo-700">
          Vocabulary ({step.vocab.length} tokens):
        </p>
        <p className="mt-1 font-mono text-xs leading-relaxed text-slate-600">
          {step.vocab.join(" · ")}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-300 transition-colors hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
          disabled={stepIndex >= steps.length - 1}
          className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
        <button
          type="button"
          onClick={() => setStepIndex(0)}
          className="ml-auto text-xs font-medium text-indigo-500 underline hover:text-indigo-700"
        >
          Restart
        </button>
      </div>
    </div>
  );
}

function Marked({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-indigo-200 px-1 py-0.5 font-mono text-[13px] font-bold text-indigo-900">
      {children}
    </span>
  );
}
