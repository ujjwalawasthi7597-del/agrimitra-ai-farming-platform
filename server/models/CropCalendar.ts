import mongoose, { Schema, Document } from 'mongoose';

export interface ICropCalendar extends Document {
  userId: mongoose.Types.ObjectId | string;
  cropId?: string;
  cropName: string;
  activityType: string;
  title: string;
  description?: string;
  scheduledDate: string;
  status: 'Pending' | 'Upcoming' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  createdAt: Date;
  updatedAt: Date;
}

const CropCalendarSchema = new Schema<ICropCalendar>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    cropId: {
      type: String,
      default: '',
    },
    cropName: {
      type: String,
      default: 'Farm Common',
    },
    activityType: {
      type: String,
      default: 'General Care',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    scheduledDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Upcoming', 'Completed'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
  },
  {
    timestamps: true,
  }
);

export const CropCalendarModel =
  mongoose.models.CropCalendar || mongoose.model<ICropCalendar>('CropCalendar', CropCalendarSchema);
