import { useMemo } from "react";
import { useMistakeExplanations } from "../hooks/useMistakeExplanations";
import {
  calculateTopicStats,
  type AnswerHistory,
  type OpenQuestion,
} from "../lib/quiz";
import MistakeReview from "./results/MistakeReview";
import OpenQuestionReview from "./results/OpenQuestionReview";
import ResultSummary from "./results/ResultSummary";
import TopicAccuracy from "./results/TopicAccuracy";

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
  const mistakes = useMemo(
    () => history.filter((entry) => !entry.isCorrect),
    [history],
  );
  const correct = history.length - mistakes.length;
  const topicStats = calculateTopicStats(history);
  const ai = useMistakeExplanations(mistakes);

  return (
    <section className="space-y-5">
      <ResultSummary
        correct={correct}
        total={history.length}
        mistakesCount={mistakes.length}
        onReset={onReset}
        onRetryMistakes={onRetryMistakes}
      />
      <OpenQuestionReview openQuestion={openQuestion} openAnswer={openAnswer} />
      <TopicAccuracy topicStats={topicStats} />
      <MistakeReview
        mistakes={mistakes}
        aiExplanations={ai.explanations}
        aiStatus={ai.status}
      />
    </section>
  );
}
