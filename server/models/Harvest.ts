import mongoose, { Schema, Document } from 'mongoose';

export interface IHarvest extends Document {
  userId: mongoose.Types.ObjectId | string;
  cropName: string;
  plotName: string;
  harvestDate: string;
  quantityQuintals: number;
  sellingPricePerQuintal: number;
  totalRevenue: number;
  buyerName?: string;
  mandiSlipNo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HarvestSchema = new Schema<IHarvest>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    plotName: {
      type: String,
      default: 'Main Plot',
    },
    harvestDate: {
      type: String,
      required: true,
    },
    quantityQuintals: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPricePerQuintal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      required: true,
      min: 0,
    },
    buyerName: {
      type: String,
      default: 'APMC Mandi',
    },
    mandiSlipNo: {
      type: String,
      default: '',
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

export const HarvestModel = mongoose.models.Harvest || mongoose.model<IHarvest>('Harvest', HarvestSchema);
