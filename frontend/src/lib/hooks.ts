"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import type { AsyncState, CompareResponse, TokenizeResult } from "./types";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

interface TokenizeState extends AsyncState<TokenizeResult> {
  refreshing: boolean;
}

/**
 * Live tokenization with request cancellation. The previous successful
 * result stays on screen while refreshing, so nothing jumps.
 */
export function useTokenize(text: string, tokenizer: string): TokenizeState {
  const [state, setState] = useState<TokenizeState>({
    status: "idle",
    data: null,
    error: null,
    refreshing: false,
  });
  const hasData = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({
      ...prev,
      status: hasData.current ? "ready" : "loading",
      refreshing: true,
    }));

    api
      .tokenize(text, tokenizer)
      .then((data) => {
        if (cancelled) return;
        hasData.current = true;
        setState({ status: "ready", data, error: null, refreshing: false });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setState({ status: "error", data: null, error: error.message, refreshing: false });
      });

    return () => {
      cancelled = true;
    };
  }, [text, tokenizer]);

  return state;
}

interface CompareState extends AsyncState<CompareResponse> {
  /** True while a newer request is in flight (previous result still shown). */
  refreshing: boolean;
}

/** Compare-mode data loading — mirrors useTokenize against /api/compare. */
export function useCompare(text: string, tokenizers: string[]): CompareState {
  const key = tokenizers.join(",");
  const [state, setState] = useState<CompareState>({
    status: "idle",
    data: null,
    error: null,
    refreshing: false,
  });
  const hasData = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({
      ...prev,
      status: hasData.current ? "ready" : "loading",
      refreshing: true,
    }));

    api
      .compare(text, key ? key.split(",") : [])
      .then((data) => {
        if (cancelled) return;
        hasData.current = true;
        setState({ status: "ready", data, error: null, refreshing: false });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setState({ status: "error", data: null, error: error.message, refreshing: false });
      });

    return () => {
      cancelled = true;
    };
  }, [text, key]);

  return state;
}

/** State persisted to localStorage (SSR-safe: reads after mount). */export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch {
      // corrupted entry — fall back to the initial value
    }
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = typeof next === "function" ? (next as (c: T) => T)(current) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage full or blocked — in-memory state still works
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

export function useCopyToClipboard(resetAfterMs = 1500) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), resetAfterMs);
    return () => window.clearTimeout(timer);
  }, [copied, resetAfterMs]);

  const copy = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  return [copied, copy] as const;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
