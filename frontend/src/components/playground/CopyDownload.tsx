"use client";

import { downloadJson, formatNumber, useCopyToClipboard } from "@/lib/hooks";
import type { TokenizeResult } from "@/lib/types";

interface CopyDownloadProps {
  result: TokenizeResult | null;
  text: string;
}

export function CopyDownload({ result, text }: CopyDownloadProps) {
  const [copiedJson, copyJson] = useCopyToClipboard();
  const [copiedIds, copyIds] = useCopyToClipboard();

  if (!result) return null;

  const payload = { input: text, ...result };

  const buttonClass =
    "inline-flex h-8 items-center rounded-lg bg-white px-3 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:ring-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => copyJson(JSON.stringify(payload, null, 2))}
        className={buttonClass}
      >
        {copiedJson ? "Copied ✓" : "Copy as JSON"}
      </button>
      <button
        type="button"
        onClick={() => copyIds(JSON.stringify(result.tokens.map((t) => t.id)))}
        className={buttonClass}
      >
        {copiedIds ? "Copied ✓" : `Copy token IDs (${formatNumber(result.token_count)})`}
      </button>
      <button type="button" onClick={() => downloadJson("tokenization-result.json", payload)} className={buttonClass}>
        Download results
      </button>
    </div>
  );
}
