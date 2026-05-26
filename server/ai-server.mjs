import { createServer } from "node:http";
import { loadEnvFile } from "./env.mjs";

loadEnvFile();

const { createJsonResponse, getConfiguredModel, isAiEnabled } = await import(
  "./openai.mjs"
);
const port = Number(process.env.AI_PORT ?? 8787);
const model = getConfiguredModel();

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 2_000_000) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload));
}

async function translateQuestions(questions) {
  if (!isAiEnabled()) {
    return questions;
  }

  const parsed = await createJsonResponse({
    systemPrompt:
      "Translate Dutch NLP quiz content into clear exam-level English. Preserve ids, type, difficulty, option keys, and correctAnswers exactly. Return only valid JSON with a questions array.",
    payload: { questions },
    maxOutputTokens: 16000,
  });

  if (!Array.isArray(parsed.questions) || parsed.questions.length !== questions.length) {
    return questions;
  }

  return parsed.questions.map((translated, index) => ({
    ...questions[index],
    topic: translated.topic ?? questions[index].topic,
    question: translated.question ?? questions[index].question,
    options: translated.options ?? questions[index].options,
    explanation: translated.explanation ?? questions[index].explanation,
    sourceHint: translated.sourceHint ?? questions[index].sourceHint,
  }));
}

async function explainMistakes(mistakes) {
  if (!isAiEnabled() || mistakes.length === 0) {
    return [];
  }

  const parsed = await createJsonResponse({
    systemPrompt: [
      "You are an NLP exam tutor.",
      "Explain each incorrectly answered quiz question with extra context.",
      "Be concise, concrete, and exam-focused.",
      "Return only valid JSON: {\"explanations\":[{\"questionId\":\"...\",\"misconception\":\"...\",\"correctReasoning\":\"...\",\"studyTip\":\"...\"}]}",
      "Do not add Markdown or commentary outside JSON.",
    ].join(" "),
    payload: { mistakes },
    maxOutputTokens: 12000,
  });
  return Array.isArray(parsed.explanations) ? parsed.explanations : [];
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "GET" && request.url === "/api/health") {
    sendJson(response, 200, { ok: true, aiEnabled: isAiEnabled(), model });
    return;
  }

  if (request.method === "POST" && request.url === "/api/translate-questions") {
    try {
      const body = await readJsonBody(request);
      const questions = Array.isArray(body.questions) ? body.questions : [];
      sendJson(response, 200, {
        questions: await translateQuestions(questions),
      });
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : "Unknown AI server error",
      });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/explain-mistakes") {
    try {
      const body = await readJsonBody(request);
      const mistakes = Array.isArray(body.mistakes) ? body.mistakes : [];
      sendJson(response, 200, {
        explanations: await explainMistakes(mistakes),
      });
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : "Unknown AI server error",
      });
    }
    return;
  }

  sendJson(response, 404, { error: "Not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`AI helper server listening on http://127.0.0.1:${port}`);
});
