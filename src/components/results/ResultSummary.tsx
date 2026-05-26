import { RotateCcw, Target } from "lucide-react";
import ProgressBar from "../ProgressBar";

type ResultSummaryProps = {
  correct: number;
  total: number;
  mistakesCount: number;
  onReset: () => void;
  onRetryMistakes: () => void;
};

export default function ResultSummary({
  correct,
  total,
  mistakesCount,
  onReset,
  onRetryMistakes,
}: ResultSummaryProps) {
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Result
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">
            {correct} of {total} correct
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Score {percentage}% · {mistakesCount} incorrect
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
            Reset session
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            onClick={onRetryMistakes}
            disabled={mistakesCount === 0}
          >
            <Target className="h-4 w-4" />
            Practise mistakes only
          </button>
        </div>
      </div>

      <div className="mt-6">
        <ProgressBar value={percentage} label="Accuracy" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Correct" value={correct} tone="emerald" />
        <Metric label="Incorrect" value={mistakesCount} tone="rose" />
        <Metric label="Total" value={total} tone="slate" />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "slate";
}) {
  const toneClass = {
    emerald: "text-emerald-700",
    rose: "text-rose-700",
    slate: "text-slate-950",
  }[tone];

  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
