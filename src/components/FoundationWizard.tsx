"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FoundationKind } from "@/lib/porchlyte/constants";
import type { WizardQuestion } from "@/lib/porchlyte/content";

type Props = {
  kind: FoundationKind;
  label: string;
  tagline: string;
  blurb: string;
  questions: WizardQuestion[];
  initialStatus: "empty" | "partial" | "complete";
  initialContent: string | null;
  initialAnswers: Record<string, string>;
  savedNextQuestionId?: string;
};

type Mode = "view" | "wizard" | "edit";

export function FoundationWizard(props: Props) {
  const router = useRouter();
  const { kind, label, questions } = props;

  const [answers, setAnswers] = useState<Record<string, string>>(props.initialAnswers);
  const [content, setContent] = useState<string | null>(props.initialContent);
  const [status, setStatus] = useState(props.initialStatus);

  const firstUnanswered = useMemo(() => {
    if (props.savedNextQuestionId) {
      const i = questions.findIndex((q) => q.id === props.savedNextQuestionId);
      if (i >= 0) return i;
    }
    const i = questions.findIndex((q) => !props.initialAnswers[q.id]?.trim());
    return i >= 0 ? i : 0;
  }, [props.savedNextQuestionId, props.initialAnswers, questions]);

  const [mode, setMode] = useState<Mode>(status === "complete" ? "view" : "wizard");
  const [step, setStep] = useState(firstUnanswered);
  const [draft, setDraft] = useState(answers[questions[firstUnanswered]?.id] ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editText, setEditText] = useState(content ?? "");

  const q = questions[step];
  const progress = Math.round((step / questions.length) * 100);

  function goToStep(i: number, currentAnswers: Record<string, string>) {
    setStep(i);
    setDraft(currentAnswers[questions[i].id] ?? "");
  }

  async function saveProgress(next: Record<string, string>, nextQuestionId?: string) {
    const res = await fetch("/api/portal/partial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, answers: next, next_question: nextQuestionId }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Couldn't save progress");
  }

  async function onNext() {
    setBusy(true);
    setError(null);
    const next = { ...answers, [q.id]: draft };
    setAnswers(next);
    try {
      const isLast = step === questions.length - 1;
      if (!isLast) {
        await saveProgress(next, questions[step + 1].id);
        setStatus("partial");
        goToStep(step + 1, next);
      } else {
        // Final question — generate the profile prose and save it complete.
        const res = await fetch("/api/portal/foundations/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, answers: next }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Couldn't generate your profile");
        setContent(data.content);
        setEditText(data.content);
        setStatus("complete");
        setMode("view");
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onBack() {
    if (step === 0) return;
    const next = { ...answers, [q.id]: draft };
    setAnswers(next);
    goToStep(step - 1, next);
  }

  async function saveEditedText() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/foundations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, content: editText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save");
      setContent(editText);
      setStatus("complete");
      setMode("view");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  // ---------- VIEW ----------
  if (mode === "view") {
    return (
      <>
        <div className="pl-page-head">
          <div className="pl-q-count">{props.tagline}</div>
          <h1 className="pl-page-title">{label}</h1>
        </div>
        <div className="pl-card">
          <div className="pl-card-title">Your {label} profile</div>
          <p className="pl-card-body" style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>
            {content}
          </p>
        </div>
        {kind === "brand" && <BrandKitLink />}
        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <button
            className="pl-btn pl-btn-ghost"
            onClick={() => {
              setMode("wizard");
              goToStep(0, answers);
            }}
          >
            Redo the interview
          </button>
          <button
            className="pl-btn pl-btn-ghost"
            onClick={() => {
              setEditText(content ?? "");
              setMode("edit");
            }}
          >
            Edit the text directly
          </button>
        </div>
      </>
    );
  }

  // ---------- EDIT (direct text) ----------
  if (mode === "edit") {
    return (
      <>
        <div className="pl-page-head">
          <div className="pl-q-count">{props.tagline}</div>
          <h1 className="pl-page-title">Edit {label}</h1>
        </div>
        <textarea
          className="pl-textarea"
          style={{ minHeight: 320 }}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
        />
        {error && <p className="pl-error">{error}</p>}
        <div className="pl-wizard-actions">
          <button className="pl-btn pl-btn-ghost" onClick={() => setMode("view")} disabled={busy}>
            Cancel
          </button>
          <button className="pl-btn pl-btn-primary" onClick={saveEditedText} disabled={busy}>
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </>
    );
  }

  // ---------- WIZARD ----------
  return (
    <div className="pl-wizard">
      <div className="pl-page-head">
        <div className="pl-q-count">{label} interview</div>
        <h1 className="pl-page-title" style={{ fontSize: 30 }}>
          {props.tagline}
        </h1>
        {status === "empty" && step === 0 && (
          <p className="pl-page-sub">{props.blurb}</p>
        )}
      </div>

      <div className="pl-progress">
        <div className="pl-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="pl-q-count">
        Question {step + 1} of {questions.length}
      </div>
      <div className="pl-q-prompt">{q.prompt}</div>
      {q.hint && <div className="pl-q-hint">{q.hint}</div>}

      <textarea
        className="pl-textarea"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Type your answer…"
        autoFocus
      />

      {error && <p className="pl-error">{error}</p>}

      <div className="pl-wizard-actions">
        <button className="pl-btn pl-btn-ghost" onClick={onBack} disabled={busy || step === 0}>
          Back
        </button>
        <button className="pl-btn pl-btn-primary" onClick={onNext} disabled={busy || !draft.trim()}>
          {busy
            ? step === questions.length - 1
              ? "Writing your profile…"
              : "Saving…"
            : step === questions.length - 1
              ? "Finish & build profile"
              : "Next"}
        </button>
      </div>
    </div>
  );
}

/** Brand only: the prose profile and the buildable assets are two halves. */
function BrandKitLink() {
  return (
    <div className="pl-card">
      <div className="pl-card-title">Brand kit</div>
      <p className="pl-card-body" style={{ marginTop: 6 }}>
        This profile covers how your brand should feel. The brand kit holds what
        your agents build with: your logo files, exact hex codes, and fonts.
      </p>
      <Link href="/dashboard/brand-kit" className="pl-btn pl-btn-ghost" style={{ marginTop: 14 }}>
        Open your brand kit
      </Link>
    </div>
  );
}
