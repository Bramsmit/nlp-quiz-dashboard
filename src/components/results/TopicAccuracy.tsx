import ProgressBar from "../ProgressBar";
import type { TopicStats } from "../../lib/quiz";

type TopicAccuracyProps = {
  topicStats: TopicStats;
};

export default function TopicAccuracy({ topicStats }: TopicAccuracyProps) {
  return (
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
  );
}
