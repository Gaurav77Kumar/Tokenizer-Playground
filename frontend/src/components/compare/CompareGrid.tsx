"use client";

import { MAX_RENDERED_TOKENS } from "@/config/limits";
import { formatNumber } from "@/lib/hooks";
import type { TokenizeResult } from "@/lib/types";
import { TokenChip, visualize } from "../playground/TokenChip";

interface CompareGridProps {
  results: TokenizeResult[];
  fewestCount: number;
  refreshing: boolean;
}

/** One card per tokenizer: mini chips, per-tokenizer stats, efficiency badge. */
export function CompareGrid({ results, fewestCount, refreshing }: CompareGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 ${
        refreshing ? "opacity-60" : ""
      }`}
    >
      {results.map((result) => {
        const isWinner = result.token_count === fewestCount;
        const shown = result.tokens.slice(0, MAX_RENDERED_TOKENS);
        return (
          <section
            key={result.tokenizer}
            aria-label={`Tokens for ${result.tokenizer}`}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold leading-tight">{result.tokenizer}</h3>
                <p className="text-xs text-slate-500">
                  {formatNumber(result.token_count)} tokens ·{" "}
                  {result.chars_per_token.toFixed(2)} chars/token
                </p>
              </div>
              {isWinner && (
                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  most efficient
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1 rounded-xl bg-slate-50 p-2.5">
              {shown.map((token, i) => (
                <TokenChip
                  key={`${i}-${token.id}-${token.start}`}
                  token={token}
                  index={i}
                  palette="friendly"
                  active={false}
                  animate={false}
                  onHover={() => undefined}
                  onActivate={() => undefined}
                  onPin={() => undefined}
                />
              ))}
              {result.tokens.length > MAX_RENDERED_TOKENS && (
                <span className="text-xs text-slate-400">
                  +{formatNumber(result.tokens.length - MAX_RENDERED_TOKENS)} more…
                </span>
              )}
              {result.tokens.length === 0 && (
                <span className="text-xs text-slate-400">No tokens — the text is empty.</span>
              )}
            </div>

            {shown.some((t) => t.piece) && (
              <p
                className="mt-2 line-clamp-1 text-[11px] text-slate-400"
                title={shown.find((t) => t.piece)?.piece ?? undefined}
              >
                vocabulary form example:{" "}
                <span className="font-mono">
                  {visualize(shown.find((t) => t.piece)?.piece ?? "")}
                </span>
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
