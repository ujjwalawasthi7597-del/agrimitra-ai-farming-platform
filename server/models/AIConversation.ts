import mongoose, { Schema, Document } from 'mongoose';

export interface IAIConversation extends Document {
  userId: mongoose.Types.ObjectId | string;
  userMessage: string;
  aiResponse: string;
  language: string;
  timestamp: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIConversationSchema = new Schema<IAIConversation>(
  {
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    userMessage: {
      type: String,
      required: true,
    },
    aiResponse: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    timestamp: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: true,
  }
);

export const AIConversationModel =
  mongoose.models.AIConversation || mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);
