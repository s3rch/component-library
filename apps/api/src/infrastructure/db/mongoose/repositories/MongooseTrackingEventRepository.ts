import mongoose from "mongoose";

import type { TrackingEvent } from "../../../../domain/entities/TrackingEvent";
import type {
  TrackingEventRepository,
  TrackingStats
} from "../../../../domain/repositories/TrackingEventRepository";
import { TrackingEventModel, type TrackingEventDoc } from "../models/TrackingEventModel";

function toDomainTrackingEvent(doc: mongoose.HydratedDocument<TrackingEventDoc>): TrackingEvent {
  return {
    id: doc._id.toString(),
    component: doc.component,
    variant: doc.variant,
    action: doc.action,
    timestamp: doc.timestamp,
    ...(typeof doc.metadata !== "undefined" ? { metadata: doc.metadata } : {})
  };
}

type GroupCount = { _id: string; count: number };

function groupCountsToRecord(groups: GroupCount[]): Record<string, number> {
  return Object.fromEntries(groups.map((g) => [g._id, g.count]));
}

export class MongooseTrackingEventRepository implements TrackingEventRepository {
  async create(input: Omit<TrackingEvent, "id">): Promise<TrackingEvent> {
    const doc = await TrackingEventModel.create(input);
    return toDomainTrackingEvent(doc);
  }

  async getStats(input?: { recentLimit?: number }): Promise<TrackingStats> {
    const recentLimit = input?.recentLimit ?? 20;

    interface StatsAgg {
      totalEvents: Array<{ count: number }>;
      totalsByComponent: GroupCount[];
      totalsByVariant: GroupCount[];
      totalsByAction: GroupCount[];
      recentEvents: Array<Omit<TrackingEvent, "id">>;
    }

    const [result] = await TrackingEventModel.aggregate<StatsAgg>([
      {
        $facet: {
          totalEvents: [{ $count: "count" }],
          totalsByComponent: [{ $group: { _id: "$component", count: { $sum: 1 } } }],
          totalsByVariant: [{ $group: { _id: "$variant", count: { $sum: 1 } } }],
          totalsByAction: [{ $group: { _id: "$action", count: { $sum: 1 } } }],
          recentEvents: [
            { $sort: { timestamp: -1 } },
            { $limit: recentLimit },
            {
              $project: {
                _id: 0,
                component: 1,
                variant: 1,
                action: 1,
                timestamp: 1,
                metadata: 1
              }
            }
          ]
        }
      }
    ]).exec();

    const totalEvents = result?.totalEvents?.[0]?.count ?? 0;
    const totalsByComponent = groupCountsToRecord(result?.totalsByComponent ?? []);
    const totalsByVariant = groupCountsToRecord(result?.totalsByVariant ?? []);
    const totalsByAction = groupCountsToRecord(result?.totalsByAction ?? []);
    const recentEvents = result?.recentEvents ?? [];

    return {
      totalEvents,
      totalsByComponent,
      totalsByVariant,
      totalsByAction,
      recentEvents
    };
  }

  async listEvents(input?: { limit?: number }): Promise<TrackingEvent[]> {
    const limit = input?.limit;
    const query = TrackingEventModel.find().sort({ timestamp: -1 });
    if (typeof limit === "number") {
      query.limit(limit);
    }
    const docs = await query.exec();
    return docs.map(toDomainTrackingEvent);
  }
}


