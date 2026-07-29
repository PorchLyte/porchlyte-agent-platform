import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { PROJECT_TEMPLATES, RESOURCE_LINKS } from "@/lib/porchlyte/resources";

export default function ProjectsPage() {
  return (
    <>
      <div className="pl-page-head">
        <div className="pl-q-count">
          <Link href="/dashboard/resources" className="pl-inline-link">
            Resources
          </Link>
        </div>
        <h1 className="pl-page-title">Work in Projects</h1>
        <p className="pl-page-sub">
          Give every recurring job its own room. Copy the custom instructions
          into a Claude Project, drop in the knowledge list, and stop
          re-explaining the details every time.{" "}
          <a className="pl-inline-link" href={RESOURCE_LINKS.projectsWorkbook} target="_blank" rel="noreferrer">
            Full workbook (PDF)
          </a>
          .
        </p>
      </div>

      <div className="pl-diag" style={{ marginBottom: 22 }}>
        Chats inside a project don&apos;t share with each other. When something
        matters, save it back into Project knowledge so the whole room remembers.
      </div>

      {PROJECT_TEMPLATES.map((p) => (
        <div key={p.id} className="pl-card" style={{ marginBottom: 16 }}>
          <div className="pl-tile-head">
            <span className="pl-card-title">{p.name}</span>
            {p.featured && (
              <span className="pl-tile-role" style={{ margin: 0 }}>
                Featured
              </span>
            )}
          </div>
          <div className="pl-tile-role" style={{ marginTop: 4 }}>
            {p.agents}
          </div>
          <p className="pl-card-body" style={{ marginTop: 8 }}>
            {p.blurb}
          </p>

          <div className="pl-prompt" style={{ marginTop: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div className="pl-prompt-title">Custom instructions</div>
              <div className="pl-prompt-text" style={{ whiteSpace: "pre-wrap" }}>
                {p.instructions}
              </div>
            </div>
            <CopyButton text={p.instructions} />
          </div>

          <div className="pl-section-label" style={{ marginTop: 18 }}>
            Knowledge to drop in the room
          </div>
          <ul className="pl-list">
            {p.knowledge.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
