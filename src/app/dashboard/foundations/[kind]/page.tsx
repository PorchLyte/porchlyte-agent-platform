import { notFound, redirect } from "next/navigation";
import { getPortalContext } from "@/lib/porchlyte/portal-auth";
import { getFoundations } from "@/lib/porchlyte/operations";
import { isFoundationKind } from "@/lib/porchlyte/constants";
import { FOUNDATIONS } from "@/lib/porchlyte/content";
import { FoundationWizard } from "@/components/FoundationWizard";

export default async function FoundationPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!isFoundationKind(kind)) notFound();

  const ctx = await getPortalContext();
  if (!ctx) redirect("/");

  const foundations = await getFoundations(ctx.db, ctx.memberId);
  const record = foundations[kind];

  // Stored partials are shaped { answers, next_question }; a completed record
  // may store the flat answers object. Normalize to a flat map for the wizard.
  const raw = (record.interview_answers ?? null) as
    | { answers?: Record<string, string>; next_question?: string }
    | Record<string, string>
    | null;
  const savedAnswers =
    raw && typeof raw === "object" && "answers" in raw && raw.answers
      ? (raw.answers as Record<string, string>)
      : ((raw as Record<string, string>) ?? {});
  const savedNext =
    raw && typeof raw === "object" && "next_question" in raw
      ? (raw.next_question as string | undefined)
      : undefined;

  return (
    <FoundationWizard
      kind={kind}
      label={FOUNDATIONS[kind].label}
      tagline={FOUNDATIONS[kind].tagline}
      blurb={FOUNDATIONS[kind].blurb}
      questions={FOUNDATIONS[kind].questions}
      initialStatus={record.status as "empty" | "partial" | "complete"}
      initialContent={record.content}
      initialAnswers={savedAnswers}
      savedNextQuestionId={savedNext}
    />
  );
}
