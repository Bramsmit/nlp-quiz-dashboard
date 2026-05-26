import type { AnswerHistory, QuizQuestion } from "./quiz";

const STORAGE_KEY = "nlp-quiz:saved-mistakes:v1";

export type SavedMistake = {
  question: QuizQuestion;
  lastSelectedAnswers: string[];
  timesMissed: number;
  lastMissedAt: string;
};

export function loadSavedMistakes(): SavedMistake[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSavedMistake) : [];
  } catch {
    return [];
  }
}

export function saveMistakes(mistakes: SavedMistake[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
}

export function mergeMistakes(
  current: SavedMistake[],
  sessionHistory: AnswerHistory[],
): SavedMistake[] {
  const byId = new Map(current.map((mistake) => [mistake.question.id, mistake]));
  const missedAt = new Date().toISOString();

  for (const entry of sessionHistory) {
    if (entry.isCorrect) {
      continue;
    }

    const existing = byId.get(entry.question.id);
    byId.set(entry.question.id, {
      question: entry.question,
      lastSelectedAnswers: entry.selectedAnswers,
      timesMissed: (existing?.timesMissed ?? 0) + 1,
      lastMissedAt: missedAt,
    });
  }

  return [...byId.values()].sort(
    (a, b) =>
      Date.parse(b.lastMissedAt) - Date.parse(a.lastMissedAt) ||
      b.timesMissed - a.timesMissed,
  );
}

export function removeSavedMistake(
  current: SavedMistake[],
  questionId: string,
): SavedMistake[] {
  return current.filter((mistake) => mistake.question.id !== questionId);
}

function isSavedMistake(value: unknown): value is SavedMistake {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as SavedMistake;
  return (
    Boolean(candidate.question?.id) &&
    Array.isArray(candidate.lastSelectedAnswers) &&
    Number.isFinite(candidate.timesMissed) &&
    typeof candidate.lastMissedAt === "string"
  );
}
