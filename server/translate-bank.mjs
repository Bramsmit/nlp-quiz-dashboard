import { readFile, writeFile } from "node:fs/promises";
import { getOpenAiApiKey, loadEnvFile } from "./env.mjs";

loadEnvFile();

const inputPath = "src/data/nlp_250_quiz_questions.json";
const outputPath = "src/data/nlp_250_quiz_questions.en.json";
const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const apiKey = getOpenAiApiKey();
const chunkSize = Number(process.env.TRANSLATE_CHUNK_SIZE ?? 10);

if (!apiKey) {
  throw new Error("Missing OpenAI API key in .env");
}

function chunk(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function extractOutputText(payload) {
  if (typeof payload.output_text === "string") {
    return payload.output_text;
  }

  return (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((content) => content.text ?? "")
    .join("");
}

async function translateChunk(questions, chunkNumber, totalChunks) {
  console.log(`Translating chunk ${chunkNumber}/${totalChunks}`);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            "Translate this Dutch NLP quiz content into clear exam-level English.",
            "Return only valid JSON: {\"questions\": [...]}",
            "Preserve id, type, difficulty, option keys, correctAnswers, and sourceHint exactly.",
            "Translate topic, question, options text, and explanation.",
            "Do not add Markdown or commentary.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({ questions }),
        },
      ],
      max_output_tokens: 20000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const text = extractOutputText(await response.json()).trim();
  const parsed = JSON.parse(text);

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
