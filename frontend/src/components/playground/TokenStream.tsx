"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { MAX_RENDERED_TOKENS } from "@/config/limits";
import type { PaletteName } from "@/config/palette";
import { useCopyToClipboard, formatNumber } from "@/lib/hooks";
import type { TokenItem, TokenizeResult, TokenizeStatus } from "@/lib/types";
import { TokenChip, visualize } from "./TokenChip";
import { TokenTooltip, type TooltipAnchor } from "./TokenTooltip";

type StreamView = "text" | "ids" | "bytes";

const VIEWS: { id: StreamView; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "ids", label: "Token IDs" },
  { id: "bytes", label: "Bytes" },
];

interface TokenStreamProps {
  result: TokenizeResult | null;
  status: TokenizeStatus;
  refreshing: boolean;
  error: string | null;
  palette: PaletteName;
  colorblindSafe: boolean;
}

export function TokenStream({ result, status, refreshing, error, palette, colorblindSafe }: TokenStreamProps) {
  const [view, setView] = useState<StreamView>("text");
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<TooltipAnchor | null>(null);

  // Escape clears a pinned tooltip; clicking elsewhere too.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPinned(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tokens = result?.tokens ?? [];
  const shown = useMemo(() => tokens.slice(0, MAX_RENDERED_TOKENS), [tokens]);
  const activeIndex = hovered ?? pinned;
  const activeToken = activeIndex !== null ? tokens[activeIndex] : undefined;
  const animate = tokens.length <= 200;

  const activate = (index: number, rect: TooltipAnchor) => {
    setAnchor(rect);
  };

  if (error && !result) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      >
        <p className="font-semibold">Tokenization failed</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  return (
    <section aria-label="Token view" className="relative">
      {/* View tabs */}
      <div
        role="tablist"
        aria-label="Token display mode"
        className="mb-3 flex flex-wrap items-center gap-2"
      >
        {VIEWS.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={view === v.id}
            onClick={() => setView(v.id)}
            className={`inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              view === v.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {v.label}
          </button>
        ))}
        {refreshing && status === "ready" && (
          <span className="ml-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" aria-hidden />
            tokenizing…
          </span>
        )}
      </div>

      {/* Panels */}
      {status === "loading" && !result ? (
        <StreamSkeleton />
      ) : tokens.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Type something above and its tokens will appear here — colors show where one token ends
          and the next begins.
        </div>
      ) : (
        <div
          className={`rounded-xl border border-slate-200 bg-white p-4 transition-opacity ${
            refreshing ? "opacity-60" : ""
          }`}
        >
          {view === "text" && (
            <div className="flex flex-wrap items-start gap-1.5" onMouseLeave={() => setHovered(null)}>
              {shown.map((token, i) => (
                <TokenChip
                  key={`${i}-${token.id}-${token.start}`}
                  token={token}
                  index={i}
                  palette={colorblindSafe ? "colorblind" : palette}
                  active={activeIndex === i}
                  animate={animate}
                  onHover={(index) => {
                    setHovered(index);
                    if (index === null) setAnchor(null);
                  }}
                  onActivate={(index, rect) => {
                    setAnchor(rect);
                  }}
                  onPin={(index) => setPinned((prev) => (prev === index ? null : index))}
                />
              ))}
              {tokens.length > MAX_RENDERED_TOKENS && (
                <p className="mt-2 w-full text-xs text-slate-500">
                  Showing the first {formatNumber(MAX_RENDERED_TOKENS)} of{" "}
                  {formatNumber(tokens.length)} tokens to keep things fast.
                </p>
              )}
            </div>
          )}

          {view === "ids" && <IdsView tokens={shown} total={tokens.length} activeIndex={activeIndex} onHover={setHovered} />}

          {view === "bytes" && <BytesView tokens={shown} total={tokens.length} activeIndex={activeIndex} onHover={setHovered} />}
        </div>
      )}

      {/* Legend */}
      <p className="mt-2 text-xs text-slate-500">
        <span className="font-mono">·</span> space · <span className="font-mono">↵</span> newline ·{" "}
        <span className="font-mono">⇥</span> tab · <span aria-hidden>⚡</span> special token · hover
        or tap a chip for details
      </p>

      {/* Tooltip */}
      <AnimatePresence>
        {activeToken && anchor && (
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
          >
            <TokenTooltip token={activeToken} anchor={anchor} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function StreamSkeleton() {
  const widths = [64, 40, 88, 56, 72, 48, 96, 40, 64, 80, 56, 48, 72, 64, 40];
  return (
    <div
      aria-hidden
      className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-4"
    >
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-7 animate-pulse rounded-md bg-slate-200"
          style={{ width: w, animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

interface ListViewProps {
  tokens: TokenItem[];
  total: number;
  activeIndex: number | null;
  onHover: (index: number | null) => void;
}

function IdsView({ tokens, total, activeIndex, onHover }: ListViewProps) {
  const [copied, copy] = useCopyToClipboard();
  const ids = tokens.map((t) => t.id);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => copy(JSON.stringify(ids))}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {copied ? "Copied ✓" : "Copy IDs as JSON"}
        </button>
        <span className="text-xs text-slate-500">
          These numbers are what the model actually reads. Hover one to find it in the Text view.
        </span>
      </div>
      <div className="flex flex-wrap gap-1 font-mono text-sm">
        {tokens.map((token, i) => (
          <button
            key={`${i}-${token.id}`}
            type="button"
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(i)}
            onBlur={() => onHover(null)}
            aria-label={`Token ${i + 1}, id ${token.id}`}
            className={`rounded px-1.5 py-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeIndex === i
                ? "bg-indigo-600 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            title={visualize(token.text)}
          >
            {token.id}
          </button>
        ))}
        {total > tokens.length && <span className="text-xs text-slate-500">… ({formatNumber(total)} total)</span>}
      </div>
    </div>
  );
}

function BytesView({ tokens, total, activeIndex, onHover }: ListViewProps) {
  return (
    <div>
      <p className="mb-3 text-xs text-slate-500">
        Every token is stored as raw UTF-8 bytes — this is the level the vocabulary actually works
        at. Hover a row to find it in the Text view.
      </p>
      <div className="space-y-0.5 font-mono text-xs">
        {tokens.slice(0, 300).map((token, i) => (
          <div
            key={`${i}-${token.start}`}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            className={`flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded px-2 py-1 transition-colors ${
              activeIndex === i
                ? "bg-indigo-600 text-white"
                : i % 2 === 0
                  ? "bg-slate-50"
                  : ""
            }`}
          >
            <span className={`w-8 text-right ${activeIndex === i ? "" : "text-slate-400"}`}>
              {i}
            </span>
            <span className="w-16 text-right font-semibold">{token.id}</span>
            <span className={activeIndex === i ? "text-indigo-100" : "text-slate-500"}>
              [{token.bytes.join(", ")}]
            </span>
            <span className="truncate">
              {visualize(token.text) || "␀"}
              {token.is_special && " ⚡"}
            </span>
          </div>
        ))}
        {total > 300 && (
          <p className="px-2 pt-2 text-slate-500">
            … and {formatNumber(total - 300)} more rows (showing the first 300).
          </p>
        )}
      </div>
    </div>
  );
}
