import { Router, Response } from 'express';
import { ConsultationModel } from '../models/Consultation.js';
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

// GET / - List consultation requests for authenticated farmer
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const consultations = await ConsultationModel.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ consultations });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch consultations from MongoDB' });
  }
});

// POST / - Create new consultation request in MongoDB
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { cropName, plotName, subject, description, imageUrl, urgency = 'Normal' } = req.body;
    if (!subject || !description) {
      res.status(400).json({ error: 'Subject and description are required.' });
      return;
    }

    const consultation = await ConsultationModel.create({
      userId: req.user!.userId,
      cropName: cropName || 'General Crop Query',
      plotName: plotName || 'Main Farm Field',
      subject: subject.trim(),
      description: description.trim(),
      imageUrl: imageUrl || '',
      urgency,
      status: 'In Progress',
      assignedExpert: 'Dr. Anand Verma (Senior Agronomist, ICAR-IARI)',
      expertReply:
        'Your query has been assigned to our regional agronomist. We are assessing the symptoms and historical soil data. A detailed prescriptive advisory will be logged shortly.',
    });

    res.status(201).json({ message: 'Consultation request saved to MongoDB', consultation });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit consultation request in MongoDB' });
  }
});

// PATCH /:id - Update consultation belonging to authenticated farmer
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { id } = req.params;
    const { status, followupNote } = req.body;

    const updated = await ConsultationModel.findOneAndUpdate(
      { _id: id, userId: req.user!.userId },
      {
        ...(status && { status }),
        ...(followupNote && { farmerFollowup: followupNote }),
      },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: 'Consultation ticket not found or access denied.' });
      return;
    }

    res.json({ message: 'Consultation updated in MongoDB', consultation: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update consultation in MongoDB' });
  }
});

export default router;
