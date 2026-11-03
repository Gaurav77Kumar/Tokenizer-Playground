"use client";

import { useEffect, useRef } from "react";
import { GLOSSARY } from "@/config/glossary";

interface GlossaryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function GlossaryDialog({ open, onClose }: GlossaryDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Glossary"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Glossary</h2>
          <button
            type="button"
            ref={closeRef}
            onClick={onClose}
            aria-label="Close glossary"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            ✕
          </button>
        </div>
        <dl className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          {GLOSSARY.map((entry) => (
            <div
              key={entry.term}
              className="rounded-xl bg-slate-50 p-3"
            >
              <dt className="text-sm font-semibold">{entry.term}</dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-slate-600">
                {entry.definition}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
