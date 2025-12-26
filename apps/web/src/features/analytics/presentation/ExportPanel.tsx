"use client";

import { useMemo, useState } from "react";

import { Button } from "@repo/ui";

import { useAuth } from "../../auth/presentation/useAuth";
import { apiGetBlob } from "../../../shared/lib/apiClient";
import { downloadBlob, getFilenameFromContentDisposition } from "../../../shared/lib/download";
import type { TrackingStatsDto } from "../domain/types";

export function ExportPanel(props: { apiBaseUrl: string; stats: TrackingStatsDto | null }) {
  const { token, status } = useAuth();
  const isLoggedIn = status === "authenticated" && typeof token === "string" && token.length > 0;

  const [csvState, setCsvState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [csvMessage, setCsvMessage] = useState<string | null>(null);

  const [jsonState, setJsonState] = useState<"idle" | "success">("idle");

  const jsonPayload = useMemo(
    () => ({
      generatedAt: new Date().toISOString(),
      stats: props.stats
    }),
    [props.stats]
  );

  const exportCsv = async () => {
    if (!isLoggedIn || !token) return;

    setCsvState("loading");
    setCsvMessage(null);

    const res = await apiGetBlob(props.apiBaseUrl, "/api/components/export", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      setCsvState("error");
      setCsvMessage(res.error.message);
      return;
    }

    const header = res.data.headers.get("content-disposition");
    const filename = getFilenameFromContentDisposition(header, "tracking-events.csv");
    downloadBlob(filename, res.data.blob);

    setCsvState("success");
    setCsvMessage(`CSV descargado: ${filename}`);
  };

  const exportJson = () => {
    const filename = `stats-${new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-")}.json`;
    const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: "application/json" });
    downloadBlob(filename, blob);
    setJsonState("success");
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-medium text-slate-900">Export</h3>
        <p className="text-xs text-slate-500">
          CSV: GET /api/components/export (JWT requerido) · JSON: descarga local del estado actual.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="primary"
          state={csvState === "loading" ? "loading" : "default"}
          disabled={!isLoggedIn || csvState === "loading"}
          onClick={exportCsv}
        >
          Export CSV
        </Button>

        <Button variant="secondary" state="default" onClick={exportJson}>
          Export JSON
        </Button>
      </div>

      {!isLoggedIn && <p className="text-sm text-slate-600">Para exportar CSV necesitas estar logueado.</p>}

      {csvState === "error" && csvMessage && <p className="text-sm text-red-700">{csvMessage}</p>}
      {csvState === "success" && csvMessage && <p className="text-sm text-emerald-700">{csvMessage}</p>}
      {jsonState === "success" && <p className="text-sm text-emerald-700">JSON descargado.</p>}
    </section>
  );
}







