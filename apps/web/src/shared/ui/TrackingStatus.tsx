"use client";

import { useEffect, useMemo, useState } from "react";

import { useTracking } from "@repo/tracking";

import { getApiBaseUrl } from "../lib/env";

export function TrackingStatus() {
  const { sessionId, enabled } = useTracking();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-900">Tracking</p>
      <p className="mt-1 text-xs text-slate-600">
        enabled: <span className="font-mono">{String(enabled)}</span>
      </p>
      <p className="mt-1 text-xs text-slate-600">
        sessionId:{" "}
        <span className="font-mono">
          {mounted ? (sessionId || "(no-op)") : "(hydrating)"}
        </span>
      </p>
      <p className="mt-1 text-xs text-slate-600">
        apiBaseUrl: <span className="font-mono">{apiBaseUrl}</span>
      </p>
    </div>
  );
}




