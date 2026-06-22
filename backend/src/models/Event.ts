import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  sessionId: string;
  eventType: string;
  pageUrl: string;
  timestamp: Date;
  metadata?: {
    browser?: string;
    os?: string;
    viewport?: string;
    referrer?: string;
    device?: string;
  };
  coordinates?: {
    x: number;
    y: number;
  };
}

const EventSchema: Schema = new Schema({
  sessionId: { type: String, required: true, index: true },
  eventType: { type: String, required: true, index: true },
  pageUrl: { type: String, required: true, index: true },
  timestamp: { type: Date, required: true, index: true },
  metadata: {
    browser: String,
    os: String,
    viewport: String,
    referrer: String,
    device: String,
  },
  coordinates: {
    x: Number,
    y: Number,
  },
});

export default mongoose.model<IEvent>('Event', EventSchema);
