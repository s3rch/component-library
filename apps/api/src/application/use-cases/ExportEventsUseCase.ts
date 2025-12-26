import type { TrackingEventRepository } from "../../domain/repositories/TrackingEventRepository";
import type { TrackingEvent } from "../../domain/entities/TrackingEvent";

export class ExportEventsUseCase {
  constructor(private readonly trackingRepository: TrackingEventRepository) {}

  async execute(input?: { limit?: number }): Promise<TrackingEvent[]> {
    const limit = input?.limit;
    return await this.trackingRepository.listEvents(typeof limit === "number" ? { limit } : undefined);
  }
}


