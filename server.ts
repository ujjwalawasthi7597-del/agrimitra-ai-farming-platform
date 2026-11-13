import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectMongoDB, getMongoStatus } from './server/db/connection.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High limit for base64 crop leaf image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Route handlers
import authRoutes from './server/routes/authRoutes.js';
import farmRoutes from './server/routes/farmRoutes.js';
import cropRoutes from './server/routes/cropRoutes.js';
import diseaseRoutes from './server/routes/diseaseRoutes.js';
import aiRoutes from './server/routes/aiRoutes.js';
import weatherRoutes from './server/routes/weatherRoutes.js';
import irrigationRoutes from './server/routes/irrigationRoutes.js';
import financeRoutes from './server/routes/financeRoutes.js';
import schemeRoutes from './server/routes/schemeRoutes.js';
import consultationRoutes from './server/routes/consultationRoutes.js';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/disease-detection', diseaseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/consultations', consultationRoutes);

// Real MongoDB database status endpoint
app.get('/api/db-status', (_req, res) => {
  const status = getMongoStatus();
  res.json({
    database: 'MongoDB',
    ...status,
    timestamp: new Date().toISOString(),
  });
});

// System health check
app.get('/api/health', (_req, res) => {
  const dbStatus = getMongoStatus();
  res.json({
    status: 'online',
    platform: 'AgriMitra 🌱 Smart Farming Assistant',
    version: '1.0.0',
    mongoConnected: dbStatus.connected,
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  // Connect to real MongoDB using MONGODB_URI
  await connectMongoDB();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌱 AgriMitra server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
