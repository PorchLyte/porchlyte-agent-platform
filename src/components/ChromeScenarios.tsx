"use client";

import { useMemo, useState } from "react";
import {
  CHROME_CATEGORIES,
  CHROME_SCENARIO_COUNT,
  type ChromeCategory,
} from "@/lib/porchlyte/chrome-prompts";
import { CopyButton } from "./CopyButton";

export function ChromeScenarios() {
  const [activeId, setActiveId] = useState<string>(CHROME_CATEGORIES[0]?.id ?? "");
  const [query, setQuery] = useState("");

  const active: ChromeCategory | undefined = useMemo(
    () => CHROME_CATEGORIES.find((c) => c.id === activeId) ?? CHROME_CATEGORIES[0],
    [activeId]
  );

  const filtered = useMemo(() => {
    if (!active) return [];
    const q = query.trim().toLowerCase();
    if (!q) return active.scenarios;
    return active.scenarios.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.website.toLowerCase().includes(q) ||
        s.prompt.toLowerCase().includes(q)
    );
  }, [active, query]);

  return (
    <>
      <p className="pl-page-sub" style={{ marginBottom: 18 }}>
        {CHROME_SCENARIO_COUNT} scenarios across {CHROME_CATEGORIES.length}{" "}
        categories. Open the website in the row, open Claude in Chrome, paste the
        prompt.
      </p>

      <div className="pl-field" style={{ marginBottom: 18, maxWidth: 420 }}>
        <label htmlFor="chrome-search">Search this category</label>
        <input
          id="chrome-search"
          type="search"
          className="pl-input"
          placeholder="e.g. open house, nurture, inspection…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="pl-chrome-cats" role="tablist" aria-label="Chrome categories">
        {CHROME_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === active?.id}
            className={`pl-chrome-cat${c.id === active?.id ? " active" : ""}`}
            onClick={() => {
              setActiveId(c.id);
              setQuery("");
            }}
          >
            <span>{c.name}</span>
            <span className="pl-tab-count">{c.scenarios.length}</span>
          </button>
        ))}
      </div>

      {active && (
        <div role="tabpanel" style={{ marginTop: 22 }}>
          <div className="pl-section-label">{active.name}</div>
          <p className="pl-card-body" style={{ marginBottom: 12 }}>
            {active.covers}
            {active.tip ? ` Tip: ${active.tip}` : ""}
          </p>

          {filtered.length === 0 ? (
            <div className="pl-diag">No scenarios match that search.</div>
          ) : (
            filtered.map((s) => (
              <div key={s.n} className="pl-card" style={{ marginBottom: 12 }}>
                <div className="pl-tile-head">
                  <span className="pl-card-title">
                    #{s.n} · {s.title}
                  </span>
                </div>
                <div className="pl-tile-role" style={{ marginTop: 6 }}>
                  Open: {s.website}
                </div>
                <div className="pl-prompt" style={{ marginTop: 14 }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="pl-prompt-title">Prompt to paste</div>
                    <div className="pl-prompt-text">{s.prompt}</div>
                  </div>
                  <CopyButton text={s.prompt} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
