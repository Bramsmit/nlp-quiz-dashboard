import { readFile, writeFile } from "node:fs/promises";
import { loadEnvFile } from "./env.mjs";

loadEnvFile();

const { createJsonResponse, isAiEnabled } = await import("./openai.mjs");
const inputPath = "src/data/nlp_250_quiz_questions.json";
const outputPath = "src/data/nlp_250_quiz_questions.en.json";
const chunkSize = Number(process.env.TRANSLATE_CHUNK_SIZE ?? 10);

if (!isAiEnabled()) {
  throw new Error("Missing OpenAI API key in .env");
}

function chunk(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function translateChunk(questions, chunkNumber, totalChunks) {
  console.log(`Translating chunk ${chunkNumber}/${totalChunks}`);

  const parsed = await createJsonResponse({
    systemPrompt: [
      "Translate this Dutch NLP quiz content into clear exam-level English.",
      "Return only valid JSON: {\"questions\": [...]}",
      "Preserve id, type, difficulty, option keys, correctAnswers, and sourceHint exactly.",
      "Translate topic, question, options text, and explanation.",
      "Do not add Markdown or commentary.",
    ].join(" "),
    payload: { questions },
    maxOutputTokens: 20000,
  });

  if (!Array.isArray(parsed.questions) || parsed.questions.length !== questions.length) {
    throw new Error(`Invalid translation response for chunk ${chunkNumber}`);
  }

  return parsed.questions.map((translated, index) => ({
    ...questions[index],
    topic: translated.topic,
    question: translated.question,
    options: translated.options,
    explanation: translated.explanation,
    sourceHint: translated.sourceHint ?? questions[index].sourceHint,
  }));
}

const quizBank = JSON.parse(await readFile(inputPath, "utf8"));
const translatedQuestions = [];
const chunks = chunk(quizBank.questions, chunkSize);

for (let index = 0; index < chunks.length; index += 1) {
  translatedQuestions.push(
    ...(await translateChunk(chunks[index], index + 1, chunks.length)),
  );
}

const translatedBank = {
  ...quizBank,
  metadata: {
    ...quizBank.metadata,
    title: "NLP 2026 Interactive Quiz Bank",
    language: "en",
  },
  questions: translatedQuestions,
};

await writeFile(outputPath, `${JSON.stringify(translatedBank, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
