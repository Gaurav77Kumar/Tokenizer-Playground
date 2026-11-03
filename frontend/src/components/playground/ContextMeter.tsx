"use client";

import { useState } from "react";
import { CONTEXT_LIMITS, DEFAULT_CONTEXT_LIMIT } from "@/config/limits";
import { formatNumber } from "@/lib/hooks";

interface ContextMeterProps {
  tokenCount: number;
}

export function ContextMeter({ tokenCount }: ContextMeterProps) {
  const [limit, setLimit] = useState(DEFAULT_CONTEXT_LIMIT);

  const pct = Math.min((tokenCount / limit) * 100, 100);
  const over = tokenCount > limit;
  const barColor = over
    ? "bg-red-500"
    : pct >= 80
      ? "bg-amber-400"
      : pct >= 50
        ? "bg-sky-400"
        : "bg-emerald-400";

  return (
    <section
      aria-label="Context window usage"
      className="rounded-xl border border-slate-200 bg-white p-4"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Context window</h3>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          Model limit
          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-2 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {CONTEXT_LIMITS.map((l) => (
              <option key={l.tokens} value={l.tokens}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        role="progressbar"
        aria-valuenow={tokenCount}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={`${formatNumber(tokenCount)} of ${formatNumber(limit)} tokens used`}
        className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80 ring-1 ring-inset ring-slate-300/50"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(pct, tokenCount > 0 ? 1.5 : 0)}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-600">
        {formatNumber(tokenCount)} / {formatNumber(limit)} tokens
        {over ? (
          <span className="ml-1 font-semibold text-red-600">
            — over by {formatNumber(tokenCount - limit)}! The model can&apos;t read the rest.
          </span>
        ) : (
          <span className="ml-1 text-slate-400">
            ({pct < 0.01 && tokenCount > 0 ? "<0.01" : pct.toFixed(1)}% of the window) — prompt and
            answer share this budget.
          </span>
        )}
      </p>
    </section>
  );
}
