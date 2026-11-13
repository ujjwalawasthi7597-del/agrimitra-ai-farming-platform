import { Router, Response } from 'express';
import { FarmModel } from '../models/Farm.js';
import { authMiddleware, AuthenticatedRequest } from '../auth.js';
import { isMongoConnected } from '../db/connection.js';

const router = Router();

// Protect all farm routes with JWT authentication
router.use(authMiddleware);

// Middleware to ensure DB connection
function requireDb(res: Response): boolean {
  if (!isMongoConnected()) {
    res.status(503).json({
      error: 'MongoDB is not connected. Please configure MONGODB_URI in your environment variables.',
    });
    return false;
  }
  return true;
}

// GET / - List all farm plots belonging to the authenticated farmer
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const farms = await FarmModel.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ farms });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch farms from MongoDB' });
  }
});

// POST / - Create a new farm plot for the authenticated farmer
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { name, areaAcres, soilType, waterSource, irrigationType, locationDescription } = req.body;

    if (!name || !areaAcres) {
      res.status(400).json({ error: 'Plot name and area in acres are required.' });
      return;
    }

    const farm = await FarmModel.create({
      userId: req.user!.userId,
      name: name.trim(),
      areaAcres: Number(areaAcres),
      soilType: soilType || 'Alluvial Loam',
      waterSource: waterSource || 'Borewell',
      irrigationType: irrigationType || 'Drip Irrigation',
      locationDescription: locationDescription || '',
    });

    res.status(201).json({ message: 'Farm plot saved to MongoDB successfully', farm });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create farm plot in MongoDB' });
  }
});

// PUT /:id - Update farm plot belonging to the authenticated farmer
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { id } = req.params;
    const { name, areaAcres, soilType, waterSource, irrigationType, locationDescription } = req.body;

    const updated = await FarmModel.findOneAndUpdate(
      { _id: id, userId: req.user!.userId },
      {
        ...(name && { name: name.trim() }),
        ...(areaAcres !== undefined && { areaAcres: Number(areaAcres) }),
        ...(soilType && { soilType }),
        ...(waterSource && { waterSource }),
        ...(irrigationType && { irrigationType }),
        ...(locationDescription !== undefined && { locationDescription }),
      },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: 'Farm plot not found or access denied.' });
      return;
    }

    res.json({ message: 'Farm plot updated in MongoDB successfully', farm: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update farm plot in MongoDB' });
  }
});

// DELETE /:id - Delete farm plot belonging to the authenticated farmer
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { id } = req.params;
    const deleted = await FarmModel.findOneAndDelete({ _id: id, userId: req.user!.userId });

    if (!deleted) {
      res.status(404).json({ error: 'Farm plot not found or access denied.' });
      return;
    }

    res.json({ message: 'Farm plot deleted from MongoDB successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete farm plot from MongoDB' });
  }
});

export default router;
