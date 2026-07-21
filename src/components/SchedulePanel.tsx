"use client";

import { useState } from "react";
import type { ScheduledAgent } from "@/lib/porchlyte/constants";

type TaskState = {
  state: "active" | "paused";
  schedule_label: string | null;
  last_run_at: string | null;
  last_run_summary: string | null;
};

export function SchedulePanel({
  agent,
  agentName,
  initial,
}: {
  agent: ScheduledAgent;
  agentName: string;
  initial: TaskState;
}) {
  const [task, setTask] = useState<TaskState>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    const nextState = task.state === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/portal/tasks/${agent}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: nextState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't update");
      setTask((t) => ({ ...t, state: data.state }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pl-card">
      <div className="pl-card-title">Schedule</div>
      <p className="pl-card-body" style={{ marginBottom: 16 }}>
        {agentName} runs on a schedule you set in Cowork. Pause her here any time
        — she checks this before every run and stays quiet while paused.
      </p>
      <div className="pl-schedule">
        <div className="pl-schedule-row">
          <span className="pl-schedule-label">Status</span>
          <button
            className={`pl-toggle${task.state === "active" ? " on" : ""}`}
            onClick={toggle}
            disabled={busy}
            aria-label={task.state === "active" ? "Pause" : "Resume"}
          />
        </div>
        <div className="pl-schedule-row">
          <span className="pl-schedule-label">Runs</span>
          <span className="pl-schedule-value">
            {task.schedule_label ?? "Set in Cowork"}
          </span>
        </div>
        <div className="pl-schedule-row">
          <span className="pl-schedule-label">Last run</span>
          <span className="pl-schedule-value">
            {task.last_run_at
              ? new Date(task.last_run_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "No runs yet"}
          </span>
        </div>
        {task.last_run_summary && (
          <div className="pl-diag">{task.last_run_summary}</div>
        )}
      </div>
      {error && <p className="pl-error">{error}</p>}
    </div>
  );
}
