import { useMemo } from "react";
import quizBankJson from "../data/nlp_250_quiz_questions.en.json";
import { useSavedMistakes } from "../hooks/useSavedMistakes";
import { useQuizSession } from "../hooks/useQuizSession";
import { ALL_TOPICS, type QuizBank, type SessionSettings } from "../lib/quiz";
import AppHeader from "./AppHeader";
import OpenQuestionView from "./OpenQuestionView";
import QuizScreen from "./QuizScreen";
import QuizSetup from "./QuizSetup";
import ResultsView from "./ResultsView";
import SavedMistakesPanel from "./SavedMistakesPanel";

const quizBank = quizBankJson as QuizBank;

const defaultSettings: SessionSettings = {
  topic: ALL_TOPICS,
  difficulty: "all",
  count: 25,
  shuffle: true,
};

export default function QuizApp() {
  const topics = useMemo(
    () => [...new Set(quizBank.questions.map((question) => question.topic))],
    [],
  );
  const { state, actions } = useQuizSession({
    questions: quizBank.questions,
    initialSettings: defaultSettings,
  });
  const savedMistakes = useSavedMistakes();

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <AppHeader
          metadata={quizBank.metadata}
          phase={state.phase}
          onReset={actions.resetSession}
        />

        {state.phase === "setup" ? (
          <>
            <QuizSetup
              questions={quizBank.questions}
              settings={state.settings}
              topics={topics}
              onSettingsChange={actions.setSettings}
              onStart={() => actions.startSession()}
            />
            <SavedMistakesPanel
              savedMistakes={savedMistakes.savedMistakes}
              onPractice={() =>
                actions.startSession(
                  savedMistakes.savedMistakes.map((mistake) => mistake.question),
                )
              }
              onRemove={savedMistakes.removeMistake}
              onClear={savedMistakes.clearMistakes}
            />
          </>
        ) : null}

        {state.phase === "quiz" ? (
          <QuizScreen
            state={state}
            onSelectAnswer={actions.selectCurrentAnswer}
            onPreviousQuestion={actions.previousQuestion}
            onNextQuestion={actions.nextQuestion}
            onSubmitSession={actions.submitSession}
          />
        ) : null}

        {state.phase === "openQuestion" && state.openQuestion ? (
          <OpenQuestionView
            openQuestion={state.openQuestion}
            answer={state.openAnswer}
            onAnswerChange={actions.setOpenAnswer}
            onFinish={() => {
              const gradedHistory = actions.finishSession();

              if (gradedHistory) {
                savedMistakes.addSessionMistakes(gradedHistory);
              }
            }}
          />
        ) : null}

        {state.phase === "results" ? (
          <ResultsView
            history={state.history}
            openQuestion={state.openQuestion}
            openAnswer={state.openAnswer}
            onRetryMistakes={actions.retryMistakes}
            onReset={actions.resetSession}
          />
        ) : null}
      </div>
    </main>
  );
}
