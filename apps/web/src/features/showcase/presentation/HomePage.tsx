"use client";

import { AuthSection } from "../../auth/presentation/AuthSection";
import { AnalyticsSection } from "../../analytics/presentation/AnalyticsSection";
import { TrackingStatus } from "../../../shared/ui/TrackingStatus";
import { ShowcaseSection } from "./ShowcaseSection";

export function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Library Components — Demo</h1>
        <p className="text-sm text-slate-600">
          UI components (<span className="font-mono">@repo/ui</span>) + tracking (<span className="font-mono">@repo/tracking</span>) + API.
        </p>
      </header>

      <TrackingStatus />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ShowcaseSection />
        <AnalyticsSection />
      </div>

      <AuthSection />

      <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500">
        Tips: haz click en botones, focus/blur en inputs, abre/cierra el modal y luego mira el dashboard (polling cada 2s).
      </footer>
    </div>
  );
}







