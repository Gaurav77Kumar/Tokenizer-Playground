"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { noteForAlgorithm } from "@/config/algorithms";
import { formatNumber } from "@/lib/hooks";
import type { TokenizerInfo } from "@/lib/types";

interface TokenizerSelectorProps {
  tokenizers: TokenizerInfo[] | null;
  error: string | null;
  value: string;
  onChange: (id: string) => void;
}

export function TokenizerSelector({ tokenizers, error, value, onChange }: TokenizerSelectorProps) {
  const [showInfo, setShowInfo] = useState(false);
  const selected = tokenizers?.find((t) => t.id === value) ?? null;
  const algoNote = selected ? noteForAlgorithm(selected.algorithm) : null;

  return (
    <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
      <label
        htmlFor="tokenizer-select"
        className="order-1 inline-flex h-9 items-center text-sm font-medium"
      >
        Tokenizer
      </label>

      <button
        type="button"
        onClick={() => setShowInfo((v) => !v)}
        aria-expanded={showInfo}
        aria-label="About this tokenizer and its algorithm"
        className="order-2 ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:order-3 sm:ml-0"
      >
        i
      </button>

      {tokenizers ? (
        <select
          id="tokenizer-select"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="order-3 inline-flex h-9 w-full items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:order-2 sm:w-auto sm:max-w-full"
        >
          {tokenizers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
              {t.vocab_size ? ` · ${formatNumber(t.vocab_size)} vocab` : ""}
            </option>
          ))}
        </select>
      ) : error ? (
        <span className="order-3 inline-flex h-9 w-full items-center rounded-lg bg-red-50 px-3 text-sm text-red-700 sm:w-auto">
          offline
        </span>
      ) : (
        <div
          aria-hidden
          className="order-3 h-9 w-full animate-pulse rounded-lg bg-slate-200 sm:w-64"
        />
      )}

      <AnimatePresence>
        {showInfo && selected && algoNote && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-11 z-40 w-[min(26rem,calc(100vw-2rem))]"
            role="note"
          >
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
              <p className="text-sm font-semibold">{selected.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {selected.description}
              </p>
              <div className="mt-3 rounded-lg bg-indigo-50 p-3">
                <p className="text-xs font-semibold text-indigo-700">
                  {algoNote.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-indigo-900/80">
                  {algoNote.body}
                </p>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Library: {selected.library}
                {selected.vocab_size ? ` · vocabulary: ${formatNumber(selected.vocab_size)} tokens` : ""}
              </p>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="mt-2 text-xs font-medium text-slate-500 underline hover:text-slate-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
