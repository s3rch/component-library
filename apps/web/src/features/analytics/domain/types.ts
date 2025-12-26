export interface TrackingEventDto {
  component: string;
  variant: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TrackingStatsDto {
  totalEvents: number;
  totalsByComponent: Record<string, number>;
  totalsByVariant?: Record<string, number>;
  totalsByAction?: Record<string, number>;
  recentEvents?: TrackingEventDto[];
}







