/**
 * Server-side profile-prose generation. Turns the wizard's interview answers
 * into the exact plain-prose Foundation profile the Cowork skills expect —
 * same format, same signature opening, same rules ported verbatim from the
 * foundation SKILL.md files. Uses PorchLyte's own Anthropic key.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { FoundationKind } from "./constants";
import { FOUNDATIONS } from "./content";

// Opening line + focus per foundation, from the plugin SKILL.md profile format.
const PROFILE_SPEC: Record<
  FoundationKind,
  { opener: string; specifics: string }
> = {
  voice: {
    opener: 'You write like [their name].',
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

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4000,
    system,
    messages: [
      {
        role: "user",
        content: `Here are their interview answers:\n\n${transcript}\n\nWrite the ${FOUNDATIONS[kind].label} profile now.`,
      },
    ],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (!text) throw new Error("The profile writer returned an empty result.");
  return text;
}
