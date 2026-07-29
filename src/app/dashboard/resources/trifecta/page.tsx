import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import {
  RESOURCE_LINKS,
  TRIFECTA_INSTALL,
  TRIFECTA_SKILLS,
} from "@/lib/porchlyte/resources";

export default function TrifectaPage() {
  return (
    <>
      <div className="pl-page-head">
        <div className="pl-q-count">
          <Link href="/dashboard/resources" className="pl-inline-link">
            Resources
          </Link>
        </div>
        <h1 className="pl-page-title">The Trifecta</h1>
        <p className="pl-page-sub">
          Three skills for the three highest-stakes moments: meeting a buyer,
          winning a listing, and getting a deal from accepted offer to keys.{" "}
          <a className="pl-inline-link" href={RESOURCE_LINKS.trifecta} target="_blank" rel="noreferrer">
            Full install guide
          </a>
          .
        </p>
      </div>

      <div className="pl-section-label">Install</div>
      <div className="pl-card">
        <ol className="pl-list" style={{ listStyle: "decimal", paddingLeft: 18 }}>
          {TRIFECTA_INSTALL.map((step) => (
            <li key={step} style={{ marginBottom: 8 }}>
              {step}
            </li>
          ))}
        </ol>
        <div className="pl-prompt" style={{ marginTop: 14 }}>
          <div>
            <div className="pl-prompt-title">Marketplace repo</div>
            <div className="pl-prompt-text">PorchLyte/real-estate-trifecta</div>
          </div>
          <CopyButton text="PorchLyte/real-estate-trifecta" />
        </div>
      </div>

      <div className="pl-section-label">The three moments</div>
      {TRIFECTA_SKILLS.map((s) => (
        <div key={s.id} className="pl-card" style={{ marginBottom: 16 }}>
          <div className="pl-tile-role">{s.moment}</div>
          <div className="pl-card-title" style={{ marginTop: 4 }}>
            {s.name}
          </div>
          <div className="pl-tile-role" style={{ marginTop: 4 }}>
            {s.tagline}
          </div>
          <p className="pl-card-body" style={{ marginTop: 10 }}>
            {s.builds}
          </p>
          <div className="pl-prompt" style={{ marginTop: 16 }}>
            <div>
              <div className="pl-prompt-title">Start with this</div>
              <div className="pl-prompt-text">{s.starterPrompt}</div>
            </div>
            <CopyButton text={s.starterPrompt} />
          </div>
        </div>
      ))}
    </>
  );
}
