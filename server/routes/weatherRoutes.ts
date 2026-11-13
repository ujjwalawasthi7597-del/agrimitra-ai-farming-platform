import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../auth.js';
import { Users } from '../db.js';

const router = Router();

// Indian Agricultural Key Hubs
const AGRI_LOCATIONS: Record<string, { state: string; district: string; lat: number; lon: number; baseTemp: number; baseHumidity: number }> = {
  'karnal': { state: 'Haryana', district: 'Karnal', lat: 29.6857, lon: 76.9905, baseTemp: 24, baseHumidity: 62 },
  'ludhiana': { state: 'Punjab', district: 'Ludhiana', lat: 30.9010, lon: 75.8573, baseTemp: 23, baseHumidity: 65 },
  'nashik': { state: 'Maharashtra', district: 'Nashik', lat: 19.9975, lon: 73.7898, baseTemp: 28, baseHumidity: 55 },
  'guntur': { state: 'Andhra Pradesh', district: 'Guntur', lat: 16.3067, lon: 80.4365, baseTemp: 31, baseHumidity: 70 },
  'indore': { state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lon: 75.8577, baseTemp: 27, baseHumidity: 50 },
  'varanasi': { state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lon: 82.9739, baseTemp: 26, baseHumidity: 68 },
  'jaipur': { state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lon: 75.7873, baseTemp: 29, baseHumidity: 42 },
  'patna': { state: 'Bihar', district: 'Patna', lat: 25.5941, lon: 85.1376, baseTemp: 25, baseHumidity: 72 },
  'coimbatore': { state: 'Tamil Nadu', district: 'Coimbatore', lat: 11.0168, lon: 76.9558, baseTemp: 30, baseHumidity: 64 },
  'rajkot': { state: 'Gujarat', district: 'Rajkot', lat: 22.3039, lon: 70.8022, baseTemp: 31, baseHumidity: 48 },
};

function getWeatherData(districtKey: string = 'karnal') {
  const normKey = districtKey.toLowerCase().trim();
  const loc = AGRI_LOCATIONS[normKey] || AGRI_LOCATIONS['karnal'];

  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Current weather
  const current = {
    locationName: `${loc.district}, ${loc.state}`,
    district: loc.district,
    state: loc.state,
    coordinates: { lat: loc.lat, lon: loc.lon },
    temperature: loc.baseTemp,
    feelsLike: loc.baseTemp + 1,
    condition: 'Partly Cloudy',
    humidity: loc.baseHumidity,
    rainfallMm: 0,
    windSpeedKmh: 14,
    windDirection: 'North-West (NW)',
    uvIndex: 6,
    soilMoistureEstimatePercent: 48,
    dewPoint: 16,
    pressureHpa: 1014,
    visibilityKm: 8.5,
    sunrise: '06:48 AM',
    sunset: '05:42 PM',
  };

  // 7-day forecast
  const forecast = [];
  const conditions = [
    { cond: 'Partly Cloudy', rainProb: 15, tempOffset: 0 },
    { cond: 'Clear & Sunny', rainProb: 5, tempOffset: +1 },
    { cond: 'Scattered Showers', rainProb: 65, tempOffset: -2 },
    { cond: 'Cloudy with Light Drizzle', rainProb: 45, tempOffset: -1 },
    { cond: 'Mostly Sunny', rainProb: 10, tempOffset: +1 },
    { cond: 'Clear Skies', rainProb: 0, tempOffset: +2 },
    { cond: 'Pleasant & Mild Breeze', rainProb: 10, tempOffset: 0 },
  ];

  for (let i = 0; i < 7; i++) {
    const fDate = new Date(now.getTime() + i * 86400000);
    const c = conditions[i % conditions.length];
    forecast.push({
      day: i === 0 ? 'Today' : dayNames[fDate.getDay()],
      date: fDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      maxTemp: loc.baseTemp + 3 + c.tempOffset,
      minTemp: loc.baseTemp - 8 + c.tempOffset,
      condition: c.cond,
      rainProbability: c.rainProb,
      farmingAdvisory: i === 2 
        ? 'High probability of rain showers. Do not apply foliar sprays or harvest exposed grain.'
        : i === 1 
        ? 'Excellent sunny window for mechanical weeding and solarization.' 
        : 'Good conditions for light irrigation and routine pest monitoring.',
    });
  }

  // Active weather alerts
  const alerts = [
    {
      id: 'alert-1',
      severity: 'Moderate',
      title: 'Scattered Showers Expected within 48 Hours',
      description: 'IMD agro-met bulletin indicates a mild western disturbance. Farmers are advised to postpone nitrogen broadcasting until post-rain.',
      effectiveUntil: new Date(now.getTime() + 48 * 3600000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      actionableAdvice: 'Clean drainage channels around vegetable beds to prevent root stagnation.'
    },
    {
      id: 'alert-2',
      severity: 'Low',
      title: 'Dense Morning Fog Advisory',
      description: 'Morning visibility may drop below 150m between 5:30 AM to 8:30 AM. Relative humidity will remain elevated above 85%.',
      effectiveUntil: 'Tomorrow morning',
      actionableAdvice: 'Watch out for foliar fungal spore germination on mustard and potato crops.'
    }
  ];

  // Specific agricultural recommendations
  const agroRecommendations = [
    {
      category: 'Spraying Window',
      status: 'Favorable Tomorrow Morning',
      advice: 'Winds below 12 km/h expected between 8:00 AM - 11:00 AM. Ideal for biopesticide or micronutrient application.'
    },
    {
      category: 'Irrigation Scheduling',
      status: 'Light to Moderate Need',
      advice: 'Estimated soil moisture is at 48%. Topsoil has drying tendency, but upcoming rain on day 3 suggests waiting 24 hours before heavy canal irrigation.'
    },
    {
      category: 'Harvest & Threshing',
      status: 'Safe for Next 24 Hours',
      advice: 'Keep open produce covered with tarpaulins ahead of mid-week rain.'
    }
  ];

  return {
    current,
    forecast,
    alerts,
    agroRecommendations,
    timestamp: now.toISOString(),
  };
}

// GET weather data
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const districtQuery = (req.query.district as string) || '';
    let selectedDistrict = districtQuery;

    if (!selectedDistrict && req.headers.authorization) {
      // Try to check user's registered district
      const authHeader = req.headers.authorization;
      try {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token) as any;
        if (decoded?.userId) {
          const user = Users.findById(decoded.userId);
          if (user?.location?.district) {
            selectedDistrict = user.location.district;
          }
        }
      } catch {
        // ignore
      }
    }

    const weatherData = getWeatherData(selectedDistrict || 'karnal');
    res.json(weatherData);
  } catch (err: any) {
    console.error('Weather route error:', err);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET list of supported agricultural hubs
router.get('/locations', (_req, res: Response) => {
  const hubs = Object.entries(AGRI_LOCATIONS).map(([key, loc]) => ({
    key,
    district: loc.district,
    state: loc.state,
    lat: loc.lat,
    lon: loc.lon,
  }));
  res.json({ locations: hubs });
});

export default router;
