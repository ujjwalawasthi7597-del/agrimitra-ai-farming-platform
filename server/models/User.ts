import mongoose, { Schema, Document } from 'mongoose';

export interface IUserLocation {
  state: string;
  district: string;
  village: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  location: IUserLocation;
  preferredLanguage: string;
  farmingExperienceYears: number;
  totalLandAreaAcres: number;
  primarySoilType: string;
  irrigationSource: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Farmer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    location: {
      state: { type: String, default: 'Haryana', trim: true },
      district: { type: String, default: 'Karnal', trim: true },
      village: { type: String, default: 'Taraori', trim: true },
      pincode: { type: String, default: '132116', trim: true },
      latitude: { type: Number, default: 29.8038 },
      longitude: { type: Number, default: 76.9284 },
    },
    preferredLanguage: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'pa', 'mr', 'te', 'ta'],
    },
    farmingExperienceYears: {
      type: Number,
      default: 5,
      min: [0, 'Experience cannot be negative'],
    },
    totalLandAreaAcres: {
      type: Number,
      default: 4,
      min: [0, 'Land area cannot be negative'],
    },
    primarySoilType: {
      type: String,
      default: 'Alluvial Loam',
      trim: true,
    },
    irrigationSource: {
      type: String,
      default: 'Borewell & Canal',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).passwordHash;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
