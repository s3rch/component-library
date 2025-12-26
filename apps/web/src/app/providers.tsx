"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useMemo } from "react";

import { TrackingProvider } from "@repo/tracking";
import { ensureDesignTokensApplied } from "@repo/ui";

import { AuthProvider } from "../features/auth/presentation/AuthProvider";
import { getApiBaseUrl } from "../shared/lib/env";

export function Providers({ children }: PropsWithChildren) {
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    ensureDesignTokensApplied();
  }, []);

  return (
    <TrackingProvider
      config={{
        apiBaseUrl,
        // Keep flush interval lower than polling interval so stats update feels "near real-time".
        flushIntervalMs: 500
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </TrackingProvider>
  );
}







