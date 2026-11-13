import mongoose, { Schema, Document } from 'mongoose';

export interface IDiseaseReport extends Document {
  userId: mongoose.Types.ObjectId | string;
  cropName: string;
  diseaseName: string;
  vernacularName?: string;
  confidence: number;
  healthStatus: string;
  severity: string;
  symptoms: string[];
  probableCauses: string[];
  preventiveMeasures: string[];
  recommendedTreatments: string[];
  disclaimer: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiseaseReportSchema = new Schema<IDiseaseReport>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    cropName: {
      type: String,
      required: true,
    },
    diseaseName: {
      type: String,
      required: true,
    },
    vernacularName: {
      type: String,
      default: '',
    },
    confidence: {
      type: Number,
      default: 85,
    },
    healthStatus: {
      type: String,
      default: 'Diseased',
    },
    severity: {
      type: String,
      default: 'Moderate',
    },
    symptoms: {
      type: [String],
      default: [],
    },
    probableCauses: {
      type: [String],
      default: [],
    },
    preventiveMeasures: {
      type: [String],
      default: [],
    },
    recommendedTreatments: {
      type: [String],
      default: [],
    },
    disclaimer: {
      type: String,
      default: 'AI disease detection is an assistive preliminary screening.',
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const DiseaseReportModel =
  mongoose.models.DiseaseReport || mongoose.model<IDiseaseReport>('DiseaseReport', DiseaseReportSchema);
