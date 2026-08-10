"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AGENT_ORDER, AGENTS, FOUNDATIONS, FOUNDATION_ORDER } from "@/lib/porchlyte/content";
import { RESOURCE_NAV } from "@/lib/porchlyte/resources";
import type { FoundationKind, TeamAgent } from "@/lib/porchlyte/constants";

export type SidebarStatus = {
  foundations: Partial<Record<FoundationKind, string>>;
  team: Partial<Record<TeamAgent, string>>;
};

function Chevron({ open }: { open: boolean }) {
  return <span className={`pl-chevron${open ? " open" : ""}`}>▶</span>;
}

export function Sidebar({
  status,
  isAdmin,
}: {
  status: SidebarStatus;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [foundOpen, setFoundOpen] = useState(pathname.includes("/foundations"));
  const [agentsOpen, setAgentsOpen] = useState(pathname.includes("/agents"));
  const [resourcesOpen, setResourcesOpen] = useState(
    pathname.startsWith("/dashboard/resources")
  );

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="pl-sidebar">
      <div className="pl-brand">
        <span className="pl-brand-mark">PorchLyte</span>
        <span className="pl-brand-sub">AI Agent Hub</span>
      </div>

      <Link href="/dashboard" className={`pl-nav-item${pathname === "/dashboard" ? " active" : ""}`}>
        Home
      </Link>

      {/* Foundations group */}
      <button className="pl-nav-group-btn" onClick={() => setFoundOpen((v) => !v)}>
        <span className="pl-nav-group-label">Foundations</span>
        <Chevron open={foundOpen} />
      </button>
      {foundOpen && (
        <div className="pl-subnav">
          {FOUNDATION_ORDER.map((kind) => {
            const href = `/dashboard/foundations/${kind}`;
            const st = status.foundations[kind] ?? "empty";
            return (
              <Link key={kind} href={href} className={`pl-subnav-item${pathname === href ? " active" : ""}`}>
                <span>{FOUNDATIONS[kind].label}</span>
                <span className={`pl-dot ${st}`} title={st} />
              </Link>
            );
          })}
        </div>
      )}

      {/* Agents group */}
      <button className="pl-nav-group-btn" onClick={() => setAgentsOpen((v) => !v)}>
        <span className="pl-nav-group-label">Agents</span>
        <Chevron open={agentsOpen} />
      </button>
      {agentsOpen && (
        <div className="pl-subnav">
          {AGENT_ORDER.map((agent) => {
            const href = `/dashboard/agents/${agent}`;
            const st = status.team[agent] ?? "not_hired";
            return (
              <Link key={agent} href={href} className={`pl-subnav-item${pathname === href ? " active" : ""}`}>
                <span>{AGENTS[agent].name}</span>
                <span className={`pl-dot ${st}`} title={st} />
              </Link>
            );
          })}
        </div>
      )}

      {/* Resources group */}
      <button
        className="pl-nav-group-btn"
        onClick={() => setResourcesOpen((v) => !v)}
      >
        <span className="pl-nav-group-label">Resources</span>
        <Chevron open={resourcesOpen} />
      </button>
      {resourcesOpen && (
        <div className="pl-subnav">
          <Link
            href="/dashboard/resources"
            className={`pl-subnav-item${pathname === "/dashboard/resources" ? " active" : ""}`}
          >
            <span>Overview</span>
          </Link>
          {RESOURCE_NAV.map((r) => (
            <Link
              key={r.id}
              href={r.href}
              className={`pl-subnav-item${pathname === r.href ? " active" : ""}`}
            >
              <span>{r.label}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="pl-nav-spacer" />

      {isAdmin && (
        <Link
          href="/dashboard/admin"
          className={`pl-nav-item${pathname.startsWith("/dashboard/admin") ? " active" : ""}`}
        >
          Admin
        </Link>
      )}
      <a
        href="/dashboard/setup"
        className="pl-nav-item"
        target="_blank"
        rel="noopener noreferrer"
      >
        Setup instructions
      </a>
      <Link href="/dashboard/account" className={`pl-nav-item${pathname === "/dashboard/account" ? " active" : ""}`}>
        Account
      </Link>
      <button className="pl-nav-item" onClick={signOut}>
        Sign out
      </button>
    </aside>
  );
}
