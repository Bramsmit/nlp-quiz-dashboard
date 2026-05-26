import { useCallback, useEffect, useState } from "react";
import {
  loadSavedMistakes,
  mergeMistakes,
  removeSavedMistake,
  saveMistakes,
  type SavedMistake,
} from "../lib/savedMistakes";
import type { AnswerHistory } from "../lib/quiz";

export function useSavedMistakes() {
  const [savedMistakes, setSavedMistakes] =
    useState<SavedMistake[]>(loadSavedMistakes);

  useEffect(() => {
    saveMistakes(savedMistakes);
  }, [savedMistakes]);

  const addSessionMistakes = useCallback((history: AnswerHistory[]) => {
    setSavedMistakes((current) => mergeMistakes(current, history));
  }, []);

  const removeMistake = useCallback((questionId: string) => {
    setSavedMistakes((current) => removeSavedMistake(current, questionId));
  }, []);

  const clearMistakes = useCallback(() => {
    setSavedMistakes([]);
  }, []);

  return {
    savedMistakes,
    addSessionMistakes,
    removeMistake,
    clearMistakes,
  };
}
