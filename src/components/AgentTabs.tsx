"use client";

import { useState } from "react";
import type { ScheduledAgent } from "@/lib/porchlyte/constants";
import type { AgentContent } from "@/lib/porchlyte/content";
import { CopyButton } from "./CopyButton";
import { ScheduleList } from "./SchedulePanel";

type TaskState = {
  task_name: string;
  state: "active" | "paused";
  schedule_label: string | null;
  last_run_at: string | null;
  last_run_summary: string | null;
};

type Usage = {
  total: number;
  lastActive: string | null;
};

type Props = {
  content: AgentContent;
  status: string;
  scheduled: boolean;
  scheduledAgent: ScheduledAgent | null;
  teamUnlocked: boolean;
  usage: Usage;
  tasks: TaskState[] | null;
};

const STATUS_LABEL: Record<string, string> = {
  hired: "Active",
  partial: "In progress",
  not_hired: "Not hired yet",
};

export function AgentTabs({
  content,
  status,
  scheduled,
  scheduledAgent,
  teamUnlocked,
  usage,
  tasks,
}: Props) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "prompts", label: "Prompt Library", count: content.prompts.length },
    ...(scheduled ? [{ id: "schedule", label: "Scheduled Runs" }] : []),
  ];
  const [active, setActive] = useState(tabs[0].id);

  return (
    <>
      <div className="pl-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={`pl-tab${active === t.id ? " active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
            {"count" in t && t.count !== undefined && (
              <span className="pl-tab-count">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {active === "overview" && (
        <div role="tabpanel">
          <div className="pl-stats">
            <div className="pl-stat">
              <div className="pl-stat-label">Status</div>
              <div className="pl-stat-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`pl-dot ${status}`} />
                {STATUS_LABEL[status] ?? status}
              </div>
            </div>
            <div className="pl-stat">
              <div className="pl-stat-label">Interactions</div>
              <div className={`pl-stat-value${usage.total === 0 ? " muted" : ""}`}>
                {usage.total === 0 ? "None yet" : usage.total.toLocaleString()}
              </div>
            </div>
            <div className="pl-stat">
              <div className="pl-stat-label">Last active</div>
              <div className={`pl-stat-value muted`}>
                {usage.lastActive
                  ? new Date(usage.lastActive).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </div>
            </div>
          </div>

          <div className="pl-card">
            <div className="pl-card-title">What {content.name} does</div>
            <p className="pl-card-body" style={{ marginTop: 8 }}>
              {content.intro}
            </p>
          </div>

          <div className="pl-section-label">Useful ways to use {content.name}</div>
          <div className="pl-card">
            <ul className="pl-list">
              {content.waysToUse.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>

          <div className="pl-section-label">Tips</div>
          <div className="pl-card">
            <ul className="pl-list">
              {content.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          {!teamUnlocked && (
            <div className="pl-diag" style={{ marginTop: 24 }}>
              {content.name} is part of the full team. Your current plan covers
              Foundations — upgrade to hire your agents.
            </div>
          )}
        </div>
      )}

      {active === "prompts" && (
        <div role="tabpanel">
          <p className="pl-page-sub" style={{ marginBottom: 18 }}>
            Copy any of these straight into Claude to put {content.name} to work.
            One click, paste, go.
          </p>
          <div className="pl-card">
            {content.prompts.map((p) => (
              <div key={p.title} className="pl-prompt">
                <div>
                  <div className="pl-prompt-title">{p.title}</div>
                  <div className="pl-prompt-text">{p.text}</div>
                </div>
                <CopyButton text={p.text} />
              </div>
            ))}
          </div>
        </div>
      )}

      {active === "schedule" && scheduledAgent && tasks && (
        <div role="tabpanel">
          <ScheduleList
            agent={scheduledAgent}
            agentName={content.name}
            initial={tasks}
          />
        </div>
      )}
    </>
  );
}
