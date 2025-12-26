import type { TrackEventInputDto, TrackEventOutputDto } from "../dto/tracking";
import type { TrackingEventRepository } from "../../domain/repositories/TrackingEventRepository";

export class TrackEventUseCase {
  constructor(private readonly trackingRepository: TrackingEventRepository) {}

  async execute(input: TrackEventInputDto): Promise<TrackEventOutputDto> {
    const event = await this.trackingRepository.create({
      component: input.component,
      variant: input.variant,
      action: input.action,
      timestamp: new Date(),
      ...(typeof input.metadata !== "undefined" ? { metadata: input.metadata } : {})
    });

    return {
      event: {
        id: event.id,
        component: event.component,
        variant: event.variant,
        action: event.action,
        timestamp: event.timestamp.toISOString(),
        ...(event.metadata ? { metadata: event.metadata } : {})
      }
    };
  }
}


