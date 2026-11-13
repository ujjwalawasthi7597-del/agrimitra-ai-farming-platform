import { Router, Response } from 'express';
import { ExpenseModel } from '../models/Expense.js';
import { HarvestModel } from '../models/Harvest.js';
import { CropModel } from '../models/Crop.js';
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

// GET /expenses - List expenses for authenticated farmer
router.get('/expenses', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const expenses = await ExpenseModel.find({ userId: req.user!.userId }).sort({ date: -1 });
    res.json({ expenses });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch expenses from MongoDB' });
  }
});

// POST /expenses - Create expense in MongoDB
router.post('/expenses', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { cropId, category, amount, description, date, paymentMode } = req.body;
    if (!category || !amount || !date) {
      res.status(400).json({ error: 'Category, amount, and date are required.' });
      return;
    }

    let cropName = 'General Farm Expense';
    if (cropId) {
      const crop = await CropModel.findOne({ _id: cropId, userId: req.user!.userId });
      if (crop) cropName = crop.cropName;
    }

    const expense = await ExpenseModel.create({
      userId: req.user!.userId,
      cropId: cropId || '',
      cropName,
      category,
      amount: Number(amount),
      description: description || '',
      date,
      paymentMode: paymentMode || 'Cash',
    });

    res.status(201).json({ message: 'Expense recorded in MongoDB', expense });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record expense in MongoDB' });
  }
});

// DELETE /expenses/:id - Delete expense belonging to authenticated farmer
router.delete('/expenses/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { id } = req.params;
    const deleted = await ExpenseModel.findOneAndDelete({ _id: id, userId: req.user!.userId });

    if (!deleted) {
      res.status(404).json({ error: 'Expense record not found or access denied.' });
      return;
    }

    res.json({ message: 'Expense deleted from MongoDB' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete expense from MongoDB' });
  }
});

// GET /harvests - List harvest records for authenticated farmer
router.get('/harvests', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const harvests = await HarvestModel.find({ userId: req.user!.userId }).sort({ harvestDate: -1 });
    res.json({ harvests });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch harvest records from MongoDB' });
  }
});

// POST /harvests - Create harvest record in MongoDB
router.post('/harvests', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { cropName, plotName, harvestDate, quantityQuintals, sellingPricePerQuintal, buyerName, mandiSlipNo, notes } = req.body;
    if (!cropName || !quantityQuintals || !sellingPricePerQuintal || !harvestDate) {
      res.status(400).json({ error: 'Crop, quantity, price per quintal, and date are required.' });
      return;
    }

    const qty = Number(quantityQuintals);
    const rate = Number(sellingPricePerQuintal);
    const totalRevenue = Math.round(qty * rate);

    const harvest = await HarvestModel.create({
      userId: req.user!.userId,
      cropName: cropName.trim(),
      plotName: plotName || 'Main Field',
      harvestDate,
      quantityQuintals: qty,
      sellingPricePerQuintal: rate,
      totalRevenue,
      buyerName: buyerName || 'APMC Mandi',
      mandiSlipNo: mandiSlipNo || '',
      notes: notes || '',
    });

    res.status(201).json({ message: 'Harvest record added to MongoDB', harvest });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add harvest record to MongoDB' });
  }
});

// DELETE /harvests/:id - Delete harvest record belonging to authenticated farmer
router.delete('/harvests/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { id } = req.params;
    const deleted = await HarvestModel.findOneAndDelete({ _id: id, userId: req.user!.userId });

    if (!deleted) {
      res.status(404).json({ error: 'Harvest record not found or access denied.' });
      return;
    }

    res.json({ message: 'Harvest record deleted from MongoDB' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete harvest record from MongoDB' });
  }
});

// GET /analytics/summary - Calculate profit, loss and category breakdowns in MongoDB
router.get('/analytics/summary', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const expenses = await ExpenseModel.find({ userId: req.user!.userId });
    const harvests = await HarvestModel.find({ userId: req.user!.userId });

    const totalExpense = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalRevenue = harvests.reduce((acc, curr) => acc + (Number(curr.totalRevenue) || 0), 0);
    const netProfit = totalRevenue - totalExpense;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    // Expenses by category
    const categoryTotals: Record<string, number> = {};
    for (const exp of expenses) {
      const cat = exp.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount || 0);
    }
    const categoryBreakdown = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));

    // Crop financials comparison
    const cropFinanceMap: Record<string, { crop: string; revenue: number; expense: number }> = {};
    for (const exp of expenses) {
      const crop = exp.cropName || 'Farm Common';
      if (!cropFinanceMap[crop]) cropFinanceMap[crop] = { crop, revenue: 0, expense: 0 };
      cropFinanceMap[crop].expense += Number(exp.amount || 0);
    }
    for (const harv of harvests) {
      const crop = harv.cropName || 'Other';
      if (!cropFinanceMap[crop]) cropFinanceMap[crop] = { crop, revenue: 0, expense: 0 };
      cropFinanceMap[crop].revenue += Number(harv.totalRevenue || 0);
    }
    const cropFinancials = Object.values(cropFinanceMap);

    res.json({
      totalExpense,
      totalRevenue,
      netProfit,
      profitMargin,
      totalHarvestQuintals: harvests.reduce((acc, curr) => acc + (Number(curr.quantityQuintals) || 0), 0),
      categoryBreakdown,
      cropFinancials,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute financial analytics from MongoDB' });
  }
});

export default router;
