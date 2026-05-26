import type { TopicProgress } from "../lib/quiz";

type SessionProgressPanelProps = {
  answeredCount: number;
  unansweredCount: number;
  currentQuestionNumber: number;
  totalQuestions: number;
  topicProgress: TopicProgress;
};

export default function SessionProgressPanel({
  answeredCount,
  unansweredCount,
  currentQuestionNumber,
  totalQuestions,
  topicProgress,
}: SessionProgressPanelProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <h2 className="text-lg font-semibold text-slate-950">Session progress</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Answered" value={answeredCount} />
        <Metric label="Open" value={unansweredCount} />
        <Metric label="Question" value={currentQuestionNumber} />
        <Metric label="Total" value={totalQuestions} />
      </div>

      <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Review
        </p>
        <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
          Score and explanations appear after the final open question.
        </p>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-800">
          Progress per topic
        </h3>
        {Object.keys(topicProgress).length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No questions in this session yet.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {Object.entries(topicProgress).map(([topic, stats]) => (
              <div key={topic} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-700">{topic}</span>
                  <span className="text-slate-500">
                    {stats.answered}/{stats.total}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-slate-200">
                  <div
                    className="h-full rounded bg-emerald-500"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
