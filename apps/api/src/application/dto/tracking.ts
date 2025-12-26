export interface TrackEventInputDto {
  component: string;
  variant: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface TrackEventOutputDto {
  event: {
    id: string;
    component: string;
    variant: string;
    action: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  };
}


