import { XCircle } from "lucide-react";
import { getAnswerLabels, type AnswerHistory } from "../../lib/quiz";
import type { MistakeExplanation } from "../../lib/mistakeExplanations";
import type { AiExplanationStatus } from "../../hooks/useMistakeExplanations";

type MistakeReviewProps = {
  mistakes: AnswerHistory[];
  aiExplanations: Record<string, MistakeExplanation>;
  aiStatus: AiExplanationStatus;
};

export default function MistakeReview({
  mistakes,
  aiExplanations,
  aiStatus,
}: MistakeReviewProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="flex items-center gap-2">
        <XCircle className="h-5 w-5 text-rose-600" />
        <h3 className="text-lg font-semibold text-slate-950">Mistake review</h3>
      </div>

      {mistakes.length > 0 ? <AiStatusMessage status={aiStatus} /> : null}

      {mistakes.length === 0 ? (
        <p className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          No mistakes in this session.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {mistakes.map((entry, index) => (
            <MistakeCard
              key={`${entry.question.id}-${index}`}
              entry={entry}
              explanation={aiExplanations[entry.question.id]}
              isLoading={aiStatus === "loading"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AiStatusMessage({ status }: { status: AiExplanationStatus }) {
  const message =
    status === "loading"
      ? "Generating extra AI explanations for your mistakes..."
      : status === "ready"
        ? "Extra AI explanations are shown below each missed question."
        : status === "error"
          ? "AI explanations are unavailable. The built-in explanations are still shown."
          : "Built-in explanations are shown below.";

  return (
    <p className="mt-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
      {message}
    </p>
  );
}

function MistakeCard({
  entry,
  explanation,
  isLoading,
}: {
  entry: AnswerHistory;
  explanation?: MistakeExplanation;
  isLoading: boolean;
}) {
  return (
    <article className="rounded border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="font-semibold leading-7 text-slate-950">
          {entry.question.question}
        </h4>
        <span className="shrink-0 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
          {entry.question.topic}
        </span>
      </div>
      <dl className="mt-3 space-y-3 text-sm leading-6">
        <AnswerRow
          label="Your answer"
          tone="rose"
          value={getAnswerLabels(entry.question, entry.selectedAnswers)}
        />
        <AnswerRow
          label="Correct answer"
          tone="emerald"
          value={getAnswerLabels(entry.question, entry.question.correctAnswers)}
        />
        <div>
          <dt className="font-semibold text-slate-800">Why this matters</dt>
          <dd className="text-slate-700">
            Your selected set must exactly match the correct answer set.{" "}
            {entry.question.explanation}
          </dd>
        </div>
        <AiExplanationBlock explanation={explanation} isLoading={isLoading} />
      </dl>
    </article>
  );
}

function AnswerRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose";
}) {
  const toneClass = tone === "emerald" ? "text-emerald-700" : "text-rose-700";

  return (
    <div>
      <dt className={`font-semibold ${toneClass}`}>{label}</dt>
      <dd className="text-slate-700">{value}</dd>
    </div>
  );
}

function AiExplanationBlock({
  explanation,
  isLoading,
}: {
  explanation?: MistakeExplanation;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div>
        <dt className="font-semibold text-slate-800">AI explanation</dt>
        <dd className="text-slate-500">Loading extra context...</dd>
      </div>
    );
  }

  if (!explanation) {
    return null;
  }

  return (
    <div>
      <dt className="font-semibold text-slate-800">AI explanation</dt>
      <dd className="space-y-2 text-slate-700">
        <p>
          <span className="font-semibold text-rose-700">
            Likely misconception:{" "}
          </span>
          {explanation.misconception}
        </p>
        <p>
          <span className="font-semibold text-emerald-700">
            Correct reasoning:{" "}
          </span>
          {explanation.correctReasoning}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Study tip: </span>
          {explanation.studyTip}
        </p>
      </dd>
    </div>
  );
}
