/**
 * Server-side profile-prose generation. Turns the wizard's interview answers
 * into the exact plain-prose Foundation profile the Cowork skills expect —
 * same format, same signature opening, same rules ported verbatim from the
 * foundation SKILL.md files. Uses PorchLyte's OpenAI key.
 */
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { FoundationKind } from "./constants";
import { FOUNDATIONS } from "./content";

// Opening line + focus per foundation, from the plugin SKILL.md profile format.
const PROFILE_SPEC: Record<
  FoundationKind,
  { opener: string; specifics: string }
> = {
  voice: {
    opener: "You write like [their name].",
    specifics:
      "their actual examples, their actual phrases, and the agent-speak they hate by name",
  },
  brand: {
    opener: "Your brand is...",
    specifics: "their actual color codes, font names, references, and exact words",
  },
  local: {
    opener: "Your market is...",
    specifics:
      "their actual place names, neighborhood names, sports teams, school names, and exact words",
  },
};

export async function generateFoundationProse(
  kind: FoundationKind,
  answers: Record<string, string>,
  memberName?: string | null
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const spec = PROFILE_SPEC[kind];
  const questions = FOUNDATIONS[kind].questions;

  const transcript = questions
    .map((q) => {
      const a = answers[q.id]?.trim();
      return a ? `Q: ${q.prompt}\nA: ${a}` : null;
    })
    .filter(Boolean)
    .join("\n\n");

  const opener = spec.opener.replace(
    "[their name]",
    memberName?.split(" ")[0] ?? "you"
  );

  const system = [
    `You are writing a real estate agent's ${FOUNDATIONS[kind].label} profile for PorchLyte.`,
    `Write it in plain prose. No bullets. No headers. Start with "${opener}".`,
    `Pull out specifics from what they told you — use ${spec.specifics}.`,
    `Don't summarize. Don't generalize. Don't add a single thing they didn't say.`,
    `Write only the profile itself — no preamble, no closing remarks.`,
  ].join(" ");

  const { text } = await generateText({
    // Cheap + enough for this structured prose rewrite.
    model: openai("gpt-4o-mini"),
    system,
    prompt: `Here are their interview answers:\n\n${transcript}\n\nWrite the ${FOUNDATIONS[kind].label} profile now.`,
    maxOutputTokens: 1200,
  });

  const trimmed = text.trim();
  if (!trimmed) throw new Error("The profile writer returned an empty result.");
  return trimmed;
}
