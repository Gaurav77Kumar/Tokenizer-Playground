"use client";

import type { Lesson } from "@/config/lessons";

interface LessonCardProps {
  lesson: Lesson;
  onTryIt: (text: string, tokenizer: string) => void;
  children?: React.ReactNode;
}

export function LessonCard({ lesson, onTryIt, children }: LessonCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold">{lesson.title}</h3>
      <div className="mt-2 flex-1 space-y-2">
        {lesson.body.map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-slate-600">
            {paragraph}
          </p>
        ))}
      </div>

      {children}

      <div className="mt-3 flex items-center gap-3">
        {lesson.tryIt && (
          <button
            type="button"
            onClick={() => onTryIt(lesson.tryIt!.text, lesson.tryIt!.tokenizer)}
            className="inline-flex h-9 items-center rounded-lg bg-indigo-600 px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            ▶ Try it
          </button>
        )}
        {lesson.tryIt?.note && (
          <p className="text-xs text-slate-500">{lesson.tryIt.note}</p>
        )}
      </div>
    </article>
  );
}
