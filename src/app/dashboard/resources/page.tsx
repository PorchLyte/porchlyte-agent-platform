import Link from "next/link";
import { RESOURCE_LINKS, RESOURCE_NAV } from "@/lib/porchlyte/resources";

export default function ResourcesPage() {
  return (
    <>
      <div className="pl-page-head">
        <div className="pl-q-count">Course companion</div>
        <h1 className="pl-page-title">Resources</h1>
        <p className="pl-page-sub">
          Tracy&apos;s prompts, project templates, and frameworks — ready to copy
          into Claude. Your full course still lives in GoHighLevel; this is the
          always-on home for the pieces you use every week.
        </p>
      </div>

      <div className="pl-grid">
        {RESOURCE_NAV.map((r) => (
          <Link key={r.id} href={r.href} className="pl-tile">
            <div className="pl-tile-head">
              <span className="pl-tile-name">{r.label}</span>
            </div>
            <p className="pl-tile-body" style={{ marginTop: 8 }}>
              {r.blurb}
            </p>
          </Link>
        ))}
      </div>

      <div className="pl-section-label">Original course files</div>
      <div className="pl-card">
        <ul className="pl-list">
          <li>
            <a className="pl-inline-link" href={RESOURCE_LINKS.dayInTheLife} target="_blank" rel="noreferrer">
              A Day with Your AI Team
            </a>
          </li>
          <li>
            <a className="pl-inline-link" href={RESOURCE_LINKS.projectsWorkbook} target="_blank" rel="noreferrer">
              Work in Projects workbook (PDF)
            </a>
          </li>
          <li>
            <a className="pl-inline-link" href={RESOURCE_LINKS.trifecta} target="_blank" rel="noreferrer">
              The Trifecta · Agent AI Studio
            </a>
          </li>
          <li>
            <a className="pl-inline-link" href={RESOURCE_LINKS.chromeSheet} target="_blank" rel="noreferrer">
              Claude in Chrome scenarios (spreadsheet)
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
