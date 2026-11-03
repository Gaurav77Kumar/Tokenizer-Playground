"use client";

import { LESSONS } from "@/config/lessons";
import { LessonCard } from "./LessonCard";
import { BpeDemo } from "./BpeDemo";
import { Challenges } from "./Challenges";

interface LearnSectionProps {
  onTryIt: (text: string, tokenizer: string) => void;
}

export function LearnSection({ onTryIt }: LearnSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Why does this matter?</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
          Nine short lessons, each with a hands-on experiment. When something surprises you, take it
          to the playground and try to break it.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {LESSONS.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} onTryIt={onTryIt}>
            {lesson.demo === "bpe" && <BpeDemo />}
          </LessonCard>
        ))}
      </div>

      <Challenges onTryInPlayground={onTryIt} />
    </div>
  );
}
