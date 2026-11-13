import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultation extends Document {
  userId: mongoose.Types.ObjectId | string;
  cropName: string;
  plotName: string;
  subject: string;
  description: string;
  imageUrl?: string;
  urgency: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  assignedExpert?: string;
  expertReply?: string;
  farmerFollowup?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema = new Schema<IConsultation>(
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
    plotName: {
      type: String,
      default: 'Main Plot',
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    urgency: {
      type: String,
      default: 'Normal',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'In Progress',
    },
    assignedExpert: {
      type: String,
      default: 'Dr. Anand Verma (Senior Agronomist, ICAR-IARI)',
    },
    expertReply: {
      type: String,
      default: '',
    },
    farmerFollowup: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const ConsultationModel =
  mongoose.models.Consultation || mongoose.model<IConsultation>('Consultation', ConsultationSchema);
