export interface TrackingEvent {
  id: string;
  component: string;
  variant: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}


