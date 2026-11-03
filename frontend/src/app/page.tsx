"use client";

import { useCallback, useEffect, useState } from "react";
import { Header, type View } from "@/components/Header";
import { GlossaryDialog } from "@/components/GlossaryDialog";
import { CompareSection } from "@/components/compare/CompareSection";
import { LearnSection } from "@/components/learn/LearnSection";
import { Playground } from "@/components/playground/Playground";
import { api } from "@/lib/api";
import { useDebouncedValue } from "@/lib/hooks";
import type { ExampleItem, TokenizerInfo } from "@/lib/types";
import { FALLBACK_EXAMPLES } from "@/config/examples";

const VIEWS: readonly View[] = ["playground", "compare", "learn"];
const DEFAULT_TEXT =
  "Hello! Tokenization is how AI reads your text — try editing me. 🚀";
const DEFAULT_TOKENIZER = "cl100k_base";
const DEBOUNCE_MS = 250;

export default function HomePage() {
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("playground");
  const [text, setText] = useState(DEFAULT_TEXT);
  const [tokenizer, setTokenizer] = useState(DEFAULT_TOKENIZER);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const [tokenizers, setTokenizers] = useState<TokenizerInfo[] | null>(null);
  const [tokenizersError, setTokenizersError] = useState<string | null>(null);
  const [examples, setExamples] = useState<ExampleItem[]>(FALLBACK_EXAMPLES as ExampleItem[]);
  const [examplesLoading, setExamplesLoading] = useState(true);

  const debouncedText = useDebouncedValue(text, DEBOUNCE_MS);

  // Restore shareable state from the URL, then load data from the backend.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlText = params.get("text");
    if (urlText !== null) setText(urlText);
    const urlTokenizer = params.get("tokenizer");
    if (urlTokenizer) setTokenizer(urlTokenizer);
    const urlView = params.get("view");
    if (urlView && VIEWS.includes(urlView as View)) setView(urlView as View);
    setHydrated(true);

    api
      .tokenizers()
      .then(setTokenizers)
      .catch((error: Error) => setTokenizersError(error.message));
    api
      .examples()
      .then(setExamples)
      .catch(() => undefined) // fall back to the local copy
      .finally(() => setExamplesLoading(false));
  }, []);

  // Drop an unknown ?tokenizer= (e.g. a stale share link) once the list arrives.
  useEffect(() => {
    if (tokenizers && !tokenizers.some((t) => t.id === tokenizer)) {
      setTokenizer(tokenizers[0]?.id ?? DEFAULT_TOKENIZER);
    }
  }, [tokenizers, tokenizer]);

  // Keep the URL shareable without triggering navigation.
  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams();
    if (debouncedText !== DEFAULT_TEXT) params.set("text", debouncedText);
    params.set("tokenizer", tokenizer);
    if (view !== "playground") params.set("view", view);
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [hydrated, debouncedText, tokenizer, view]);

  const tryInPlayground = useCallback((lessonText: string, lessonTokenizer: string) => {
    setText(lessonText);
    setTokenizer(lessonTokenizer);
    setView("playground");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <Header view={view} onViewChange={setView} onOpenGlossary={() => setGlossaryOpen(true)} />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        {/* Hero — the page is never empty on first load */}
        <section className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            See how AI reads your text <span aria-hidden>👀</span>
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Language models never see letters — they see <strong>tokens</strong>: chunks from a
            fixed menu called the vocabulary. Type below and watch the chunks light up, then find
            out why it changes what models cost, how much they remember, and how they behave.
          </p>
        </section>

        {tokenizersError && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <p className="font-semibold">Tokenizers not reachable</p>
            <p className="mt-1 leading-relaxed">
              {tokenizersError} The very first request can take a minute while the tokenizer files
              download.
            </p>
            <button
              type="button"
              onClick={() => {
                setTokenizersError(null);
                api
                  .tokenizers()
                  .then(setTokenizers)
                  .catch((error: Error) => setTokenizersError(error.message));
              }}
              className="mt-2 rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Retry
            </button>
          </div>
        )}

        {!hydrated ? (
          <div aria-hidden className="space-y-4">
            <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : view === "playground" ? (
          <Playground
            text={text}
            onTextChange={setText}
            tokenizer={tokenizer}
            onTokenizerChange={setTokenizer}
            tokenizers={tokenizers}
            tokenizersError={tokenizersError}
            debouncedText={debouncedText}
            examples={examples}
            examplesLoading={examplesLoading}
          />
        ) : view === "compare" ? (
          <CompareSection
            text={text}
            onTextChange={setText}
            tokenizers={tokenizers}
            debouncedText={debouncedText}
            examples={examples}
            examplesLoading={examplesLoading}
          />
        ) : (
          <LearnSection onTryIt={tryInPlayground} />
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-xs text-slate-400">
        Tokenizer Playground · Built with FastAPI, tiktoken and Hugging Face transformers.
      </footer>

      <GlossaryDialog open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </>
  );
}
