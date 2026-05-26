import { Play, Shuffle } from "lucide-react";
import {
  ALL_TOPICS,
  type Difficulty,
  type QuestionCount,
  type QuizQuestion,
  type SessionSettings,
  filterQuestions,
} from "../lib/quiz";

type QuizSetupProps = {
  questions: QuizQuestion[];
  settings: SessionSettings;
  topics: string[];
  onSettingsChange: (settings: SessionSettings) => void;
  onStart: () => void;
};

const questionCountOptions: { value: QuestionCount; label: string }[] = [
  { value: 10, label: "10 questions" },
  { value: 25, label: "25 questions" },
  { value: 50, label: "50 questions" },
  { value: 100, label: "100 questions" },
  { value: "all", label: "All questions" },
];

export default function QuizSetup({
  questions,
  settings,
  topics,
  onSettingsChange,
  onStart,
}: QuizSetupProps) {
  const availableQuestions = filterQuestions(questions, {
    ...settings,
    count: "all",
    shuffle: false,
  }).length;
  const selectedCount =
    settings.count === "all"
      ? availableQuestions
      : Math.min(settings.count, availableQuestions);
  const startDisabled = availableQuestions === 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Practice session
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
          Configure your NLP quiz
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose topic, difficulty, and session length. Answer options are
          reshuffled for every new session.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Topic</span>
          <select
            className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            value={settings.topic}
            onChange={(event) =>
              onSettingsChange({ ...settings, topic: event.target.value })
            }
          >
            <option value={ALL_TOPICS}>All topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Difficulty</span>
          <select
            className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            value={settings.difficulty}
            onChange={(event) => {
              const value = event.target.value;
              onSettingsChange({
                ...settings,
                difficulty:
                  value === "all" ? "all" : (Number(value) as Difficulty),
              });
            }}
          >
            <option value="all">All levels</option>
            <option value={1}>1 - basic</option>
            <option value={2}>2 - intermediate</option>
            <option value={3}>3 - hard</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Number of questions
          </span>
          <select
            className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            value={settings.count}
            onChange={(event) => {
              const value = event.target.value;
              onSettingsChange({
                ...settings,
                count: value === "all" ? "all" : (Number(value) as QuestionCount),
              });
            }}
          >
            {questionCountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <label className="flex w-full items-center justify-between gap-4 rounded border border-slate-300 px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Shuffle className="h-4 w-4 text-emerald-700" />
              Shuffle
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              checked={settings.shuffle}
              onChange={(event) =>
                onSettingsChange({ ...settings, shuffle: event.target.checked })
              }
            />
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">{availableQuestions}</span>{" "}
          questions available,{" "}
          <span className="font-medium text-slate-900">{selectedCount}</span>{" "}
          selected.
        </div>
        <button
          data-testid="start-quiz"
          className="inline-flex items-center justify-center gap-2 rounded bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          type="button"
          onClick={onStart}
          disabled={startDisabled}
        >
          <Play className="h-4 w-4" />
          Start quiz
        </button>
      </div>
    </section>
  );
}
