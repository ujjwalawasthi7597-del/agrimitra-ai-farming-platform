import { Router, Response } from 'express';
import { CropModel } from '../models/Crop.js';
import { CropCalendarModel } from '../models/CropCalendar.js';
import { FarmModel } from '../models/Farm.js';
import { authMiddleware, AuthenticatedRequest } from '../auth.js';
import { isMongoConnected } from '../db/connection.js';

const router = Router();

router.use(authMiddleware);

function requireDb(res: Response): boolean {
  if (!isMongoConnected()) {
    res.status(503).json({
      error: 'MongoDB is not connected. Please configure MONGODB_URI in your environment variables.',
    });
    return false;
  }
  return true;
}

// Helper to generate ICAR milestone calendar tasks in MongoDB
async function generateActivitiesForCrop(crop: any, userId: string) {
  const sowing = new Date(crop.sowingDate);
  const addDays = (days: number) => {
    const d = new Date(sowing.getTime() + days * 86400000);
    return d.toISOString().split('T')[0];
  };

  const activities = [
    {
      userId,
      cropId: crop._id.toString(),
      cropName: `${crop.cropName} (${crop.variety || 'Standard'})`,
      activityType: 'Fertilizer Application',
      title: 'Basal Fertilizer Application',
      description: 'Apply balanced NPK / DAP along with required micro-nutrients as per soil test recommendations.',
      scheduledDate: addDays(0),
      status: 'Completed' as const,
      priority: 'High' as const,
    },
    {
      userId,
      cropId: crop._id.toString(),
      cropName: `${crop.cropName} (${crop.variety || 'Standard'})`,
      activityType: 'Irrigation',
      title: 'First Critical Irrigation (Crown Root / Establishment)',
      description: 'Maintain moderate, non-flooding soil moisture for root anchorage.',
      scheduledDate: addDays(21),
      status: 'Pending' as const,
      priority: 'High' as const,
    },
    {
      userId,
      cropId: crop._id.toString(),
      cropName: `${crop.cropName} (${crop.variety || 'Standard'})`,
      activityType: 'Weed Control',
      title: 'First Hand Weeding / Interculture',
      description: 'Remove competitive weeds and aerate root zone before canopy closes.',
      scheduledDate: addDays(30),
      status: 'Pending' as const,
      priority: 'Medium' as const,
    },
    {
      userId,
      cropId: crop._id.toString(),
      cropName: `${crop.cropName} (${crop.variety || 'Standard'})`,
      activityType: 'Fertigation / Top Dressing',
      title: 'First Top Dressing of Nitrogen / Urea',
      description: 'Broadcast top dressing during evening followed by light irrigation if rain is absent.',
      scheduledDate: addDays(40),
      status: 'Upcoming' as const,
      priority: 'High' as const,
    },
    {
      userId,
      cropId: crop._id.toString(),
      cropName: `${crop.cropName} (${crop.variety || 'Standard'})`,
      activityType: 'Harvest Prep',
      title: 'Maturity Inspection & Harvest Planning',
      description: 'Check grain/fruit moisture and test sample for optimal harvest window.',
      scheduledDate: crop.expectedHarvestDate || addDays(110),
      status: 'Upcoming' as const,
      priority: 'High' as const,
    },
  ];

  await CropCalendarModel.insertMany(activities);
}

// GET / - List crops for authenticated farmer
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const crops = await CropModel.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ crops });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch crops from MongoDB' });
  }
});

// POST / - Add new crop in MongoDB
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const {
      farmId,
      cropName,
      variety,
      category,
      areaAcres,
      sowingDate,
      expectedHarvestDate,
      stage,
      targetYieldQuintals,
      notes,
    } = req.body;

    if (!cropName || !sowingDate) {
      res.status(400).json({ error: 'Crop name and sowing date are required.' });
      return;
    }

    let farmName = 'General Plot';
    if (farmId) {
      const farm = await FarmModel.findOne({ _id: farmId, userId: req.user!.userId });
      if (farm) {
        farmName = farm.name;
      }
    }

    const crop = await CropModel.create({
      userId: req.user!.userId,
      farmId: farmId || '',
      farmName,
      cropName: cropName.trim(),
      variety: variety?.trim() || 'Improved',
      category: category || 'Rabi / Food Grain',
      areaAcres: Number(areaAcres || 1),
      sowingDate,
      expectedHarvestDate: expectedHarvestDate || '',
      stage: stage || 'Seedling / Early Vegetative',
      stageProgressPercent: 15,
      targetYieldQuintals: Number(targetYieldQuintals || 20),
      healthStatus: 'Good',
      notes: notes || '',
    });

    // Schedule ICAR activities in MongoDB
    await generateActivitiesForCrop(crop, req.user!.userId);

    res.status(201).json({ message: 'Crop saved to MongoDB successfully', crop });
  } catch (err: any) {
    console.error('Error adding crop in MongoDB:', err);
    res.status(500).json({ error: 'Failed to add crop to MongoDB' });
  }
});

// PUT /:id - Update crop belonging to authenticated farmer
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { id } = req.params;
    const {
      cropName,
      variety,
      category,
      areaAcres,
      sowingDate,
      expectedHarvestDate,
      stage,
      stageProgressPercent,
      targetYieldQuintals,
      healthStatus,
      notes,
    } = req.body;

    const updated = await CropModel.findOneAndUpdate(
      { _id: id, userId: req.user!.userId },
      {
        ...(cropName && { cropName: cropName.trim() }),
        ...(variety !== undefined && { variety: variety.trim() }),
        ...(category && { category }),
        ...(areaAcres !== undefined && { areaAcres: Number(areaAcres) }),
        ...(sowingDate && { sowingDate }),
        ...(expectedHarvestDate !== undefined && { expectedHarvestDate }),
        ...(stage && { stage }),
        ...(stageProgressPercent !== undefined && { stageProgressPercent: Number(stageProgressPercent) }),
        ...(targetYieldQuintals !== undefined && { targetYieldQuintals: Number(targetYieldQuintals) }),
        ...(healthStatus && { healthStatus }),
        ...(notes !== undefined && { notes }),
      },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: 'Crop not found or access denied.' });
      return;
    }

    res.json({ message: 'Crop updated in MongoDB successfully', crop: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update crop in MongoDB' });
  }
});

// DELETE /:id - Delete crop and calendar milestones
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { id } = req.params;
    const deleted = await CropModel.findOneAndDelete({ _id: id, userId: req.user!.userId });

    if (!deleted) {
      res.status(404).json({ error: 'Crop not found or access denied.' });
      return;
    }

    await CropCalendarModel.deleteMany({ cropId: id, userId: req.user!.userId });

    res.json({ message: 'Crop and related calendar activities removed from MongoDB' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete crop from MongoDB' });
  }
});

// GET /calendar/all - Get calendar milestones for authenticated farmer
router.get('/calendar/all', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const activities = await CropCalendarModel.find({ userId: req.user!.userId }).sort({ scheduledDate: 1 });
    res.json({ activities });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch calendar activities from MongoDB' });
  }
});

// POST /calendar/activity - Add custom calendar task for authenticated farmer
router.post('/calendar/activity', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { cropId, title, activityType, description, scheduledDate, priority } = req.body;
    if (!title || !scheduledDate) {
      res.status(400).json({ error: 'Title and scheduled date are required.' });
      return;
    }

    let cropName = 'Farm-wide';
    if (cropId) {
      const crop = await CropModel.findOne({ _id: cropId, userId: req.user!.userId });
      if (crop) cropName = crop.cropName;
    }

    const activity = await CropCalendarModel.create({
      userId: req.user!.userId,
      cropId: cropId || '',
      cropName,
      activityType: activityType || 'General Care',
      title: title.trim(),
      description: description || '',
      scheduledDate,
      status: 'Pending',
      priority: priority || 'Medium',
    });

    res.status(201).json({ message: 'Task scheduled in MongoDB', activity });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create calendar activity in MongoDB' });
  }
});

// PATCH /calendar/activity/:id - Update task status
router.patch('/calendar/activity/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { id } = req.params;
    const { status, title, scheduledDate, priority, description } = req.body;

    const updated = await CropCalendarModel.findOneAndUpdate(
      { _id: id, userId: req.user!.userId },
      {
        ...(status && { status }),
        ...(title && { title }),
        ...(scheduledDate && { scheduledDate }),
        ...(priority && { priority }),
        ...(description !== undefined && { description }),
      },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: 'Task not found or access denied.' });
      return;
    }

    res.json({ message: 'Task updated in MongoDB', activity: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update task in MongoDB' });
  }
});

// DELETE /calendar/activity/:id
router.delete('/calendar/activity/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { id } = req.params;
    const deleted = await CropCalendarModel.findOneAndDelete({ _id: id, userId: req.user!.userId });

    if (!deleted) {
      res.status(404).json({ error: 'Task not found or access denied.' });
      return;
    }

    res.json({ message: 'Task deleted from MongoDB' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete task from MongoDB' });
  }
});

export default router;
