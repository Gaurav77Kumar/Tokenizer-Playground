"use client";

import { useEffect, useState } from "react";
import { DEFAULT_REQUEST_COUNT, defaultPriceFor } from "@/config/prices";
import { formatNumber } from "@/lib/hooks";

interface CostEstimatorProps {
  tokenCount: number;
  tokenizerId: string;
}

function formatCost(usd: number): string {
  if (usd === 0) return "$0";
  if (usd < 0.01) return `$${usd.toFixed(5)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function CostEstimator({ tokenCount, tokenizerId }: CostEstimatorProps) {
  const [price, setPrice] = useState(defaultPriceFor(tokenizerId));
  const [requests, setRequests] = useState(DEFAULT_REQUEST_COUNT);

  // When the tokenizer (model family) changes, load its example price.
  useEffect(() => {
    setPrice(defaultPriceFor(tokenizerId));
  }, [tokenizerId]);

  const perRequest = (tokenCount / 1_000_000) * price;
  const total = perRequest * requests;

  return (
    <section
      aria-label="Cost estimator"
      className="rounded-xl border border-slate-200 bg-white p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Cost estimator</h3>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
          example prices
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-500">
          Price per 1M input tokens ($)
          <input
            type="number"
            min={0}
            step={0.01}
            value={price}
            onChange={(event) => setPrice(Math.max(0, Number(event.target.value) || 0))}
            className="mt-1 inline-flex h-9 w-full items-center rounded-lg border border-slate-300 bg-white px-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          />
        </label>
        <label className="text-xs text-slate-500">
          Number of requests
          <input
            type="number"
            min={0}
            step={1}
            value={requests}
            onChange={(event) => setRequests(Math.max(0, Math.round(Number(event.target.value) || 0)))}
            className="mt-1 inline-flex h-9 w-full items-center rounded-lg border border-slate-300 bg-white px-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          />
        </label>
      </div>

      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">One request ({formatNumber(tokenCount)} tokens)</dt>
          <dd className="font-semibold tabular-nums">{formatCost(perRequest)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">
            {formatNumber(requests)} requests
          </dt>
          <dd className="text-base font-bold tabular-nums text-indigo-600">
            {formatCost(total)}
          </dd>
        </div>
      </dl>

      <p className="mt-2 text-[11px] leading-snug text-slate-400">
        Editable defaults, just examples — always check your provider&apos;s current pricing. Real
        costs also include output tokens.
      </p>
    </section>
  );
}
