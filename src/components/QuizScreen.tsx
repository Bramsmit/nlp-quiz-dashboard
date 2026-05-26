import type { QuizSessionState } from "../hooks/useQuizSession";
import QuestionCard from "./QuestionCard";
import SessionProgressPanel from "./SessionProgressPanel";

type QuizScreenProps = {
  state: QuizSessionState;
  onSelectAnswer: (answer: string) => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onSubmitSession: () => void;
};

export default function QuizScreen({
  state,
  onSelectAnswer,
  onPreviousQuestion,
  onNextQuestion,
  onSubmitSession,
}: QuizScreenProps) {
  if (!state.currentQuestion) {
    return null;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
      <QuestionCard
        question={state.currentQuestion}
        selectedAnswers={state.selectedAnswers}
        questionNumber={state.currentIndex + 1}
        totalQuestions={state.sessionQuestions.length}
        answeredCount={state.answeredCount}
        allAnswered={state.allAnswered}
        onSelect={onSelectAnswer}
        onPrevious={onPreviousQuestion}
        onNext={onNextQuestion}
        onSubmitSession={onSubmitSession}
      />

      <SessionProgressPanel
        answeredCount={state.answeredCount}
        unansweredCount={state.unansweredCount}
        currentQuestionNumber={state.currentIndex + 1}
        totalQuestions={state.sessionQuestions.length}
        topicProgress={state.topicProgress}
      />
    </div>
  );
}
