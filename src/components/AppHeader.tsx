import { BrainCircuit, RotateCcw } from "lucide-react";
import type { QuizBank, QuizPhase } from "../lib/quiz";

type AppHeaderProps = {
  metadata: QuizBank["metadata"];
  phase: QuizPhase;
  onReset: () => void;
};

export default function AppHeader({ metadata, phase, onReset }: AppHeaderProps) {
  return (
    <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-emerald-100 text-emerald-700">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              NLP exam preparation
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
              Interactive quiz dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {metadata.questionCount} questions · version {metadata.version} · language{" "}
              {metadata.language}
            </p>
          </div>
        </div>

        {phase !== "setup" ? (
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
            Reset session
          </button>
        ) : null}
      </div>
    </header>
  );
}
