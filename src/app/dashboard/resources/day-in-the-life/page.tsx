import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { DAY_IN_THE_LIFE, RESOURCE_LINKS } from "@/lib/porchlyte/resources";

export default function DayInTheLifePage() {
  return (
    <>
      <div className="pl-page-head">
        <div className="pl-q-count">
          <Link href="/dashboard/resources" className="pl-inline-link">
            Resources
          </Link>
        </div>
        <h1 className="pl-page-title">A Day with Your AI Team</h1>
        <p className="pl-page-sub">
          One agent. One ordinary day. Five moments the team quietly carries —
          with the exact prompt to say.{" "}
          <a className="pl-inline-link" href={RESOURCE_LINKS.dayInTheLife} target="_blank" rel="noreferrer">
            Open the full piece
          </a>
          .
        </p>
      </div>

      {DAY_IN_THE_LIFE.map((m) => (
        <div key={m.time} className="pl-card" style={{ marginBottom: 16 }}>
          <div className="pl-tile-role">
            {m.time} · {m.agent}
          </div>
          <div className="pl-card-title" style={{ marginTop: 6 }}>
            {m.title}
          </div>
          <p className="pl-card-body" style={{ marginTop: 8 }}>
            {m.body}
          </p>
          <div className="pl-section-label" style={{ marginTop: 18 }}>
            To make this work
          </div>
          <ul className="pl-list">
            {m.toMakeThisWork.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <div className="pl-prompt" style={{ marginTop: 16 }}>
            <div>
              <div className="pl-prompt-title">Say this</div>
              <div className="pl-prompt-text">{m.sayThis}</div>
            </div>
            <CopyButton text={m.sayThis} />
          </div>
        </div>
      ))}
    </>
  );
}
