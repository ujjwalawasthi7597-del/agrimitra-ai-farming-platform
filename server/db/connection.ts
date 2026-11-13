import mongoose from 'mongoose';

let isConnected = false;
let connectionError: string | null = null;

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.warn('⚠️ [MongoDB] MONGODB_URI environment variable is not defined.');
    console.warn('⚠️ [MongoDB] Real MongoDB operations require a valid MONGODB_URI in your .env file.');
    isConnected = false;
    connectionError = 'MONGODB_URI is not configured in environment variables.';
    return false;
  }

  try {
    mongoose.set('strictQuery', true);

    mongoose.connection.on('connected', () => {
      isConnected = true;
      connectionError = null;
      console.log('✅ [MongoDB] Real MongoDB connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      connectionError = err.message;
      console.error('❌ [MongoDB] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️ [MongoDB] Disconnected from MongoDB.');
    });

    await mongoose.connect(uri.trim(), {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = mongoose.connection.readyState === 1;
    if (isConnected) {
      console.log('✅ [MongoDB] Connected successfully to host:', mongoose.connection.host);
      return true;
    }
    return false;
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message || 'Failed to connect to MongoDB';
    console.error('❌ [MongoDB] Failed to connect using provided MONGODB_URI:', connectionError);
    return false;
  }
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getMongoStatus(): {
  connected: boolean;
  readyState: number;
  host: string | null;
  error: string | null;
} {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.readyState === 1 ? mongoose.connection.host : null,
    error: connectionError,
  };
}
