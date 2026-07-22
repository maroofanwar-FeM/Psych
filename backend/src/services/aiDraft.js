import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Single source of truth for tone/format rules: the same skill file the AI agents use
// (.claude/skills/draft-message/SKILL.md), so the app and the agents never drift apart.
const SKILL_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  ".claude",
  "skills",
  "draft-message",
  "SKILL.md"
);

function loadSystemPrompt() {
  const raw = fs.readFileSync(SKILL_PATH, "utf-8");
  return raw.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
}

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export async function draftMessage({ occasion, context }) {
  const anthropic = getClient();
  if (!anthropic) {
    throw new Error(
      "AI draft helper is disabled — set ANTHROPIC_API_KEY in the backend .env to enable it."
    );
  }

  const systemPrompt = loadSystemPrompt();
  const userPrompt = [
    `Occasion: ${occasion}`,
    context ? `Context: ${context}` : "Context: none given — write general-purpose versions.",
  ].join("\n");

  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
    max_tokens: 600,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}
