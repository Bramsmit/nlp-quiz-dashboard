import type { OpenQuestion } from "../../lib/quiz";

type OpenQuestionReviewProps = {
  openQuestion?: OpenQuestion;
  openAnswer: string;
};

export default function OpenQuestionReview({
  openQuestion,
  openAnswer,
}: OpenQuestionReviewProps) {
  if (!openQuestion) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <h3 className="text-lg font-semibold text-slate-950">
        Open question review
      </h3>
      <p className="mt-3 rounded border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-950">
        {openQuestion.prompt}
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Your answer</h4>
          <p className="mt-2 whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {openAnswer.trim() || "No answer"}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Model answer</h4>
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
  );
}
