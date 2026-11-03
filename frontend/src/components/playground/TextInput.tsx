"use client";

import { formatNumber } from "@/lib/hooks";
import type { ExampleItem } from "@/lib/types";

interface TextInputProps {
  value: string;
  onChange: (text: string) => void;
  examples: ExampleItem[];
  examplesLoading: boolean;
  maxLength: number;
}

export function TextInput({ value, onChange, examples, examplesLoading, maxLength }: TextInputProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor="playground-input" className="text-sm font-medium">
          Your text
        </label>
        <span
          className={`text-xs tabular-nums ${
            value.length > maxLength * 0.9 ? "text-amber-600" : "text-slate-400"
          }`}
        >
          {formatNumber(value.length)} / {formatNumber(maxLength)}
        </span>
      </div>
      <textarea
        id="playground-input"
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        spellCheck={false}
        placeholder="Type or paste anything — sentences, code, emoji, Hindi, JSON…"
        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3.5 font-mono text-sm leading-relaxed shadow-inner shadow-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
        aria-describedby="playground-input-hint"
      />
      <p id="playground-input-hint" className="mt-1 text-xs text-slate-500">
        Tokenizes live as you type. Or try an example:
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Example texts">
        {examplesLoading && !examples.length
          ? Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                className="inline-block h-8 w-24 animate-pulse rounded-full bg-slate-200"
              />
            ))
          : examples.map((example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => onChange(example.text)}
                title={example.note ?? undefined}
                className="inline-flex h-8 items-center rounded-full border border-transparent bg-white px-3 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {example.title}
              </button>
            ))}
      </div>
    </div>
  );
}
