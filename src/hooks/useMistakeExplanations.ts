import { useEffect, useState } from "react";
import {
  fetchMistakeExplanations,
  type MistakeExplanation,
} from "../lib/mistakeExplanations";
import type { AnswerHistory } from "../lib/quiz";

export type AiExplanationStatus = "idle" | "loading" | "ready" | "error";

export function useMistakeExplanations(mistakes: AnswerHistory[]) {
  const [explanations, setExplanations] = useState<
    Record<string, MistakeExplanation>
  >({});
  const [status, setStatus] = useState<AiExplanationStatus>("idle");

  useEffect(() => {
    let cancelled = false;

    if (mistakes.length === 0) {
      setStatus("idle");
      setExplanations({});
      return;
    }

    setStatus("loading");
    setExplanations({});

    fetchMistakeExplanations(mistakes)
      .then((nextExplanations) => {
        if (cancelled) {
          return;
        }

        setExplanations(
          Object.fromEntries(
            nextExplanations.map((explanation) => [
              explanation.questionId,
              explanation,
            ]),
          ),
        );
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mistakes]);

  return { explanations, status };
}
