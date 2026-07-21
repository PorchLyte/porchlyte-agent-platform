"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AGENT_ORDER, AGENTS, FOUNDATIONS, FOUNDATION_ORDER } from "@/lib/porchlyte/content";
import type { FoundationKind, TeamAgent } from "@/lib/porchlyte/constants";

export type SidebarStatus = {
  foundations: Partial<Record<FoundationKind, string>>;
  team: Partial<Record<TeamAgent, string>>;
};

function Chevron({ open }: { open: boolean }) {
  return <span className={`pl-chevron${open ? " open" : ""}`}>▶</span>;
}

export function Sidebar({ status }: { status: SidebarStatus }) {
  const pathname = usePathname();
  const router = useRouter();

  const [foundOpen, setFoundOpen] = useState(pathname.includes("/foundations"));
  const [agentsOpen, setAgentsOpen] = useState(pathname.includes("/agents"));

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="pl-sidebar">
      <div className="pl-brand">
        <span className="pl-brand-mark">PorchLyte</span>
        <span className="pl-brand-sub">Hub</span>
      </div>

      <Link href="/hub" className={`pl-nav-item${pathname === "/hub" ? " active" : ""}`}>
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
            const href = `/hub/foundations/${kind}`;
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
            const href = `/hub/agents/${agent}`;
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

      <div className="pl-nav-spacer" />

      <Link href="/hub/account" className={`pl-nav-item${pathname === "/hub/account" ? " active" : ""}`}>
        Account
      </Link>
      <button className="pl-nav-item" onClick={signOut}>
        Sign out
      </button>
    </aside>
  );
}
