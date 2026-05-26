import type { AnswerHistory } from "./quiz";

export type MistakeExplanation = {
  questionId: string;
  misconception: string;
  correctReasoning: string;
  studyTip: string;
};

type ExplainMistakesResponse = {
  explanations?: MistakeExplanation[];
};

export async function fetchMistakeExplanations(
  mistakes: AnswerHistory[],
): Promise<MistakeExplanation[]> {
  if (mistakes.length === 0) {
    return [];
  }

  const response = await fetch("/api/explain-mistakes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mistakes: mistakes.map((entry) => ({
        questionId: entry.question.id,
        topic: entry.question.topic,
        type: entry.question.type,
        question: entry.question.question,
        options: entry.question.options,
        selectedAnswers: entry.selectedAnswers,
        correctAnswers: entry.question.correctAnswers,
        existingExplanation: entry.question.explanation,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error("Could not fetch AI mistake explanations.");
  }

  const data = (await response.json()) as ExplainMistakesResponse;
  return data.explanations ?? [];
}
