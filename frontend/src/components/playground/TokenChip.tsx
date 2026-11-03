"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { CHIP_TEXT_COLOR, chipColor, type PaletteName } from "@/config/palette";
import type { TokenItem } from "@/lib/types";

/** Visible markers for invisible characters. */
export function visualize(text: string): string {
  return text.replaceAll(" ", "·").replaceAll("\n", "↵").replaceAll("\t", "⇥");
}

export function tokenAriaLabel(token: TokenItem): string {
  const what = token.is_special
    ? "special token"
    : token.is_whitespace
      ? "whitespace token"
      : "token";
  const display = token.text.replace(/\n/g, "newline").replace(/ /g, "space") || "empty";
  return `${what} ${display}, id ${token.id}, ${token.bytes.length} bytes`;
}

interface TokenChipProps {
  token: TokenItem;
  index: number;
  palette: PaletteName;
  active: boolean;
  animate: boolean;
  onHover: (index: number | null) => void;
  onActivate: (index: number, rect: { top: number; left: number; bottom: number }) => void;
  onPin: (index: number) => void;
}

function TokenChipInner({
  token,
  index,
  palette,
  active,
  animate,
  onHover,
  onActivate,
  onPin,
}: TokenChipProps) {
  const background = token.is_special ? "#e9d5ff" : chipColor(index, palette);

  return (
    <motion.button
      type="button"
      initial={animate ? { opacity: 0, scale: 0.7 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.012, 0.4) }}
      onMouseEnter={(event) => {
        onHover(index);
        const rect = event.currentTarget.getBoundingClientRect();
        onActivate(index, { top: rect.top, left: rect.left, bottom: rect.bottom });
      }}
      onMouseLeave={() => onHover(null)}
      onFocus={(event) => {
        onHover(index);
        const rect = event.currentTarget.getBoundingClientRect();
        onActivate(index, { top: rect.top, left: rect.left, bottom: rect.bottom });
      }}
      onBlur={() => onHover(null)}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onActivate(index, { top: rect.top, left: rect.left, bottom: rect.bottom });
        onPin(index);
      }}
      className={`relative rounded-md border border-black/5 px-1.5 py-0.5 font-mono text-sm transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        active ? "z-10 shadow-md ring-2 ring-slate-900" : ""
      }`}
      style={{ backgroundColor: background, color: CHIP_TEXT_COLOR }}
      aria-label={tokenAriaLabel(token)}
    >
      {visualize(token.text) || "␀"}
      {token.is_special && (
        <span aria-hidden className="absolute -right-1.5 -top-1.5 text-[10px] leading-none">
          ⚡
        </span>
      )}
    </motion.button>
  );
}

export const TokenChip = memo(TokenChipInner);
