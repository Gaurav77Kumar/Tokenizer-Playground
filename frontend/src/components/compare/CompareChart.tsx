"use client";

import { formatNumber } from "@/lib/hooks";
import type { TokenizeResult } from "@/lib/types";

interface CompareChartProps {
  results: TokenizeResult[];
  fewest: string | null;
  refreshing: boolean;
}

/** Small horizontal bar chart of token counts, one bar per tokenizer. */
export function CompareChart({ results, fewest, refreshing }: CompareChartProps) {
  const max = Math.max(...results.map((r) => r.token_count), 1);

  return (
    <section aria-label="Token count comparison" className="space-y-2">
      <h3 className="text-sm font-semibold">
        Token counts {refreshing && <span className="text-xs font-normal text-slate-400">(updating…)</span>}
      </h3>
      {results.map((result) => {
        const isWinner = fewest === result.tokenizer;
        const pct = (result.token_count / max) * 100;
        return (
          <div key={result.tokenizer} className="flex items-center gap-3">
            <span className="w-44 shrink-0 truncate text-xs font-medium" title={result.tokenizer}>
              {result.tokenizer}
              {isWinner && (
                <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  ✓ fewest
                </span>
              )}
            </span>
            <div className="h-5 flex-1 overflow-hidden rounded-md bg-slate-100">
              <div
                className={`h-full rounded-md transition-all duration-500 ${
                  isWinner ? "bg-emerald-400" : "bg-indigo-400"
                }`}
                style={{ width: `${Math.max(pct, 1)}%` }}
              />
            </div>
            <span className="w-12 text-right text-xs font-bold tabular-nums">
              {formatNumber(result.token_count)}
            </span>
          </div>
        );
      })}
    </section>
  );
}
