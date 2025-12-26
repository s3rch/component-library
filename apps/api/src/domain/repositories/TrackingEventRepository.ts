import type { TrackingEvent } from "../entities/TrackingEvent";

export interface TrackingStats {
  totalEvents: number;
  totalsByComponent: Record<string, number>;
  totalsByVariant: Record<string, number>;
  totalsByAction: Record<string, number>;
  recentEvents: Array<Omit<TrackingEvent, "id">>;
}

export interface TrackingEventRepository {
  create(input: Omit<TrackingEvent, "id">): Promise<TrackingEvent>;
  getStats(input?: { recentLimit?: number }): Promise<TrackingStats>;
  listEvents(input?: { limit?: number }): Promise<TrackingEvent[]>;
}


