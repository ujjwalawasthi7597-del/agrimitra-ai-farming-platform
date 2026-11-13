import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Calculator,
  Clock,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Layers,
  Info,
} from 'lucide-react';
import { api } from '../utils/api.js';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface IrrigationViewProps {
  lang: LanguageCode;
  user: any;
}

export const IrrigationView: React.FC<IrrigationViewProps> = ({ lang }) => {
  const [cropType, setCropType] = useState('Wheat');
  const [growthStage, setGrowthStage] = useState('Crown Root Initiation (CRI - 21 DAS)');
  const [soilType, setSoilType] = useState('Alluvial Loam');
  const [irrigationMethod, setIrrigationMethod] = useState('Drip Irrigation');
  const [recentRainfall, setRecentRainfall] = useState('None');
  const [currentTemp, setCurrentTemp] = useState('26');

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const t = (key: string) => getTranslation(lang, key);

  const calculateRecommendation = async () => {
    setLoading(true);
    try {
      const res = await api.irrigation.calculate({
        cropType,
        growthStage,
        soilType,
        irrigationMethod,
        recentRainfall,
        currentTemp: parseFloat(currentTemp) || 26,
      });
      setRecommendation(res);
    } catch (err) {
      console.error('Failed to calculate irrigation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRecommendation();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
              Water Optimization
            </span>
            <span className="text-xs text-gray-500">Evapotranspiration & Soil Retention Model</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1 flex items-center gap-2.5">
            <Droplets className="w-6 h-6 text-blue-500" />
            <span>{t('irrigationCalcTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 max-w-2xl">
            Input your crop growth stage, field soil composition, and weather to calculate scientific watering schedules and protect critical root stages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Field Parameters</span>
          </h2>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Crop Type
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
              >
                <option value="Wheat">Wheat (गेहूं)</option>
                <option value="Rice / Paddy">Rice / Paddy (धान)</option>
                <option value="Mustard">Mustard (सरसों)</option>
                <option value="Tomato">Tomato (टमाटर)</option>
                <option value="Cotton">Cotton (कपास)</option>
                <option value="Potato">Potato (आलू)</option>
                <option value="Sugarcane">Sugarcane (गन्ना)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Crop Growth Stage
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
              >
                <option value="Germination & Seedling">Germination & Seedling</option>
                <option value="Crown Root Initiation (CRI - 21 DAS)">
                  Crown Root Initiation (CRI - 21 DAS) [Critical]
                </option>
                <option value="Tillering / Branching">Tillering / Active Branching</option>
                <option value="Flowering / Booting">Flowering / Booting [Critical]</option>
                <option value="Grain / Fruit Filling">Grain / Fruit Filling</option>
                <option value="Maturity & Ripening">Maturity & Ripening</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Soil Type
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                >
                  <option value="Alluvial Loam">Alluvial Loam</option>
                  <option value="Alluvial Clay Loam">Alluvial Clay</option>
                  <option value="Black Cotton Soil">Black Cotton</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                  <option value="Red Laterite">Red Laterite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Irrigation System
                </label>
                <select
                  value={irrigationMethod}
                  onChange={(e) => setIrrigationMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                >
                  <option value="Drip Irrigation">Drip Irrigation</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Flood / Furrow">Flood / Furrow</option>
                  <option value="Basin">Basin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Recent Rainfall
                </label>
                <select
                  value={recentRainfall}
                  onChange={(e) => setRecentRainfall(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                >
                  <option value="None">None (Dry)</option>
                  <option value="Light (1-5mm)">Light (1-5mm)</option>
                  <option value="Moderate (5-20mm)">Moderate (5-20mm)</option>
                  <option value="Heavy (>20mm)">Heavy (&gt;20mm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Day Temperature (°C)
                </label>
                <input
                  type="number"
                  value={currentTemp}
                  onChange={(e) => setCurrentTemp(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={calculateRecommendation}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              <Droplets className="w-4 h-4" />
              <span>{loading ? 'Calculating...' : t('calculatePlan')}</span>
            </button>
          </div>
        </div>

        {/* Right Output Card */}
        <div className="lg:col-span-7 space-y-5">
          {recommendation && (
            <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-7 shadow-xs space-y-6">
              {/* Verdict Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                        recommendation.urgency === 'Immediate'
                          ? 'bg-rose-100 text-rose-800'
                          : recommendation.urgency === 'Hold'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {recommendation.urgency} Action
                    </span>
                    {recommendation.isCriticalGrowthStage && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        ⚠️ Critical Growth Stage
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">
                    {recommendation.verdict}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Soil Profile: {recommendation.soilRetentionSummary}
                  </p>
                </div>

                <div className="text-right shrink-0 bg-blue-50 p-3 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">
                    Estimated Soil Moisture
                  </span>
                  <span className="text-xl font-extrabold text-blue-700">
                    {recommendation.estimatedSoilMoisture}
                  </span>
                </div>
              </div>

              {/* Water Schedule Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Suggested Duration:
                  </span>
                  <p className="text-lg font-extrabold text-gray-900">
                    {recommendation.suggestedDuration}
                  </p>
                  <span className="text-[11px] text-gray-500 block">
                    Optimized for {irrigationMethod}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Best Time of Day:
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                    {recommendation.suggestedTimeOfDay}
                  </p>
                  <span className="text-[11px] text-gray-500 block">
                    Minimizes midday evaporation
                  </span>
                </div>
              </div>

              {/* Agronomic Guidance */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Agronomic Water-Saving Guidance</span>
                </h4>
                <div className="space-y-2">
                  {recommendation.agronomicTips?.map((tip: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs font-medium text-emerald-950 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prominent Sensor Disclaimer */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sensor & Precision Water Disclaimer</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  {recommendation.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
