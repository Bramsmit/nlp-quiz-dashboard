import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateAnsweredCount,
  calculateTopicProgress,
  filterQuestions,
  getMistakeQuestions,
  gradeSession,
  orderAnswersByQuestion,
  prepareSessionQuestions,
  shuffleArray,
  type AnswersByQuestionId,
  type AnswerHistory,
  type OpenQuestion,
  type QuizPhase,
  type QuizQuestion,
  type SessionSettings,
  type TopicProgress,
} from "../lib/quiz";
import { createOpenQuestion } from "../lib/openQuestion";

export type QuizSessionState = {
  phase: QuizPhase;
  settings: SessionSettings;
  sessionQuestions: QuizQuestion[];
  currentQuestion?: QuizQuestion;
  currentIndex: number;
  selectedAnswers: string[];
  answeredCount: number;
  unansweredCount: number;
  allAnswered: boolean;
  topicProgress: TopicProgress;
  history: AnswerHistory[];
  openQuestion?: OpenQuestion;
  openAnswer: string;
};

type UseQuizSessionParams = {
  questions: QuizQuestion[];
  initialSettings: SessionSettings;
};

export function useQuizSession({
  questions,
  initialSettings,
}: UseQuizSessionParams) {
  const [settings, setSettings] = useState<SessionSettings>(initialSettings);
  const [phase, setPhase] = useState<QuizPhase>("setup");
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] =
    useState<AnswersByQuestionId>({});
  const [history, setHistory] = useState<AnswerHistory[]>([]);
  const [openQuestion, setOpenQuestion] = useState<OpenQuestion>();
  const [openAnswer, setOpenAnswer] = useState("");

  const currentQuestion = sessionQuestions[currentIndex];
  const selectedAnswers = currentQuestion
    ? (answersByQuestionId[currentQuestion.id] ?? [])
    : [];
  const answeredCount = useMemo(
    () => calculateAnsweredCount(sessionQuestions, answersByQuestionId),
    [answersByQuestionId, sessionQuestions],
  );
  const unansweredCount = Math.max(sessionQuestions.length - answeredCount, 0);
  const allAnswered =
    sessionQuestions.length > 0 && answeredCount === sessionQuestions.length;
  const topicProgress = useMemo(
    () => calculateTopicProgress(sessionQuestions, answersByQuestionId),
    [answersByQuestionId, sessionQuestions],
  );

  const clearSessionState = useCallback(() => {
    setAnswersByQuestionId({});
    setHistory([]);
    setOpenQuestion(undefined);
    setOpenAnswer("");
  }, []);

  const startSession = useCallback(
    (overrideQuestions?: QuizQuestion[]) => {
      const baseQuestions =
        overrideQuestions ?? filterQuestions(questions, settings);
      const nextQuestions = prepareSessionQuestions(baseQuestions);

      setSessionQuestions(nextQuestions);
      setOpenQuestion(createOpenQuestion(nextQuestions));
      setCurrentIndex(0);
      setAnswersByQuestionId({});
      setHistory([]);
      setOpenAnswer("");
      setPhase("quiz");
    },
    [questions, settings],
  );

  const resetSession = useCallback(() => {
    setPhase("setup");
    setSessionQuestions([]);
    setCurrentIndex(0);
    clearSessionState();
  }, [clearSessionState]);

  const selectAnswer = useCallback((question: QuizQuestion, answer: string) => {
    setAnswersByQuestionId((current) => {
      const currentAnswers = current[question.id] ?? [];
      const nextAnswers =
        question.type === "single"
          ? [answer]
          : currentAnswers.includes(answer)
            ? currentAnswers.filter((item) => item !== answer)
            : [...currentAnswers, answer];

      return {
        ...current,
        [question.id]: orderAnswersByQuestion(question, nextAnswers),
      };
    });
  }, []);

  const selectCurrentAnswer = useCallback(
    (answer: string) => {
      if (currentQuestion) {
        selectAnswer(currentQuestion, answer);
      }
    },
    [currentQuestion, selectAnswer],
  );

  const previousQuestion = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const nextQuestion = useCallback(() => {
    if (!currentQuestion || selectedAnswers.length === 0) {
      return;
    }

    setCurrentIndex((index) =>
      Math.min(index + 1, sessionQuestions.length - 1),
    );
  }, [currentQuestion, selectedAnswers.length, sessionQuestions.length]);

  const submitSession = useCallback(() => {
    if (!allAnswered) {
      return;
    }

    setPhase("openQuestion");
  }, [allAnswered]);

  const finishSession = useCallback(() => {
    const gradedHistory = gradeSession(sessionQuestions, answersByQuestionId);

    setHistory(gradedHistory);
    setPhase("results");
    return gradedHistory;
  }, [answersByQuestionId, sessionQuestions]);

  const retryMistakes = useCallback(() => {
    const mistakeQuestions = getMistakeQuestions(history);

    if (mistakeQuestions.length === 0) {
      return;
    }

    startSession(
      settings.shuffle ? shuffleArray(mistakeQuestions) : mistakeQuestions,
    );
  }, [history, settings.shuffle, startSession]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        phase !== "quiz" ||
        !currentQuestion ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.repeat
      ) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        if (selectedAnswers.length === 0) {
          return;
        }

        if (currentIndex === sessionQuestions.length - 1) {
          submitSession();
        } else {
          nextQuestion();
        }

        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previousQuestion();
        return;
      }

      if (event.key === "ArrowRight" && selectedAnswers.length > 0) {
        event.preventDefault();

        if (currentIndex < sessionQuestions.length - 1) {
          nextQuestion();
        }

        return;
      }

      if (event.key.length === 1) {
        const key = event.key.toUpperCase();

        if (Object.prototype.hasOwnProperty.call(currentQuestion.options, key)) {
          event.preventDefault();
          selectCurrentAnswer(key);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    currentIndex,
    currentQuestion,
    nextQuestion,
    phase,
    previousQuestion,
    selectCurrentAnswer,
    selectedAnswers.length,
    sessionQuestions.length,
    submitSession,
  ]);

  return {
    state: {
      phase,
      settings,
      sessionQuestions,
      currentQuestion,
      currentIndex,
      selectedAnswers,
      answeredCount,
      unansweredCount,
      allAnswered,
      topicProgress,
      history,
      openQuestion,
      openAnswer,
    } satisfies QuizSessionState,
    actions: {
      setSettings,
      startSession,
      resetSession,
      selectCurrentAnswer,
      previousQuestion,
      nextQuestion,
      submitSession,
      setOpenAnswer,
      finishSession,
      retryMistakes,
    },
  };
}
