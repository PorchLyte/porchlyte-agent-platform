"use client";

import { useState } from "react";
import type { ScheduledAgent } from "@/lib/porchlyte/constants";

type Task = {
  task_name: string;
  state: "active" | "paused";
  schedule_label: string | null;
  last_run_at: string | null;
  last_run_summary: string | null;
};

/** One agent's scheduled tasks, each with its own pause/resume toggle. */
export function ScheduleList({
  agent,
  agentName,
  initial,
}: {
  agent: ScheduledAgent;
  agentName: string;
  initial: Task[];
}) {
  if (initial.length === 0) {
    return (
      <div className="pl-card">
        <div className="pl-card-title">Scheduled tasks</div>
        <p className="pl-card-body" style={{ marginTop: 8 }}>
          No scheduled tasks yet. Ask {agentName} to set one up in Cowork —
          once it&apos;s created there, it shows up here so you can pause or
          resume it any time without opening Claude.
        </p>
      </div>
    );
  }

  return (
    <>
      {initial.map((task) => (
        <TaskCard key={task.task_name} agent={agent} agentName={agentName} initial={task} />
      ))}
    </>
  );
}

function TaskCard({
  agent,
  agentName,
  initial,
}: {
  agent: ScheduledAgent;
  agentName: string;
  initial: Task;
}) {
  const [task, setTask] = useState<Task>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    const nextState = task.state === "active" ? "paused" : "active";
    try {
      const res = await fetch(
        `/api/portal/tasks/${agent}/${encodeURIComponent(task.task_name)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: nextState }),
        }
      );
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
    <div className="pl-card" style={{ marginBottom: 16 }}>
      <div className="pl-card-title">{task.task_name}</div>
      <p className="pl-card-body" style={{ marginBottom: 16, marginTop: 4 }}>
        {`${agentName} checks this specific task before it runs and stays quiet while it's paused.`}
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
