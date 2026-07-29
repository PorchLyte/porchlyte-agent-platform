import Link from "next/link";
import { ChromeScenarios } from "@/components/ChromeScenarios";
import { RESOURCE_LINKS } from "@/lib/porchlyte/resources";

export default function ChromePage() {
  return (
    <>
      <div className="pl-page-head">
        <div className="pl-q-count">
          <Link href="/dashboard/resources" className="pl-inline-link">
            Resources
          </Link>
        </div>
        <h1 className="pl-page-title">Claude in Chrome</h1>
        <p className="pl-page-sub">
          Use Claude on the page you&apos;re already looking at — Instagram, your
          CRM, MLS, docs, and more.{" "}
          <a
            className="pl-inline-link"
            href={RESOURCE_LINKS.chromeSheet}
            target="_blank"
            rel="noreferrer"
          >
            Original spreadsheet
          </a>
          .
        </p>
      </div>

      <ChromeScenarios />
    </>
  );
}
