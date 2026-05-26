import { getOpenAiApiKey } from "./env.mjs";

const apiKey = getOpenAiApiKey();
const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

export function isAiEnabled() {
  return Boolean(apiKey);
}

export function getConfiguredModel() {
  return model;
}

export async function createJsonResponse({
  systemPrompt,
  payload,
  maxOutputTokens,
}) {
  if (!apiKey) {
    throw new Error("Missing OpenAI API key");
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
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(payload) },
      ],
      max_output_tokens: maxOutputTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  return JSON.parse(extractOutputText(await response.json()).trim());
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
