import { createServer } from "node:http";
import { getOpenAiApiKey, loadEnvFile } from "./env.mjs";

loadEnvFile();

const port = Number(process.env.AI_PORT ?? 8787);
const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const apiKey = getOpenAiApiKey();

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

function extractOutputText(payload) {
  if (typeof payload.output_text === "string") {
    return payload.output_text;
  }

  return (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((content) => content.text ?? "")
    .join("");
}

async function translateQuestions(questions) {
  if (!apiKey) {
    return questions;
  }

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
          content:
            "Translate Dutch NLP quiz content into clear exam-level English. Preserve ids, type, difficulty, option keys, and correctAnswers exactly. Return only valid JSON with a questions array.",
        },
        {
          role: "user",
          content: JSON.stringify({ questions }),
        },
      ],
      max_output_tokens: 16000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const payload = await response.json();
  const text = extractOutputText(payload).trim();
  const parsed = JSON.parse(text);

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
  if (!apiKey || mistakes.length === 0) {
    return [];
  }

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
            "You are an NLP exam tutor.",
            "Explain each incorrectly answered quiz question with extra context.",
            "Be concise, concrete, and exam-focused.",
            "Return only valid JSON: {\"explanations\":[{\"questionId\":\"...\",\"misconception\":\"...\",\"correctReasoning\":\"...\",\"studyTip\":\"...\"}]}",
            "Do not add Markdown or commentary outside JSON.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({ mistakes }),
        },
      ],
      max_output_tokens: 12000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const payload = await response.json();
  const parsed = JSON.parse(extractOutputText(payload).trim());
  return Array.isArray(parsed.explanations) ? parsed.explanations : [];
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "GET" && request.url === "/api/health") {
    sendJson(response, 200, { ok: true, aiEnabled: Boolean(apiKey), model });
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
