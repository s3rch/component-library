import { useContext } from "react";

import type { TrackInput } from "../domain/trackingEvent";
import { TrackingContext } from "./TrackingContext";

export function useTracking(): {
  track: (event: TrackInput) => Promise<void>;
  sessionId: string;
  enabled: boolean;
} {
  const ctx = useContext(TrackingContext);
  if (!ctx) {
    return {
      enabled: false,
      sessionId: "",
      track: async () => {
        // no-op if provider not mounted
      }
    };
  }
  return ctx;
}







