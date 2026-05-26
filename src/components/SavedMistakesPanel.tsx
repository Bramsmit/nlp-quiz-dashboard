import { BookOpenCheck, RotateCcw, Trash2, X } from "lucide-react";
import { getAnswerLabels } from "../lib/quiz";
import type { SavedMistake } from "../lib/savedMistakes";

type SavedMistakesPanelProps = {
  savedMistakes: SavedMistake[];
  onPractice: () => void;
  onRemove: (questionId: string) => void;
  onClear: () => void;
};

export default function SavedMistakesPanel({
  savedMistakes,
  onPractice,
  onRemove,
  onClear,
}: SavedMistakesPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Long-term review
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">
            Saved mistakes
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Questions you missed across sessions are saved in this browser so
            you can review them right before the exam.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            onClick={onPractice}
            disabled={savedMistakes.length === 0}
          >
            <RotateCcw className="h-4 w-4" />
            Practise saved mistakes
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            onClick={onClear}
            disabled={savedMistakes.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Clear saved
          </button>
        </div>
      </div>

      {savedMistakes.length === 0 ? (
        <p className="mt-5 rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          No saved mistakes yet. Finish a quiz with at least one incorrect
          answer to start building this review list.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {savedMistakes.map((mistake) => (
            <article
              key={mistake.question.id}
              className="rounded border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">
                      <BookOpenCheck className="h-3.5 w-3.5" />
                      Missed {mistake.timesMissed}x
                    </span>
                    <span className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                      {mistake.question.topic}
                    </span>
                  </div>
                  <h3 className="font-semibold leading-7 text-slate-950">
                    {mistake.question.question}
                  </h3>
                </div>
                <button
                  type="button"
                  className="rounded p-1.5 text-slate-500 transition hover:bg-white hover:text-rose-700"
                  onClick={() => onRemove(mistake.question.id)}
                  aria-label={`Remove ${mistake.question.id} from saved mistakes`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <dl className="mt-3 space-y-2 text-sm leading-6">
                <div>
                  <dt className="font-semibold text-rose-700">
                    Last wrong answer
                  </dt>
                  <dd className="text-slate-700">
                    {getAnswerLabels(mistake.question, mistake.lastSelectedAnswers)}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-emerald-700">
                    Correct answer
                  </dt>
                  <dd className="text-slate-700">
                    {getAnswerLabels(
                      mistake.question,
                      mistake.question.correctAnswers,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-800">Explanation</dt>
                  <dd className="text-slate-700">{mistake.question.explanation}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
