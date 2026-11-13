import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId | string;
  cropId?: string;
  cropName: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  paymentMode: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
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
      default: 'General Farm Expense',
    },
    category: {
      type: String,
      required: true,
      enum: ['Seeds', 'Fertilizers', 'Pesticides', 'Labour', 'Machinery', 'Irrigation', 'Transport', 'Others'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      required: true,
    },
    paymentMode: {
      type: String,
      default: 'Cash',
    },
  },
  {
    timestamps: true,
  }
);

export const ExpenseModel = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
