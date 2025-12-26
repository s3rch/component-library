import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useRef } from "react";

import type { TrackInput } from "../domain/trackingEvent";
import { generateSessionId, type TrackingConfig, TrackingService } from "../application/trackingService";
import { TrackingContext, type TrackingContextValue } from "./TrackingContext";

export interface TrackingProviderConfig {
  apiBaseUrl: string;
  enabled?: boolean;
  appId?: string;
  sessionId?: string;
  flushIntervalMs?: number;
  maxQueueSize?: number;
}

export interface TrackingProviderProps extends PropsWithChildren {
  config: TrackingProviderConfig;
}

let activeService: TrackingService | null = null;

export function trackEvent(event: TrackInput): Promise<void> {
  try {
    return activeService?.track(event) ?? Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}

export function TrackingProvider({ config, children }: TrackingProviderProps) {
  const generatedSessionIdRef = useRef<string>(generateSessionId());
  const sessionId = config.sessionId ?? generatedSessionIdRef.current;

  const service = useMemo(() => {
    const serviceConfig: TrackingConfig = {
      apiBaseUrl: config.apiBaseUrl,
      sessionId,
      ...(typeof config.enabled === "boolean" ? { enabled: config.enabled } : {}),
      ...(typeof config.appId === "string" ? { appId: config.appId } : {}),
      ...(typeof config.flushIntervalMs === "number" ? { flushIntervalMs: config.flushIntervalMs } : {}),
      ...(typeof config.maxQueueSize === "number" ? { maxQueueSize: config.maxQueueSize } : {})
    };
    return new TrackingService(serviceConfig);
  }, [config.apiBaseUrl, config.enabled, config.appId, sessionId, config.flushIntervalMs, config.maxQueueSize]);

  useEffect(() => {
    activeService = service;
    return () => {
      if (activeService === service) activeService = null;
    };
  }, [service]);

  useEffect(() => {
    const intervalMs = config.flushIntervalMs ?? 2000;
    if (config.enabled === false) return;

    const id = globalThis.setInterval(() => {
      void service.flush();
    }, intervalMs);

    return () => globalThis.clearInterval(id);
  }, [config.enabled, config.flushIntervalMs, service]);

  const value: TrackingContextValue = useMemo(
    () => ({
      track: async (event: TrackInput) => {
        await service.track(event);
      },
      sessionId,
      enabled: config.enabled ?? true
    }),
    [service, sessionId, config.enabled]
  );

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}


