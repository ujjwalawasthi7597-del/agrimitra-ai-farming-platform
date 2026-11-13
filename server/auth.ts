import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from './models/User.js';
import { isMongoConnected } from './db/connection.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'agrimitra-jwt-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    userId: string;
    email: string;
    name: string;
    location?: any;
    preferredLanguage?: string;
  };
}

export function generateToken(payload: { userId: string; email: string; name: string }): string {
  const secret = process.env.JWT_SECRET || JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Authentication token is missing or malformed',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      email: string;
      name: string;
    };

    if (!decoded || !decoded.userId) {
      res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
      return;
    }

    if (!isMongoConnected()) {
      res.status(503).json({
        error: 'Database unavailable: MongoDB is not connected. Please verify MONGODB_URI in your environment variables.',
      });
      return;
    }

    const user = await UserModel.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      res.status(401).json({
        error: 'Unauthorized: Farmer account associated with this token does not exist in MongoDB',
      });
      return;
    }

    req.user = {
      _id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      location: user.location,
      preferredLanguage: user.preferredLanguage,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Unauthorized: Authentication token has expired. Please log in again.' });
      return;
    }
    res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
}
