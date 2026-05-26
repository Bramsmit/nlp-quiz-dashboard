import type { OpenQuestion, QuizQuestion } from "./quiz";

const defaultRubric = [
  "Define the key concepts precisely.",
  "Use at least one concrete NLP example.",
  "Explain trade-offs, limitations, or failure cases.",
  "Connect multiple layers such as preprocessing, syntax, semantics, grounding, or evaluation.",
];

const defaultModelAnswer =
  "A strong answer first defines the relevant NLP concepts, then explains how they interact in a realistic pipeline. It should include a concrete example, identify at least one limitation or ambiguity, and connect the answer to evaluation or downstream impact.";

const topicPrompts: Record<string, Pick<OpenQuestion, "prompt" | "modelAnswer">> = {
  "NLP basics & pipeline": {
    prompt:
      "Explain why an NLP pipeline can suffer from error propagation. Use one concrete downstream task as an example.",
    modelAnswer:
      "An NLP pipeline can suffer from error propagation because early mistakes become inputs to later components. For example, if tokenization or POS tagging is wrong, a parser may attach phrases incorrectly, which can then hurt information extraction or question answering. A strong answer mentions that modern end-to-end models reduce some pipeline boundaries but still face errors caused by ambiguity, data bias, or poor representations.",
  },
  "Ambiguity & NLP challenges": {
    prompt:
      "Discuss at least three kinds of ambiguity in natural language and explain why they are difficult for NLP systems.",
    modelAnswer:
      "Ambiguity can occur at the word-sense level, POS level, syntactic attachment level, and semantic scope level. NLP systems need context and probabilistic preferences to choose among analyses, but the correct interpretation may depend on discourse, world knowledge, or speaker intent. A strong answer gives examples such as 'bank', 'I saw the girl with a telescope', or quantifier scope.",
  },
  "Transformers & LLM architecture": {
    prompt:
      "Explain how self-attention helps Transformer models process language, and mention one limitation of this architecture.",
    modelAnswer:
      "Self-attention lets each token weight information from other tokens, making it possible to model long-range dependencies and contextual meanings. Multi-head attention can capture different relation types in parallel. Limitations include computational cost for long contexts, lack of guaranteed grounding, and the fact that attention patterns are not always straightforward explanations.",
  },
  "LLMs, BERT/GPT & training": {
    prompt:
      "Compare BERT-style and GPT-style training objectives and explain how they affect downstream use.",
    modelAnswer:
      "BERT-style models are usually trained with bidirectional masked language modeling, which is useful for understanding tasks such as classification or token labeling. GPT-style models are trained autoregressively with next-token prediction, which makes them naturally suited for generation. A strong answer notes that both can be adapted with prompting or fine-tuning, but their pretraining objective shapes how they use context.",
  },
  "Ethics, NLU & exam-style integration": {
    prompt:
      "What would make an NLP system appear to understand language, and why might that still not prove true understanding?",
    modelAnswer:
      "An NLP system may appear to understand language if it answers questions coherently, follows instructions, and generalizes across examples. However, this does not prove grounded understanding because the system may rely on statistical patterns in text without perception, intent, or situational grounding. A strong answer connects this to evaluation, hallucination, bias, and definitions of understanding.",
  },
};

export function createOpenQuestion(questions: QuizQuestion[]): OpenQuestion {
  const topicCounts = questions.reduce<Record<string, number>>((counts, question) => {
    counts[question.topic] = (counts[question.topic] ?? 0) + 1;
    return counts;
  }, {});
  const focusTopic =
    Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "NLP integration";
  const topicPrompt = topicPrompts[focusTopic];

  return {
    focusTopic,
    rubric: defaultRubric,
    prompt:
      topicPrompt?.prompt ??
      `Write an exam-style answer that connects the topic "${focusTopic}" to a realistic NLP system. Include examples and limitations.`,
    modelAnswer: topicPrompt?.modelAnswer ?? defaultModelAnswer,
  };
}
