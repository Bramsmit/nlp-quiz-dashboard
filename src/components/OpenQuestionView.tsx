import { Mic, MicOff, Send } from "lucide-react";
import { useCallback } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import type { OpenQuestion } from "../lib/quiz";

type OpenQuestionViewProps = {
  openQuestion: OpenQuestion;
  answer: string;
  onAnswerChange: (answer: string) => void;
  onFinish: () => void;
};

export default function OpenQuestionView({
  openQuestion,
  answer,
  onAnswerChange,
  onFinish,
}: OpenQuestionViewProps) {
  const appendTranscript = useCallback(
    (text: string) => {
      onAnswerChange(answer.trim() ? `${answer.trim()} ${text}` : text);
    },
    [answer, onAnswerChange],
  );
  const speech = useSpeechRecognition(appendTranscript);
  const canFinish = answer.trim().length >= 20;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Open exam question
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
          Written response
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Focus topic: {openQuestion.focusTopic}
        </p>
      </div>

      <div className="rounded border border-slate-200 bg-slate-50 p-4">
        <p className="text-base font-semibold leading-7 text-slate-950">
          {openQuestion.prompt}
        </p>
      </div>

      <label className="mt-5 block space-y-2">
        <span className="text-sm font-medium text-slate-700">Your answer</span>
        <textarea
          className="min-h-48 w-full rounded border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder="Type your answer here, or use the microphone button."
        />
      </label>

      {speech.error ? (
        <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {speech.error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          onClick={speech.isListening ? speech.stop : speech.start}
          disabled={!speech.isSupported}
        >
          {speech.isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              Stop voice input
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Speak answer
            </>
          )}
        </button>

        <button
          data-testid="finish-open-question"
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          onClick={onFinish}
          disabled={!canFinish}
        >
          <Send className="h-4 w-4" />
          Finish and review
        </button>
      </div>
    </section>
  );
}
