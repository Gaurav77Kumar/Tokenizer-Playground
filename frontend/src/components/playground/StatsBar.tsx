"use client";

import { formatNumber } from "@/lib/hooks";
import type { TokenizeResult } from "@/lib/types";

interface StatsBarProps {
  result: TokenizeResult | null;
  refreshing: boolean;
}

export function StatsBar({ result, refreshing }: StatsBarProps) {
  const stats = result
    ? [
        { label: "Tokens", value: formatNumber(result.token_count), hint: "Chunks the model reads" },
        { label: "Characters", value: formatNumber(result.char_count), hint: "Letters, spaces and all" },
        { label: "Words", value: formatNumber(result.word_count), hint: "Whitespace-separated" },
        {
          label: "Chars / token",
          value: result.chars_per_token.toFixed(2),
          hint: "Higher = more text packed per token",
        },
      ]
    : null;

  return (
    <section
      aria-label="Token statistics"
      aria-live="polite"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {(stats ?? [null, null, null, null]).map((stat, i) => (
        <div
          key={stat?.label ?? i}
          className="relative rounded-xl border border-slate-200 bg-white p-3"
        >
          {stat ? (
            <>
              <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
                {stat.value}
                {refreshing && (
                  <span
                    aria-hidden
                    className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-400 align-middle"
                  />
                )}
              </p>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className="mt-0.5 hidden text-[11px] leading-tight text-slate-400 sm:block">
                {stat.hint}
              </p>
            </>
          ) : (
            <div aria-hidden className="animate-pulse">
              <div className="h-7 w-14 rounded bg-slate-200" />
              <div className="mt-1.5 h-3 w-20 rounded bg-slate-100" />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
