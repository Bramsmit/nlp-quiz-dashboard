import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Target, XCircle } from "lucide-react";
import ProgressBar from "./ProgressBar";
import {
  fetchMistakeExplanations,
  type MistakeExplanation,
} from "../lib/mistakeExplanations";
import {
  calculateTopicStats,
  getAnswerLabels,
  type AnswerHistory,
  type OpenQuestion,
} from "../lib/quiz";

type ResultsViewProps = {
  history: AnswerHistory[];
  openQuestion?: OpenQuestion;
  openAnswer: string;
  onRetryMistakes: () => void;
  onReset: () => void;
};

export default function ResultsView({
  history,
  openQuestion,
  openAnswer,
  onRetryMistakes,
  onReset,
}: ResultsViewProps) {
  const correct = history.filter((entry) => entry.isCorrect).length;
  const wrong = history.length - correct;
  const percentage =
    history.length === 0 ? 0 : Math.round((correct / history.length) * 100);
  const mistakes = useMemo(
    () => history.filter((entry) => !entry.isCorrect),
    [history],
  );
  const topicStats = calculateTopicStats(history);
  const [aiExplanations, setAiExplanations] = useState<
    Record<string, MistakeExplanation>
  >({});
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );

  useEffect(() => {
    let cancelled = false;

    if (mistakes.length === 0) {
      setAiStatus("idle");
      setAiExplanations({});
      return;
    }

    setAiStatus("loading");
    setAiExplanations({});

    fetchMistakeExplanations(mistakes)
      .then((explanations) => {
        if (cancelled) {
          return;
        }

        setAiExplanations(
          Object.fromEntries(
            explanations.map((explanation) => [
              explanation.questionId,
              explanation,
            ]),
          ),
        );
        setAiStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setAiStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mistakes]);

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Result
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              {correct} of {history.length} correct
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Score {percentage}% · {wrong} incorrect
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
              disabled={mistakes.length === 0}
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
          <div className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Correct</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">
              {correct}
            </p>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Incorrect</p>
            <p className="mt-1 text-2xl font-semibold text-rose-700">{wrong}</p>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {history.length}
            </p>
          </div>
        </div>
      </div>

      {openQuestion ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
          <h3 className="text-lg font-semibold text-slate-950">
            Open question review
          </h3>
          <p className="mt-3 rounded border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-950">
            {openQuestion.prompt}
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">
                Your answer
              </h4>
              <p className="mt-2 whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {openAnswer.trim() || "No answer"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">
                Model answer
              </h4>
              <p className="mt-2 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
                {openQuestion.modelAnswer}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-slate-800">Rubric</h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-6 text-slate-700">
              {openQuestion.rubric.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
        <h3 className="text-lg font-semibold text-slate-950">
          Accuracy per topic
        </h3>
        <div className="mt-4 space-y-3">
          {Object.entries(topicStats).map(([topic, stats]) => (
            <div key={topic}>
              <div className="mb-1 flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">{topic}</span>
                <span className="text-slate-500">
                  {stats.correct}/{stats.total}
                </span>
              </div>
              <ProgressBar value={stats.accuracy} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-rose-600" />
          <h3 className="text-lg font-semibold text-slate-950">
            Mistake review
          </h3>
        </div>

        {mistakes.length > 0 ? (
          <p className="mt-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {aiStatus === "loading"
              ? "Generating extra AI explanations for your mistakes..."
              : aiStatus === "ready"
                ? "Extra AI explanations are shown below each missed question."
                : aiStatus === "error"
                  ? "AI explanations are unavailable. The built-in explanations are still shown."
                  : "Built-in explanations are shown below."}
          </p>
        ) : null}

        {mistakes.length === 0 ? (
          <p className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            No mistakes in this session.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {mistakes.map((entry, index) => (
              <article
                key={`${entry.question.id}-${index}`}
                className="rounded border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h4 className="font-semibold leading-7 text-slate-950">
                    {entry.question.question}
                  </h4>
                  <span className="shrink-0 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                    {entry.question.topic}
                  </span>
                </div>
                <dl className="mt-3 space-y-3 text-sm leading-6">
                  <div>
                    <dt className="font-semibold text-rose-700">
                      Your answer
                    </dt>
                    <dd className="text-slate-700">
                      {getAnswerLabels(entry.question, entry.selectedAnswers)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-emerald-700">
                      Correct answer
                    </dt>
                    <dd className="text-slate-700">
                      {getAnswerLabels(
                        entry.question,
                        entry.question.correctAnswers,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-800">
                      Why this matters
                    </dt>
                    <dd className="text-slate-700">
                      Your selected set must exactly match the correct answer
                      set. {entry.question.explanation}
                    </dd>
                  </div>
                  <AiExplanationBlock
                    explanation={aiExplanations[entry.question.id]}
                    isLoading={aiStatus === "loading"}
                  />
                </dl>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
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
          <span className="font-semibold text-rose-700">Likely misconception: </span>
          {explanation.misconception}
        </p>
        <p>
          <span className="font-semibold text-emerald-700">Correct reasoning: </span>
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
