import { createContext } from "react";

import type { TrackInput } from "../domain/trackingEvent";

export interface TrackingContextValue {
  track: (event: TrackInput) => Promise<void>;
  sessionId: string;
  enabled: boolean;
}

export const TrackingContext = createContext<TrackingContextValue | null>(null);







