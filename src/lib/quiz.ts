export type QuestionType = "single" | "multi";
export type Difficulty = 1 | 2 | 3;
export type QuestionCount = 10 | 25 | 50 | 100 | "all";
export type QuizPhase = "setup" | "quiz" | "openQuestion" | "results";

export type QuizQuestion = {
  id: string;
  topic: string;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  options: Record<string, string>;
  correctAnswers: string[];
  explanation: string;
  sourceHint?: string;
};

export type QuizBank = {
  metadata: {
    title: string;
    version: string;
    language: string;
    questionCount: number;
  };
  questions: QuizQuestion[];
};

export type SessionSettings = {
  topic: string;
  difficulty: Difficulty | "all";
  count: QuestionCount;
  shuffle: boolean;
};

export type AnswersByQuestionId = Record<string, string[]>;

export type AnswerHistory = {
  question: QuizQuestion;
  selectedAnswers: string[];
  isCorrect: boolean;
};

export type OpenQuestion = {
  prompt: string;
  focusTopic: string;
  rubric: string[];
  modelAnswer: string;
};

export type TopicStats = Record<
  string,
  {
    correct: number;
    total: number;
    accuracy: number;
  }
>;

export type TopicProgress = Record<
  string,
  {
    answered: number;
    total: number;
    progress: number;
  }
>;

export const ALL_TOPICS = "all";

export function isAnswerCorrect(selected: string[], correct: string[]): boolean {
  const selectedSet = new Set(selected);
  const correctSet = new Set(correct);

  if (selectedSet.size !== correctSet.size) {
    return false;
  }

  return [...correctSet].every((answer) => selectedSet.has(answer));
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

export function filterQuestions(
  questions: QuizQuestion[],
  settings: SessionSettings,
): QuizQuestion[] {
  const filtered = questions.filter((question) => {
    const topicMatches =
      settings.topic === ALL_TOPICS || question.topic === settings.topic;
    const difficultyMatches =
      settings.difficulty === "all" ||
      question.difficulty === settings.difficulty;

    return topicMatches && difficultyMatches;
  });

  const ordered = settings.shuffle ? shuffleArray(filtered) : filtered;
  return settings.count === "all" ? ordered : ordered.slice(0, settings.count);
}

export function shuffleQuestionOptions(question: QuizQuestion): QuizQuestion {
  const originalEntries = Object.entries(question.options);
  const shuffledEntries = shuffleArray(originalEntries);
  const nextOptions: Record<string, string> = {};
  const nextCorrectAnswers: string[] = [];

  shuffledEntries.forEach(([originalKey, optionText], index) => {
    const nextKey = String.fromCharCode(65 + index);
    nextOptions[nextKey] = optionText;

    if (question.correctAnswers.includes(originalKey)) {
      nextCorrectAnswers.push(nextKey);
    }
  });

  return {
    ...question,
    options: nextOptions,
    correctAnswers: nextCorrectAnswers,
  };
}

export function prepareSessionQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.map(shuffleQuestionOptions);
}

export function calculateTopicStats(history: AnswerHistory[]): TopicStats {
  return history.reduce<TopicStats>((stats, entry) => {
    const topic = entry.question.topic;
    const current = stats[topic] ?? { correct: 0, total: 0, accuracy: 0 };
    const total = current.total + 1;
    const correct = current.correct + (entry.isCorrect ? 1 : 0);

    return {
      ...stats,
      [topic]: {
        correct,
        total,
        accuracy: Math.round((correct / total) * 100),
      },
    };
  }, {});
}

export function calculateAnsweredCount(
  questions: QuizQuestion[],
  answersByQuestionId: AnswersByQuestionId,
): number {
  return questions.filter(
    (question) => (answersByQuestionId[question.id] ?? []).length > 0,
  ).length;
}

export function calculateTopicProgress(
  questions: QuizQuestion[],
  answersByQuestionId: AnswersByQuestionId,
): TopicProgress {
  return questions.reduce<TopicProgress>((stats, question) => {
    const current = stats[question.topic] ?? {
      answered: 0,
      total: 0,
      progress: 0,
    };
    const total = current.total + 1;
    const answered =
      current.answered +
      ((answersByQuestionId[question.id] ?? []).length > 0 ? 1 : 0);

    return {
      ...stats,
      [question.topic]: {
        answered,
        total,
        progress: Math.round((answered / total) * 100),
      },
    };
  }, {});
}

export function gradeSession(
  questions: QuizQuestion[],
  answersByQuestionId: AnswersByQuestionId,
): AnswerHistory[] {
  return questions.map((question) => {
    const selectedAnswers = orderAnswersByQuestion(
      question,
      answersByQuestionId[question.id] ?? [],
    );

    return {
      question,
      selectedAnswers,
      isCorrect: isAnswerCorrect(selectedAnswers, question.correctAnswers),
    };
  });
}

export function getMistakeQuestions(history: AnswerHistory[]): QuizQuestion[] {
  return history
    .filter((entry) => !entry.isCorrect)
    .map((entry) => entry.question);
}

export function getAnswerLabels(question: QuizQuestion, answers: string[]): string {
  if (answers.length === 0) {
    return "No answer";
  }

  return Object.keys(question.options)
    .filter((key) => answers.includes(key))
    .map((key) => `${key}. ${question.options[key]}`)
    .join(" | ");
}

export function orderAnswersByQuestion(
  question: QuizQuestion,
  answers: string[],
): string[] {
  return Object.keys(question.options).filter((key) => answers.includes(key));
}
