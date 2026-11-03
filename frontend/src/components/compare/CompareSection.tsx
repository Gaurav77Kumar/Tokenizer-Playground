"use client";

import { useMemo, useState } from "react";
import { useCompare } from "@/lib/hooks";
import { formatNumber } from "@/lib/hooks";
import type { ExampleItem, TokenizerInfo } from "@/lib/types";
import { TextInput } from "../playground/TextInput";
import { CompareChart } from "./CompareChart";
import { CompareGrid } from "./CompareGrid";

const MAX_COMPARED = 4;
const MIN_COMPARED = 2;
const DEFAULT_SELECTION = ["o200k_base", "gpt2"];

interface CompareSectionProps {
  text: string;
  onTextChange: (text: string) => void;
  tokenizers: TokenizerInfo[] | null;
  debouncedText: string;
  examples: ExampleItem[];
  examplesLoading: boolean;
}

export function CompareSection({
  text,
  onTextChange,
  tokenizers,
  debouncedText,
  examples,
  examplesLoading,
}: CompareSectionProps) {
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTION);
  const { status, data, error, refreshing } = useCompare(debouncedText, selected);

  const toggle = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) {
        return current.length <= MIN_COMPARED ? current : current.filter((t) => t !== id);
      }
      if (current.length >= MAX_COMPARED) return current;
      return [...current, id];
    });
  };

  const order = useMemo(() => selected, [selected]);
  const results = data ? order.map((id) => data.results[id]).filter(Boolean) : [];
  const counts = results.map((r) => r.token_count);
  const minCount = counts.length ? Math.min(...counts) : 0;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        The same text, read by {MIN_COMPARED}–{MAX_COMPARED} different tokenizers. Pick tokenizers
        below, edit the text, and watch the counts move.
      </p>

      {/* Tokenizer multi-select */}
      <fieldset
        aria-label="Tokenizers to compare"
        className="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <legend className="px-1 text-sm font-semibold">Tokenizers ({selected.length}/{MAX_COMPARED})</legend>
        <div className="flex flex-wrap gap-2">
          {(tokenizers ?? []).map((t) => {
            const checked = selected.includes(t.id);
            const disabled = !checked && selected.length >= MAX_COMPARED;
            return (
              <label
                key={t.id}
                className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 ${
                  checked
                    ? "bg-indigo-600 text-white ring-indigo-600"
                    : disabled
                      ? "bg-slate-100 text-slate-400 ring-slate-200"
                      : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(t.id)}
                  className="h-3 w-3"
                />
                {t.name}
                {t.vocab_size ? ` · ${formatNumber(t.vocab_size)}` : ""}
              </label>
            );
          })}
          {!tokenizers &&
            Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                className="h-8 w-36 animate-pulse rounded-full bg-slate-200"
              />
            ))}
        </div>
      </fieldset>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <TextInput
          value={text}
          onChange={onTextChange}
          examples={examples}
          examplesLoading={examplesLoading}
          maxLength={20_000}
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <p className="font-semibold">Comparison failed</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : status === "loading" && !data ? (
        <div aria-hidden className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {selected.map((id) => (
            <div
              key={id}
              className="h-40 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      ) : data && results.length >= MIN_COMPARED ? (
        <>
          <CompareChart results={results} fewest={data.summary.fewest} refreshing={refreshing} />
          <div
            role="status"
            className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-relaxed text-indigo-900"
          >
            <span aria-hidden className="mr-1">
              💡
            </span>
            {data.summary.insight}
          </div>
          <CompareGrid results={results} fewestCount={minCount} refreshing={refreshing} />
        </>
      ) : null}
    </div>
  );
}
