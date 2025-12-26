export interface TrackingEvent {
  component: string;
  variant: string;
  action: string;
  /**
   * ISO 8601 timestamp (transport-friendly).
   * Example: 2025-01-01T00:00:00.000Z
   */
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type TrackInput = Omit<TrackingEvent, "timestamp">;







