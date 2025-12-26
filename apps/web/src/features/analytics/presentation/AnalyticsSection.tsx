"use client";

import { useMemo } from "react";

import { getApiBaseUrl } from "../../../shared/lib/env";
import { usePollingStats } from "../application/usePollingStats";
import { ExportPanel } from "./ExportPanel";
import { StatsDashboard } from "./StatsDashboard";

export function AnalyticsSection() {
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const pollingIntervalMs = 2000;

  const { stats, isLoading, error, lastUpdatedAt, refresh } = usePollingStats(apiBaseUrl, pollingIntervalMs);

  return (
    <section className="flex flex-col gap-4">
      <StatsDashboard
        stats={stats}
        isLoading={isLoading}
        error={error}
        lastUpdatedAt={lastUpdatedAt}
        pollingIntervalMs={pollingIntervalMs}
        onRefresh={refresh}
      />

      <ExportPanel apiBaseUrl={apiBaseUrl} stats={stats} />
    </section>
  );
}







