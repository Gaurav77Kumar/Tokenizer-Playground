"use client";

import { visualize } from "./TokenChip";
import { noteForToken } from "@/lib/tokenNotes";
import { formatNumber } from "@/lib/hooks";
import type { TokenItem } from "@/lib/types";

export interface TooltipAnchor {
  top: number;
  left: number;
  bottom: number;
}

interface TokenTooltipProps {
  token: TokenItem;
  anchor: TooltipAnchor;
}

/** Floating details card for a single token. Fixed-position, viewport-clamped. */
export function TokenTooltip({ token, anchor }: TokenTooltipProps) {
  const width = 320;
  const left = Math.max(8, Math.min(anchor.left - width / 3, window.innerWidth - width - 12));
  const placeBelow = anchor.top > 280;
  const style: React.CSSProperties = {
    position: "fixed",
    left,
    width,
    ...(placeBelow ? { top: anchor.bottom + 8 } : { bottom: window.innerHeight - anchor.top + 8 }),
  };

  const bytes = token.bytes;
  const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");
  const charSpan =
    token.start === token.end
      ? `inside character ${formatNumber(token.start)} (multi-byte character split across tokens)`
      : `characters ${formatNumber(token.start)}–${formatNumber(token.end)}`;

  return (
    <div
      role="tooltip"
      style={style}
      className="z-50 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xl"
    >
      <div className="mb-2 break-all rounded-md bg-slate-100 px-2 py-1 font-mono text-base">
        {visualize(token.text) || "␀"}
      </div>
      <dl className="space-y-1 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Token ID</dt>
          <dd className="font-mono font-semibold">{formatNumber(token.id)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Bytes ({bytes.length})</dt>
          <dd className="text-right font-mono">{bytes.join(" ")}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Hex</dt>
          <dd className="text-right font-mono text-slate-600">{hex}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Span</dt>
          <dd className="font-mono">{charSpan}</dd>
        </div>
        {token.piece && (
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Vocabulary form</dt>
            <dd className="font-mono">{token.piece}</dd>
          </div>
        )}
        {token.is_special && (
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Type</dt>
            <dd className="font-semibold text-purple-600">⚡ special token</dd>
          </div>
        )}
      </dl>
      <p className="mt-2 border-t border-slate-200 pt-2 text-xs leading-snug text-slate-600">
        {noteForToken(token)}
      </p>
    </div>
  );
}
