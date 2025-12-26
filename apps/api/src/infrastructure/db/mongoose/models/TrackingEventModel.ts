import mongoose, { Schema } from "mongoose";

export interface TrackingEventDoc {
  component: string;
  variant: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

const trackingEventSchema = new Schema<TrackingEventDoc>(
  {
    component: { type: String, required: true, trim: true },
    variant: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    timestamp: { type: Date, required: true, default: () => new Date() },
    metadata: { type: Schema.Types.Mixed, required: false }
  },
  { collection: "tracking_events", versionKey: false }
);

trackingEventSchema.index({ timestamp: -1 });
trackingEventSchema.index({ component: 1, timestamp: -1 });

export const TrackingEventModel: mongoose.Model<TrackingEventDoc> =
  (mongoose.models.TrackingEvent as mongoose.Model<TrackingEventDoc> | undefined) ??
  mongoose.model<TrackingEventDoc>("TrackingEvent", trackingEventSchema, "tracking_events");


