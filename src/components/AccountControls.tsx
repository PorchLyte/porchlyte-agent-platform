"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccountControls({ linked }: { linked: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "export" | "disconnect">(null);
  const [error, setError] = useState<string | null>(null);

  async function exportData() {
    setBusy("export");
    setError(null);
    try {
      const res = await fetch("/api/portal/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "porchlyte-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  async function disconnect() {
    setBusy("disconnect");
    setError(null);
    try {
      const res = await fetch("/api/portal/connector", { method: "DELETE" });
      if (!res.ok) throw new Error("Couldn't disconnect");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button className="pl-btn pl-btn-ghost" onClick={exportData} disabled={busy !== null}>
          {busy === "export" ? "Preparing…" : "Export my data"}
        </button>
        {linked && (
          <button className="pl-btn pl-btn-ghost" onClick={disconnect} disabled={busy !== null}>
            {busy === "disconnect" ? "Disconnecting…" : "Disconnect Claude"}
          </button>
        )}
      </div>
      {error && <p className="pl-error">{error}</p>}
    </>
  );
}
