"use client";

import { useLocalStorage } from "@/lib/hooks";
import type { ExampleItem, TokenizerInfo } from "@/lib/types";
import { useTokenize } from "@/lib/hooks";
import { ContextMeter } from "./ContextMeter";
import { CopyDownload } from "./CopyDownload";
import { CostEstimator } from "./CostEstimator";
import { StatsBar } from "./StatsBar";
import { TextInput } from "./TextInput";
import { TokenStream } from "./TokenStream";
import { TokenizerSelector } from "./TokenizerSelector";

interface PlaygroundProps {
  text: string;
  onTextChange: (text: string) => void;
  tokenizer: string;
  onTokenizerChange: (id: string) => void;
  tokenizers: TokenizerInfo[] | null;
  tokenizersError: string | null;
  debouncedText: string;
  examples: ExampleItem[];
  examplesLoading: boolean;
}

export function Playground({
  text,
  onTextChange,
  tokenizer,
  onTokenizerChange,
  tokenizers,
  tokenizersError,
  debouncedText,
  examples,
  examplesLoading,
}: PlaygroundProps) {
  const { status, data, error, refreshing } = useTokenize(debouncedText, tokenizer);
  const [colorblindSafe, setColorblindSafe] = useLocalStorage("tp-colorblind-safe", false);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-x-3">
        <TokenizerSelector
          tokenizers={tokenizers}
          error={tokenizersError}
          value={tokenizer}
          onChange={onTokenizerChange}
        />
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 self-end rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 sm:ml-auto sm:self-auto">
          <input
            type="checkbox"
            checked={colorblindSafe}
            onChange={(event) => setColorblindSafe(event.target.checked)}
            className="h-3.5 w-3.5 rounded accent-indigo-600"
          />
          Colorblind-safe colors
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <TextInput
          value={text}
          onChange={onTextChange}
          examples={examples}
          examplesLoading={examplesLoading}
          maxLength={20_000}
        />
      </div>

      <StatsBar result={data} refreshing={refreshing} />

      <TokenStream
        result={data}
        status={status}
        refreshing={refreshing}
        error={error}
        palette="friendly"
        colorblindSafe={colorblindSafe}
      />

      <CopyDownload result={data} text={text} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ContextMeter tokenCount={data?.token_count ?? 0} />
        <CostEstimator tokenCount={data?.token_count ?? 0} tokenizerId={tokenizer} />
      </div>
    </div>
  );
}
