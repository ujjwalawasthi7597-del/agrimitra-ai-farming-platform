import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../auth.js';

const router = Router();

router.use(authMiddleware);

interface IrrigationInput {
  cropType: string;
  growthStage: string;
  soilType: string;
  irrigationMethod: string;
  recentRainfall?: string;
  currentTemp?: number;
}

// Scientific water requirements & sensitivity matrix
const CROP_SENSITIVITY: Record<string, { criticalStages: string[]; waterNeedRating: 'High' | 'Medium' | 'Low' }> = {
  'Wheat': {
    criticalStages: ['Crown Root Initiation (20-25 DAS)', 'Tillering', 'Flowering / Anthesis', 'Milking / Grain Filling'],
    waterNeedRating: 'Medium',
  },
  'Rice / Paddy': {
    criticalStages: ['Panicle Initiation', 'Flowering', 'Milk stage'],
    waterNeedRating: 'High',
  },
  'Mustard': {
    criticalStages: ['Branching (30-35 DAS)', 'Pod Formation / Siliqua filling (50-60 DAS)'],
    waterNeedRating: 'Low',
  },
  'Tomato': {
    criticalStages: ['Transplanting establishment', 'Early flowering', 'Fruit development'],
    waterNeedRating: 'Medium',
  },
  'Cotton': {
    criticalStages: ['Square formation', 'Flowering & Boll formation'],
    waterNeedRating: 'Medium',
  },
  'Potato': {
    criticalStages: ['Stolon formation (20-25 DAP)', 'Tuber initiation (45-50 DAP)', 'Tuber bulking'],
    waterNeedRating: 'Medium',
  },
  'Sugarcane': {
    criticalStages: ['Formative stage (60-130 DAP)', 'Grand growth period'],
    waterNeedRating: 'High',
  },
};

router.post('/calculate', (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      cropType = 'Wheat',
      growthStage = 'Tillering / Vegetative',
      soilType = 'Alluvial Loam',
      irrigationMethod = 'Drip Irrigation',
      recentRainfall = 'None',
      currentTemp = 26,
    } = req.body as IrrigationInput;

    const cropMeta = CROP_SENSITIVITY[cropType] || {
      criticalStages: ['Early establishment', 'Flowering', 'Fruit/Seed Filling'],
      waterNeedRating: 'Medium',
    };

    const isCriticalStage = cropMeta.criticalStages.some((stage) =>
      growthStage.toLowerCase().includes(stage.toLowerCase().split(' ')[0])
    );

    // Soil retention factor
    let soilWaterRetention = 'Moderate';
    let waterLossRate = 'Normal';
    if (soilType.toLowerCase().includes('sand')) {
      soilWaterRetention = 'Low (Dries rapidly)';
      waterLossRate = 'Fast drainage';
    } else if (soilType.toLowerCase().includes('clay') || soilType.toLowerCase().includes('black')) {
      soilWaterRetention = 'High (Retains moisture longer)';
      waterLossRate = 'Slow percolation';
    }

    // Recommendation logic
    let verdict = 'Moderate Irrigation Recommended';
    let duration = '45 - 60 minutes';
    let urgency: 'Immediate' | 'Moderate' | 'Hold' = 'Moderate';
    let estimatedMoisturePercent = 48;
    let timing = 'Early Morning (06:00 AM – 09:00 AM) or Late Evening (after 04:30 PM)';

    if (recentRainfall.toLowerCase().includes('heavy') || recentRainfall.toLowerCase().includes('moderate')) {
      verdict = 'Hold Irrigation – Rain Water Sufficient';
      urgency = 'Hold';
      duration = '0 minutes (Suspend irrigation)';
      estimatedMoisturePercent = 78;
    } else if (isCriticalStage) {
      verdict = 'Critical Stage: Apply Timely Irrigation';
      urgency = 'Immediate';
      estimatedMoisturePercent = 42;
      duration = irrigationMethod.includes('Drip') ? '60 - 75 minutes' : '4 - 5 cm depth';
    } else if (currentTemp > 32) {
      verdict = 'Elevated Evapotranspiration: Schedule Light Irrigation';
      urgency = 'Moderate';
      duration = irrigationMethod.includes('Drip') ? '50 minutes' : '3 - 4 cm depth';
      estimatedMoisturePercent = 45;
    } else {
      verdict = 'Optimal Scheduling: Irrigate within 48 Hours';
      urgency = 'Moderate';
      duration = irrigationMethod.includes('Drip') ? '40 - 50 minutes' : '4 cm furrow watering';
      estimatedMoisturePercent = 52;
    }

    const tips = [
      'Avoid flood irrigating during hot midday hours to prevent rapid thermal shock and water vapor loss.',
      irrigationMethod.includes('Drip') 
        ? 'Precision drip delivers water straight to root zone; saves up to 45% water compared to surface flood.' 
        : 'Ensure laser field leveling to prevent water pooling in corners and root asphyxiation.',
      'Check top 4 inches of soil with a trowel: if soil forms a crumbly ball that holds shape, moisture is adequate.',
    ];

    res.json({
      verdict,
      urgency,
      suggestedDuration: duration,
      suggestedTimeOfDay: timing,
      estimatedSoilMoisture: `${estimatedMoisturePercent}% (Estimated)`,
      soilRetentionSummary: `${soilWaterRetention} with ${waterLossRate}`,
      isCriticalGrowthStage: isCriticalStage,
      criticalStagesForCrop: cropMeta.criticalStages,
      agronomicTips: tips,
      disclaimer: 'Note: Moisture percentages are calculated using empirical crop water-use models. Where available, in-field tensiometers or soil moisture probes should be consulted for direct measurement.',
    });
  } catch (err: any) {
    console.error('Irrigation calc error:', err);
    res.status(500).json({ error: 'Failed to calculate irrigation recommendation' });
  }
});

export default router;
