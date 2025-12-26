import type { TrackingStatsDto } from "../dto/stats";
import type { TrackingEventRepository } from "../../domain/repositories/TrackingEventRepository";

export class GetStatsUseCase {
  constructor(private readonly trackingRepository: TrackingEventRepository) {}

  async execute(): Promise<TrackingStatsDto> {
    const stats = await this.trackingRepository.getStats({ recentLimit: 20 });

    return {
      totalEvents: stats.totalEvents,
      totalsByComponent: stats.totalsByComponent,
      totalsByVariant: stats.totalsByVariant,
      totalsByAction: stats.totalsByAction,
      recentEvents: stats.recentEvents.map((e) => ({
        component: e.component,
        variant: e.variant,
        action: e.action,
        timestamp: e.timestamp.toISOString(),
        ...(e.metadata ? { metadata: e.metadata } : {})
      }))
    };
  }
}


