"use client";

import type { TrackingStatsDto } from "../domain/types";

export interface StatsDashboardProps {
  stats: TrackingStatsDto | null;
  isLoading: boolean;
  error: string | null;
  lastUpdatedAt: Date | null;
  pollingIntervalMs: number;
  onRefresh: () => void;
}

export function StatsDashboard({ stats, isLoading, error, lastUpdatedAt, pollingIntervalMs, onRefresh }: StatsDashboardProps) {
  const totalEvents = stats?.totalEvents ?? 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Real-time Statistics</h2>
          <p className="text-sm text-slate-600">Polling cada {pollingIntervalMs}ms a GET /api/components/stats</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-1">
          <p className="text-sm text-slate-600">Interaction counter</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{totalEvents}</p>
          <p className="mt-2 text-xs text-slate-500">
            {isLoading ? "Cargando…" : error ? `Error: ${error}` : lastUpdatedAt ? `Actualizado: ${lastUpdatedAt.toLocaleTimeString()}` : ""}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
          <p className="text-sm font-medium text-slate-900">Totales por componente</p>
          <div className="mt-3">
            <KeyValueList record={stats?.totalsByComponent} emptyLabel="Sin datos todavía." />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-900">Totales por acción</p>
          <div className="mt-3">
            <KeyValueList record={stats?.totalsByAction} emptyLabel="(No disponible)" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-900">Totales por variante</p>
          <div className="mt-3">
            <KeyValueList record={stats?.totalsByVariant} emptyLabel="(No disponible)" />
          </div>
        </div>
      </div>

      {stats?.recentEvents && stats.recentEvents.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-900">Eventos recientes</p>
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Component</th>
                  <th className="py-2 pr-3">Variant</th>
                  <th className="py-2 pr-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentEvents.slice(0, 20).map((e, idx) => (
                  <tr key={`${e.timestamp}-${idx}`} className="text-slate-800">
                    <td className="py-2 pr-3 font-mono text-xs text-slate-600">{formatTime(e.timestamp)}</td>
                    <td className="py-2 pr-3">{e.component}</td>
                    <td className="py-2 pr-3">{e.variant}</td>
                    <td className="py-2 pr-3">{e.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function KeyValueList(props: { record: Record<string, number> | undefined; emptyLabel: string }) {
  const entries = Object.entries(props.record ?? {}).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <p className="text-sm text-slate-500">{props.emptyLabel}</p>;

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <li key={k} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <span className="truncate text-sm text-slate-800">{k}</span>
          <span className="ml-3 tabular-nums text-sm font-medium text-slate-900">{v}</span>
        </li>
      ))}
    </ul>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString();
}







