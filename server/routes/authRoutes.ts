import { Router, Response } from 'express';
import { UserModel } from '../models/User.js';
import {
  generateToken,
  hashPassword,
  comparePassword,
  authMiddleware,
  AuthenticatedRequest,
} from '../auth.js';
import { isMongoConnected } from '../db/connection.js';

const router = Router();

// Middleware to ensure real MongoDB is connected before DB operations
function requireDb(res: Response): boolean {
  if (!isMongoConnected()) {
    res.status(503).json({
      error: 'MongoDB is not connected. Please provide a valid MONGODB_URI in your environment variables to perform authentication.',
      requiresConfig: true,
    });
    return false;
  }
  return true;
}

// POST /register - Register new farmer in MongoDB
router.post('/register', async (req, res) => {
  if (!requireDb(res)) return;

  try {
    const { name, email, phone, password, location, preferredLanguage, farmingDetails } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required fields.' });
      return;
    }

    if (typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists in MongoDB
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ error: 'A farmer account with this email address already exists.' });
      return;
    }

    // Hash password with bcryptjs
    const passwordHash = hashPassword(password);

    // Persist user document in MongoDB
    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      passwordHash,
      location: {
        state: location?.state?.trim() || 'Haryana',
        district: location?.district?.trim() || 'Karnal',
        village: location?.village?.trim() || 'Taraori',
        pincode: location?.pincode?.trim() || '132116',
        latitude: location?.latitude || 29.8038,
        longitude: location?.longitude || 76.9284,
      },
      preferredLanguage: preferredLanguage || 'en',
      farmingExperienceYears: Number(farmingDetails?.experience || 5),
      totalLandAreaAcres: Number(farmingDetails?.totalArea || 4),
      primarySoilType: farmingDetails?.soilType?.trim() || 'Alluvial Loam',
      irrigationSource: farmingDetails?.irrigationSource?.trim() || 'Borewell & Canal',
    });

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const userObj = user.toJSON();

    res.status(201).json({
      message: 'Farmer account registered and saved to MongoDB successfully.',
      token,
      user: userObj,
    });
  } catch (err: any) {
    console.error('Registration error in MongoDB:', err);
    res.status(500).json({ error: err.message || 'Failed to register farmer in MongoDB' });
  }
});

// POST /login - Authenticate registered farmer from MongoDB
router.post('/login', async (req, res) => {
  if (!requireDb(res)) return;

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user in MongoDB
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Verify hashed password
    const isPasswordValid = comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const userObj = user.toJSON();

    res.json({
      message: 'Farmer authenticated successfully via MongoDB.',
      token,
      user: userObj,
    });
  } catch (err: any) {
    console.error('Login error in MongoDB:', err);
    res.status(500).json({ error: err.message || 'Failed to authenticate user' });
  }
});

// GET /me - Get current authenticated farmer profile from MongoDB
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.user!.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'Farmer account not found in database.' });
      return;
    }
    res.json({ user: user.toJSON() });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch farmer profile from MongoDB' });
  }
});

// PUT /profile - Update authenticated farmer profile in MongoDB
router.put('/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const {
      name,
      phone,
      location,
      preferredLanguage,
      totalLandAreaAcres,
      primarySoilType,
      irrigationSource,
      farmingExperienceYears,
    } = req.body;

    const updated = await UserModel.findByIdAndUpdate(
      req.user!.userId,
      {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(location && { location }),
        ...(preferredLanguage && { preferredLanguage }),
        ...(totalLandAreaAcres !== undefined && { totalLandAreaAcres: Number(totalLandAreaAcres) }),
        ...(primarySoilType && { primarySoilType: primarySoilType.trim() }),
        ...(irrigationSource && { irrigationSource: irrigationSource.trim() }),
        ...(farmingExperienceYears !== undefined && { farmingExperienceYears: Number(farmingExperienceYears) }),
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updated) {
      res.status(404).json({ error: 'Farmer account not found.' });
      return;
    }

    res.json({
      message: 'Profile updated in MongoDB successfully.',
      user: updated.toJSON(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update farmer profile in MongoDB' });
  }
});

export default router;
