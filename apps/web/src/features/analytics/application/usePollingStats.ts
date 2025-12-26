"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { TrackingStatsDto } from "../domain/types";
import { fetchStats } from "../infrastructure/statsApi";

export interface UsePollingStatsResult {
  stats: TrackingStatsDto | null;
  isLoading: boolean;
  error: string | null;
  lastUpdatedAt: Date | null;
  refresh: () => void;
}

export function usePollingStats(baseUrl: string, intervalMs = 2000): UsePollingStatsResult {
  const [stats, setStats] = useState<TrackingStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const inFlightRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(false);

  const loadOnce = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const res = await fetchStats(baseUrl);
      if (!mountedRef.current) return;

      if (!res.ok) {
        setError(res.error.message);
        setIsLoading(false);
        return;
      }

      setStats(res.data);
      setError(null);
      setIsLoading(false);
      setLastUpdatedAt(new Date());
    } finally {
      inFlightRef.current = false;
    }
  }, [baseUrl]);

  useEffect(() => {
    mountedRef.current = true;
    void loadOnce();

    const id = window.setInterval(() => {
      void loadOnce();
    }, intervalMs);

    return () => {
      mountedRef.current = false;
      window.clearInterval(id);
    };
  }, [intervalMs, loadOnce]);

  const refresh = useCallback(() => {
    void loadOnce();
  }, [loadOnce]);

  return { stats, isLoading, error, lastUpdatedAt, refresh };
}







