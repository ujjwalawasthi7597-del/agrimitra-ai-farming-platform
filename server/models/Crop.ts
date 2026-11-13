import mongoose, { Schema, Document } from 'mongoose';

export interface ICrop extends Document {
  userId: mongoose.Types.ObjectId | string;
  farmId: string;
  farmName: string;
  cropName: string;
  variety: string;
  category: string;
  areaAcres: number;
  sowingDate: string;
  expectedHarvestDate?: string;
  stage: string;
  stageProgressPercent: number;
  targetYieldQuintals: number;
  healthStatus: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema = new Schema<ICrop>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    farmId: {
      type: String,
      default: '',
    },
    farmName: {
      type: String,
      default: 'Main Plot',
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    variety: {
      type: String,
      default: 'Improved',
      trim: true,
    },
    category: {
      type: String,
      default: 'Rabi / Food Grain',
    },
    areaAcres: {
      type: Number,
      required: true,
      min: 0.1,
    },
    sowingDate: {
      type: String,
      required: true,
    },
    expectedHarvestDate: {
      type: String,
      default: '',
    },
    stage: {
      type: String,
      default: 'Early Vegetative',
    },
    stageProgressPercent: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    targetYieldQuintals: {
      type: Number,
      default: 25,
    },
    healthStatus: {
      type: String,
      default: 'Good',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const CropModel = mongoose.models.Crop || mongoose.model<ICrop>('Crop', CropSchema);
