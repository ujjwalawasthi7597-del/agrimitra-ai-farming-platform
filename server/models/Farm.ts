import mongoose, { Schema, Document } from 'mongoose';

export interface IFarm extends Document {
  userId: mongoose.Types.ObjectId | string;
  name: string;
  areaAcres: number;
  soilType: string;
  waterSource: string;
  irrigationType: string;
  locationDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FarmSchema = new Schema<IFarm>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    areaAcres: {
      type: Number,
      required: true,
      min: 0.1,
    },
    soilType: {
      type: String,
      default: 'Alluvial Loam',
    },
    waterSource: {
      type: String,
      default: 'Borewell',
    },
    irrigationType: {
      type: String,
      default: 'Drip Irrigation',
    },
    locationDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const FarmModel = mongoose.models.Farm || mongoose.model<IFarm>('Farm', FarmSchema);
