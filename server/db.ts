import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'agrimitra_db.json');

// Interface for database structure
export interface DBStructure {
  users: any[];
  farms: any[];
  crops: any[];
  cropCalendars: any[];
  diseaseReports: any[];
  expenses: any[];
  harvestRecords: any[];
  aiConversations: any[];
  notifications: any[];
  consultationRequests: any[];
}

export function generateId(): string {
  return crypto.randomBytes(12).toString('hex');
}

// In-memory cache synced with disk
let dbMemory: DBStructure = {
  users: [],
  farms: [],
  crops: [],
  cropCalendars: [],
  diseaseReports: [],
  expenses: [],
  harvestRecords: [],
  aiConversations: [],
  notifications: [],
  consultationRequests: []
};

function ensureDirSync(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function loadDatabase(): DBStructure {
  try {
    ensureDirSync(DATA_DIR);
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbMemory = JSON.parse(content);
      // Ensure all collections exist
      const keys: (keyof DBStructure)[] = [
        'users', 'farms', 'crops', 'cropCalendars', 'diseaseReports',
        'expenses', 'harvestRecords', 'aiConversations', 'notifications', 'consultationRequests'
      ];
      for (const k of keys) {
        if (!Array.isArray(dbMemory[k])) {
          dbMemory[k] = [];
        }
      }
    } else {
      seedInitialData();
      saveDatabase();
    }
  } catch (err) {
    console.error('Error loading DB file, reinitializing memory state:', err);
    seedInitialData();
  }
  return dbMemory;
}

export function saveDatabase(): void {
  try {
    ensureDirSync(DATA_DIR);
    fs.writeFileSync(DB_FILE, JSON.stringify(dbMemory, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB to disk:', err);
  }
}

export class Collection<T extends { _id?: string; userId?: string; createdAt?: string; updatedAt?: string }> {
  private collectionName: keyof DBStructure;

  constructor(collectionName: keyof DBStructure) {
    this.collectionName = collectionName;
  }

  find(filter?: Partial<T> | ((item: T) => boolean)): T[] {
    const items = (dbMemory[this.collectionName] as T[]) || [];
    if (!filter) return [...items];
    if (typeof filter === 'function') {
      return items.filter(filter);
    }
    return items.filter((item) => {
      return Object.entries(filter).every(([key, value]) => (item as any)[key] === value);
    });
  }

  findOne(filter: Partial<T> | ((item: T) => boolean)): T | null {
    const results = this.find(filter);
    return results.length > 0 ? results[0] : null;
  }

  findById(id: string): T | null {
    return this.findOne({ _id: id } as any);
  }

  insertOne(doc: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string }): T {
    const now = new Date().toISOString();
    const newDoc = {
      ...doc,
      _id: doc._id || generateId(),
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    dbMemory[this.collectionName].push(newDoc);
    saveDatabase();
    return newDoc;
  }

  updateOne(filter: Partial<T> | ((item: T) => boolean), update: Partial<T>): T | null {
    const items = dbMemory[this.collectionName] as T[];
    let index = -1;

    if (typeof filter === 'function') {
      index = items.findIndex(filter);
    } else {
      index = items.findIndex((item) => {
        return Object.entries(filter).every(([key, value]) => (item as any)[key] === value);
      });
    }

    if (index === -1) return null;

    const updatedDoc = {
      ...items[index],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updatedDoc;
    saveDatabase();
    return updatedDoc;
  }

  deleteOne(filter: Partial<T> | ((item: T) => boolean)): boolean {
    const items = dbMemory[this.collectionName] as T[];
    let index = -1;

    if (typeof filter === 'function') {
      index = items.findIndex(filter);
    } else {
      index = items.findIndex((item) => {
        return Object.entries(filter).every(([key, value]) => (item as any)[key] === value);
      });
    }

    if (index === -1) return false;
    items.splice(index, 1);
    saveDatabase();
    return true;
  }

  deleteMany(filter: Partial<T> | ((item: T) => boolean)): number {
    const beforeLen = (dbMemory[this.collectionName] as T[]).length;
    if (typeof filter === 'function') {
      dbMemory[this.collectionName] = (dbMemory[this.collectionName] as T[]).filter((item) => !filter(item));
    } else {
      dbMemory[this.collectionName] = (dbMemory[this.collectionName] as T[]).filter((item) => {
        return !Object.entries(filter).every(([key, value]) => (item as any)[key] === value);
      });
    }
    const removedCount = beforeLen - dbMemory[this.collectionName].length;
    if (removedCount > 0) {
      saveDatabase();
    }
    return removedCount;
  }
}

// Collection instances
export const Users = new Collection<any>('users');
export const Farms = new Collection<any>('farms');
export const Crops = new Collection<any>('crops');
export const CropCalendars = new Collection<any>('cropCalendars');
export const DiseaseReports = new Collection<any>('diseaseReports');
export const Expenses = new Collection<any>('expenses');
export const HarvestRecords = new Collection<any>('harvestRecords');
export const AIConversations = new Collection<any>('aiConversations');
export const Notifications = new Collection<any>('notifications');
export const ConsultationRequests = new Collection<any>('consultationRequests');

// Initial seed data generator
function seedInitialData() {
  const demoUserId = 'demo-farmer-ramesh';
  const now = new Date();

  dbMemory.users = [
    {
      _id: demoUserId,
      name: 'Ramesh Kumar Patel',
      email: 'ramesh.farmer@agrimitra.in',
      phone: '+91 98765 43210',
      passwordHash: '$2a$10$vN9502bS.jVwK9l1YQW67u4gBfgc6n2h5R2tGv8e5Z1sB7a3w4L9K', // bcrypt for 'farmer123'
      location: {
        state: 'Haryana',
        district: 'Karnal',
        village: 'Taraori',
        pincode: '132116',
        latitude: 29.8038,
        longitude: 76.9284
      },
      preferredLanguage: 'en',
      farmingExperienceYears: 18,
      totalLandAreaAcres: 8.5,
      primarySoilType: 'Alluvial Loam',
      irrigationSource: 'Tube Well & Drip',
      createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    }
  ];

  const farmPlot1Id = 'plot-karnal-north';
  const farmPlot2Id = 'plot-karnal-south';
  const farmPlot3Id = 'plot-polyhouse-east';

  dbMemory.farms = [
    {
      _id: farmPlot1Id,
      userId: demoUserId,
      name: 'North Field (Basmati Block)',
      areaAcres: 4.5,
      soilType: 'Alluvial Clay Loam',
      waterSource: 'Solar Tube Well',
      irrigationType: 'Flood / Furrow',
      locationDescription: 'Adjacent to Western Yamuna Canal branch',
      createdAt: new Date(now.getTime() - 85 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      _id: farmPlot2Id,
      userId: demoUserId,
      name: 'South Meadow (Mustard & Wheat)',
      areaAcres: 3.0,
      soilType: 'Sandy Loam',
      waterSource: 'Borewell',
      irrigationType: 'Sprinkler',
      locationDescription: 'Roadside plot near village storage unit',
      createdAt: new Date(now.getTime() - 85 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      _id: farmPlot3Id,
      userId: demoUserId,
      name: 'East Polyhouse Plot (Tomato & Capsicum)',
      areaAcres: 1.0,
      soilType: 'Enriched Compost Loam',
      waterSource: 'Drip System Tank',
      irrigationType: 'Precision Drip',
      locationDescription: 'High-density vegetable polyhouse zone',
      createdAt: new Date(now.getTime() - 80 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    }
  ];

  const crop1Id = 'crop-wheat-hd2967';
  const crop2Id = 'crop-mustard-pusa';
  const crop3Id = 'crop-tomato-hybrid';

  const sowingDate1 = new Date(now.getTime() - 40 * 86400000).toISOString().split('T')[0];
  const harvestDate1 = new Date(now.getTime() + 80 * 86400000).toISOString().split('T')[0];

  const sowingDate2 = new Date(now.getTime() - 55 * 86400000).toISOString().split('T')[0];
  const harvestDate2 = new Date(now.getTime() + 45 * 86400000).toISOString().split('T')[0];

  const sowingDate3 = new Date(now.getTime() - 25 * 86400000).toISOString().split('T')[0];
  const harvestDate3 = new Date(now.getTime() + 50 * 86400000).toISOString().split('T')[0];

  dbMemory.crops = [
    {
      _id: crop1Id,
      userId: demoUserId,
      farmId: farmPlot1Id,
      farmName: 'North Field (Basmati Block)',
      cropName: 'Wheat (गेहूं)',
      variety: 'HD-2967 (Pusa Yashasvi)',
      category: 'Cereal / Rabi',
      areaAcres: 4.5,
      sowingDate: sowingDate1,
      expectedHarvestDate: harvestDate1,
      stage: 'Tillering & Jointing',
      stageProgressPercent: 45,
      targetYieldQuintals: 90,
      healthStatus: 'Good',
      notes: 'Applied first top dressing of urea 10 days ago. Irrigation planned post crown root development.',
      createdAt: new Date(now.getTime() - 40 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      _id: crop2Id,
      userId: demoUserId,
      farmId: farmPlot2Id,
      farmName: 'South Meadow (Mustard & Wheat)',
      cropName: 'Mustard (सरसों)',
      variety: 'Pusa Bold / RH 749',
      category: 'Oilseed / Rabi',
      areaAcres: 3.0,
      sowingDate: sowingDate2,
      expectedHarvestDate: harvestDate2,
      stage: 'Flowering & Pod Formation',
      stageProgressPercent: 65,
      targetYieldQuintals: 32,
      healthStatus: 'Attention Needed',
      notes: 'Minor aphid sightings reported on lower branches. Neem oil spray advised.',
      createdAt: new Date(now.getTime() - 55 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      _id: crop3Id,
      userId: demoUserId,
      farmId: farmPlot3Id,
      farmName: 'East Polyhouse Plot (Tomato & Capsicum)',
      cropName: 'Tomato (टमाटर)',
      variety: 'Himsona Hybrid',
      category: 'Vegetable / Horticultural',
      areaAcres: 1.0,
      sowingDate: sowingDate3,
      expectedHarvestDate: harvestDate3,
      stage: 'Early Vegetative to Pre-Flowering',
      stageProgressPercent: 35,
      targetYieldQuintals: 160,
      healthStatus: 'Excellent',
      notes: 'Drip fertigation with 19:19:19 NPK twice a week. Healthy canopy growth.',
      createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    }
  ];

  dbMemory.cropCalendars = [
    {
      _id: 'cal-act-1',
      userId: demoUserId,
      cropId: crop1Id,
      cropName: 'Wheat (HD-2967)',
      activityType: 'Irrigation',
      title: 'Second Critical Stage Irrigation (Late Tillering)',
      description: 'Ensure uniform moisture for spikelet initiation; avoid standing water.',
      scheduledDate: new Date(now.getTime() + 2 * 86400000).toISOString().split('T')[0],
      status: 'Pending',
      priority: 'High',
    },
    {
      _id: 'cal-act-2',
      userId: demoUserId,
      cropId: crop2Id,
      cropName: 'Mustard (Pusa Bold)',
      activityType: 'Pest Management',
      title: 'Neem Oil Spray for Aphid Control',
      description: 'Dilute 5ml cold-pressed neem oil (10,000 ppm) per liter of water with mild soap.',
      scheduledDate: new Date(now.getTime() + 1 * 86400000).toISOString().split('T')[0],
      status: 'Pending',
      priority: 'High',
    },
    {
      _id: 'cal-act-3',
      userId: demoUserId,
      cropId: crop3Id,
      cropName: 'Tomato (Himsona)',
      activityType: 'Fertigation',
      title: 'Calcium Nitrate & Boron Drenching',
      description: 'Prevents blossom end rot and strengthens flower stalks.',
      scheduledDate: new Date(now.getTime() + 4 * 86400000).toISOString().split('T')[0],
      status: 'Upcoming',
      priority: 'Medium',
    },
    {
      _id: 'cal-act-4',
      userId: demoUserId,
      cropId: crop1Id,
      cropName: 'Wheat (HD-2967)',
      activityType: 'Fertilizer Application',
      title: 'Basal DAP & Zinc Sulphate Application',
      description: 'Broadcasted 50 kg DAP and 10 kg Zinc Sulphate at sowing time.',
      scheduledDate: sowingDate1,
      status: 'Completed',
      priority: 'High',
    }
  ];

  dbMemory.diseaseReports = [
    {
      _id: 'rep-sample-1',
      userId: demoUserId,
      cropName: 'Tomato',
      diseaseName: 'Early Blight (Alternaria solani)',
      vernacularName: 'टमाटर का अगेती झुलसा रोग',
      confidence: 91,
      healthStatus: 'Diseased',
      severity: 'Moderate',
      symptoms: [
        'Concentric dark rings with target-board appearance on older leaves',
        'Yellow chlorotic halos surrounding lesions',
        'Lower leaf defoliation starting from ground level'
      ],
      probableCauses: [
        'Prolonged leaf wetness exceeding 8 hours',
        'Warm temperatures between 24°C - 29°C with high relative humidity',
        'Overcrowded foliage reducing air circulation'
      ],
      preventiveMeasures: [
        'Prune lower 12 inches of infected leaves and burn/bury safely away from field',
        'Ensure drip irrigation to prevent water splashing on leaves',
        'Mulch soil bed with straw to reduce soil-to-leaf spore bounce'
      ],
      recommendedTreatments: [
        'Organic: Spray Trichoderma harzianum @ 10g/L or copper oxychloride 50% WP @ 2.5g/L',
        'Chemical (ICAR guideline): Mancozeb 75% WP @ 2g/L or Chlorothalonil 75% WP @ 2g/L with 7-10 days interval',
        'Disclaimer: Always follow certified state agricultural university dosage guidelines.'
      ],
      disclaimer: 'AI disease detection provides preliminary assistive assessment. For severe pest outbreaks, consult your local Krishi Vigyan Kendra (KVK) or block agricultural officer.',
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69106037?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    }
  ];

  dbMemory.expenses = [
    {
      _id: 'exp-1',
      userId: demoUserId,
      cropId: crop1Id,
      cropName: 'Wheat (HD-2967)',
      category: 'Seeds',
      amount: 4500,
      description: 'Certified HD-2967 wheat seed sacks (180 kg)',
      date: sowingDate1,
      paymentMode: 'UPI / Cash',
    },
    {
      _id: 'exp-2',
      userId: demoUserId,
      cropId: crop1Id,
      cropName: 'Wheat (HD-2967)',
      category: 'Fertilizers',
      amount: 6800,
      description: 'DAP (4 bags) + Urea (3 bags) + Zinc Sulphate',
      date: new Date(now.getTime() - 35 * 86400000).toISOString().split('T')[0],
      paymentMode: 'KCC Debit',
    },
    {
      _id: 'exp-3',
      userId: demoUserId,
      cropId: crop1Id,
      cropName: 'Wheat (HD-2967)',
      category: 'Machinery',
      amount: 5500,
      description: 'Tractor rotavator tillage & seed-cum-fertilizer drill hire',
      date: sowingDate1,
      paymentMode: 'Cash',
    },
    {
      _id: 'exp-4',
      userId: demoUserId,
      cropId: crop2Id,
      cropName: 'Mustard (Pusa Bold)',
      category: 'Seeds',
      amount: 1800,
      description: 'Certified Pusa Bold hybrid seeds (12 kg)',
      date: sowingDate2,
      paymentMode: 'Cash',
    },
    {
      _id: 'exp-5',
      userId: demoUserId,
      cropId: crop2Id,
      cropName: 'Mustard (Pusa Bold)',
      category: 'Labour',
      amount: 3200,
      description: 'Hand weeding & line thinning labour (4 person-days)',
      date: new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0],
      paymentMode: 'Cash',
    },
    {
      _id: 'exp-6',
      userId: demoUserId,
      cropId: crop3Id,
      cropName: 'Tomato (Himsona)',
      category: 'Pesticides',
      amount: 2200,
      description: 'Neem-based biopesticide & organic stickering agent',
      date: new Date(now.getTime() - 15 * 86400000).toISOString().split('T')[0],
      paymentMode: 'UPI',
    },
    {
      _id: 'exp-7',
      userId: demoUserId,
      cropId: crop3Id,
      cropName: 'Tomato (Himsona)',
      category: 'Irrigation',
      amount: 1500,
      description: 'Drip line replacement fittings & solar pump servicing',
      date: new Date(now.getTime() - 10 * 86400000).toISOString().split('T')[0],
      paymentMode: 'Cash',
    }
  ];

  dbMemory.harvestRecords = [
    {
      _id: 'harv-1',
      userId: demoUserId,
      cropName: 'Basmati Paddy (Pusa 1121)',
      plotName: 'North Field (Basmati Block)',
      harvestDate: new Date(now.getTime() - 110 * 86400000).toISOString().split('T')[0],
      quantityQuintals: 82,
      sellingPricePerQuintal: 3850,
      totalRevenue: 315700,
      buyerName: 'Taraori Grain Market APMC Mandi',
      mandiSlipNo: 'TR-APMC-9421',
      notes: 'Grain moisture at 13.5% fetched grade-A premium rate.',
    },
    {
      _id: 'harv-2',
      userId: demoUserId,
      cropName: 'Summer Moong Pulse',
      plotName: 'South Meadow',
      harvestDate: new Date(now.getTime() - 160 * 86400000).toISOString().split('T')[0],
      quantityQuintals: 18,
      sellingPricePerQuintal: 7400,
      totalRevenue: 133200,
      buyerName: 'Haryana Hafed Procurement Center',
      mandiSlipNo: 'HFD-2026-88',
      notes: 'Sold at MSP procurement rate.',
    }
  ];

  dbMemory.notifications = [
    {
      _id: 'notif-1',
      userId: demoUserId,
      type: 'weather_alert',
      title: 'Scattered Rainfall Alert',
      message: 'Meteorological department predicts 12-18mm rainfall over Karnal within 36 hours. Postpone foliar pesticide sprays.',
      isRead: false,
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
    },
    {
      _id: 'notif-2',
      userId: demoUserId,
      type: 'irrigation_reminder',
      title: 'Wheat Irrigation Due',
      message: 'Crown root initiation stage reached for HD-2967 in North Field. Soil moisture dropping below 50%.',
      isRead: false,
      timestamp: new Date(now.getTime() - 14 * 3600000).toISOString(),
    },
    {
      _id: 'notif-3',
      userId: demoUserId,
      type: 'scheme_update',
      title: 'PM-KISAN 19th Installment',
      message: 'Direct benefit transfer of ₹2,000 has been credited to Aadhaar-linked bank account.',
      isRead: true,
      timestamp: new Date(now.getTime() - 72 * 3600000).toISOString(),
    }
  ];

  dbMemory.consultationRequests = [
    {
      _id: 'consult-1',
      userId: demoUserId,
      cropName: 'Mustard',
      plotName: 'South Meadow',
      subject: 'Aphid cluster management on siliqua',
      description: 'Noticing yellowing and sticky honeydew secretion on top leaves of mustard. Please suggest immediate organic intervention.',
      imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
      status: 'In Progress',
      assignedExpert: 'Dr. S. K. Sharma (Scientist, KVK Karnal)',
      expertReply: 'Initial observation confirms mustard aphid (Lipaphis erysimi). Spray 5% Neem Seed Kernel Extract (NSKE) or Beauveria bassiana @ 5g/L during evening hours. If pest threshold exceeds 1.5cm colony length per shoot, consult for targeted thiamethoxam 25 WG spray.',
      createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
    }
  ];
}

// Initialize on load
loadDatabase();
