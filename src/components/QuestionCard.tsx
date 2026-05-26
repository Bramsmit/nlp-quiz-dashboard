import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  CheckCircle2,
  Circle,
  Square,
  SquareCheck,
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import type { QuizQuestion } from "../lib/quiz";

type QuestionCardProps = {
  question: QuizQuestion;
  selectedAnswers: string[];
  questionNumber: number;
  totalQuestions: number;
  answeredCount: number;
  allAnswered: boolean;
  onSelect: (answer: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmitSession: () => void;
};

const difficultyLabel = {
  1: "Basic",
  2: "Intermediate",
  3: "Hard",
} as const;

function getOptionClass(isSelected: boolean) {
  if (isSelected) {
    return "border-emerald-500 bg-emerald-50 text-slate-950 ring-2 ring-emerald-100";
  }

  return "border-slate-200 bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50";
}

export default function QuestionCard({
  question,
  selectedAnswers,
  questionNumber,
  totalQuestions,
  answeredCount,
  allAnswered,
  onSelect,
  onPrevious,
  onNext,
  onSubmitSession,
}: QuestionCardProps) {
  const progress = Math.round((questionNumber / totalQuestions) * 100);
  const options = Object.entries(question.options);
  const hasSelection = selectedAnswers.length > 0;
  const isMulti = question.type === "multi";
  const isFirstQuestion = questionNumber === 1;
  const isLastQuestion = questionNumber === totalQuestions;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="mb-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Question {questionNumber} of {totalQuestions}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-8 text-slate-950 sm:text-2xl">
              {question.question}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
              Difficulty {question.difficulty}: {difficultyLabel[question.difficulty]}
            </span>
            <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {question.topic}
            </span>
          </div>
        </div>

        <ProgressBar value={progress} label="Progress" />

        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          Answers completed:{" "}
          <span className="font-semibold text-slate-950">
            {answeredCount}/{totalQuestions}
          </span>
        </div>

        {isMulti ? (
          <p className="rounded border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-950">
            Multiple answers can be correct
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        {options.map(([key, label]) => {
          const isSelected = selectedAnswers.includes(key);

          return (
            <button
              key={key}
              data-testid={`option-${key}`}
              type="button"
              className={`flex w-full items-start gap-3 rounded border p-3 text-left transition ${getOptionClass(isSelected)}`}
              onClick={() => onSelect(key)}
              aria-pressed={isSelected}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-current">
                {isMulti ? (
                  isSelected ? (
                    <SquareCheck className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )
                ) : isSelected ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{key}</span>
                <span className="block break-words text-sm leading-6 sm:text-base">
                  {label}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          data-testid="previous-question"
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          onClick={onPrevious}
          disabled={isFirstQuestion}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous question
        </button>

        <div className="flex flex-col gap-2 sm:flex-row">
          {!isLastQuestion ? (
            <button
              data-testid="next-question"
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              onClick={onNext}
              disabled={!hasSelection}
            >
              Next question
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              data-testid="submit-quiz"
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              onClick={onSubmitSession}
              disabled={!hasSelection || !allAnswered}
            >
              <ClipboardCheck className="h-4 w-4" />
              Continue to open question
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
