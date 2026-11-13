import React, { useEffect, useState } from 'react';
import {
  Sprout,
  ScanSearch,
  Bot,
  CloudSun,
  Droplets,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { api } from '../utils/api.js';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface DashboardViewProps {
  lang: LanguageCode;
  user: any;
  onNavigate: (tab: string) => void;
  currentDistrict: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  user,
  onNavigate,
  currentDistrict,
}) => {
  const [crops, setCrops] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [finance, setFinance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const t = (key: string) => getTranslation(lang, key);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [cropsRes, actRes, weatherRes, finRes] = await Promise.allSettled([
        api.crops.getAll(),
        api.crops.getCalendar(),
        api.weather.get(currentDistrict),
        api.finance.getAnalytics(),
      ]);

      if (cropsRes.status === 'fulfilled') setCrops(cropsRes.value.crops || []);
      if (actRes.status === 'fulfilled') setActivities(actRes.value.activities || []);
      if (weatherRes.status === 'fulfilled') setWeather(weatherRes.value);
      if (finRes.status === 'fulfilled') setFinance(finRes.value);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentDistrict]);

  const handleToggleActivity = async (activityId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.crops.updateActivity(activityId, { status: nextStatus });
      setActivities((prev) =>
        prev.map((a) => (a._id === activityId ? { ...a, status: nextStatus } : a))
      );
    } catch (err) {
      console.error('Failed to toggle activity:', err);
    }
  };

  const totalAcres =
    user?.totalLandAreaAcres ||
    crops.reduce((acc, c) => acc + (parseFloat(c.areaAcres) || 0), 0) ||
    0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.25),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-emerald-950 text-xs font-bold uppercase tracking-wider">
                Rabi Season 2026
              </span>
              <span className="text-emerald-300 text-xs font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-lime-400" />
                {currentDistrict || 'Karnal'}, Haryana
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('welcomeBack')}, {user?.name || 'Kisan Bhai'}!
            </h1>
            <p className="text-emerald-100 text-sm max-w-xl font-normal leading-relaxed">
              {t('tagline')} Your farm condition is optimal today. Check below for today&apos;s critical actions and rainfall forecasts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('disease')}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
            >
              <ScanSearch className="w-4 h-4 text-emerald-600" />
              <span>{t('diagnoseLeaf')}</span>
            </button>
            <button
              onClick={() => onNavigate('ai')}
              className="px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-emerald-950 text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
            >
              <Bot className="w-4 h-4 text-emerald-950" />
              <span>{t('askAgriMitra')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Farm Area */}
        <div
          onClick={() => onNavigate('farms')}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('totalFarmArea')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{totalAcres}</span>
            <span className="text-xs text-gray-500 font-semibold">{t('acres')}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">3 Registered Farm Plots</p>
        </div>

        {/* Currently Growing Crops */}
        <div
          onClick={() => onNavigate('crops')}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('growingCrops')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{crops.length}</span>
            <span className="text-xs text-gray-500 font-semibold">Active Varieties</span>
          </div>
          <p className="text-[11px] text-lime-700 font-medium mt-1">
            {crops.length > 0 ? crops.map(c => c.cropName).slice(0, 3).join(', ') : 'No active crops registered yet'}
          </p>
        </div>

        {/* Weather Conditions */}
        <div
          onClick={() => onNavigate('weather')}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('weather')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CloudSun className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {weather?.current?.temperature || 24}°C
            </span>
            <span className="text-xs text-gray-500 font-semibold">
              {weather?.current?.condition || 'Partly Cloudy'}
            </span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Humidity: {weather?.current?.humidity || 62}% • Rain: 15%
          </p>
        </div>

        {/* Estimated Farm Profit */}
        <div
          onClick={() => onNavigate('expenses')}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('netProfit')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              ₹{(finance?.netProfit || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            Margin: {finance?.profitMargin || 0}% from Mandi Sales
          </p>
        </div>
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            {t('quickActions')}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => onNavigate('disease')}
            className="p-3 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200/60 text-left transition-colors flex flex-col gap-1.5"
          >
            <ScanSearch className="w-5 h-5 text-emerald-700" />
            <span className="text-xs font-bold text-gray-900">{t('diagnoseLeaf')}</span>
            <span className="text-[10px] text-gray-500">Detect Blight, Rust, Pests</span>
          </button>

          <button
            onClick={() => onNavigate('ai')}
            className="p-3 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200/60 text-left transition-colors flex flex-col gap-1.5"
          >
            <Bot className="w-5 h-5 text-emerald-700" />
            <span className="text-xs font-bold text-gray-900">{t('askAgriMitra')}</span>
            <span className="text-[10px] text-gray-500">Dosage, Soils, Varieties</span>
          </button>

          <button
            onClick={() => onNavigate('irrigation')}
            className="p-3 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200/60 text-left transition-colors flex flex-col gap-1.5"
          >
            <Droplets className="w-5 h-5 text-emerald-700" />
            <span className="text-xs font-bold text-gray-900">{t('waterSchedule')}</span>
            <span className="text-[10px] text-gray-500">Smart Irrigation Timing</span>
          </button>

          <button
            onClick={() => onNavigate('expenses')}
            className="p-3 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200/60 text-left transition-colors flex flex-col gap-1.5"
          >
            <IndianRupee className="w-5 h-5 text-emerald-700" />
            <span className="text-xs font-bold text-gray-900">{t('addExpense')}</span>
            <span className="text-[10px] text-gray-500">Seeds, Fertilizers, Labor</span>
          </button>

          <button
            onClick={() => onNavigate('schemes')}
            className="p-3 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200/60 text-left transition-colors flex flex-col gap-1.5"
          >
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <span className="text-xs font-bold text-gray-900">{t('schemes')}</span>
            <span className="text-[10px] text-gray-500">PM-KISAN, KCC, Fasal Bima</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Growing Crops + Upcoming Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Crops Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span>{t('growingCrops')}</span>
            </h2>
            <button
              onClick={() => onNavigate('crops')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Manage Crops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {crops.map((crop) => (
              <div
                key={crop._id}
                className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{crop.cropName}</h3>
                    <p className="text-xs text-gray-500">
                      {crop.variety} • {crop.areaAcres} Acres ({crop.farmName})
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      crop.healthStatus === 'Excellent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : crop.healthStatus === 'Attention Needed'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {crop.healthStatus}
                  </span>
                </div>

                {/* Growth Stage Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 font-medium">Stage: {crop.stage}</span>
                    <span className="font-bold text-emerald-700">{crop.stageProgressPercent || 40}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full"
                      style={{ width: `${crop.stageProgressPercent || 40}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Sown: {crop.sowingDate}</span>
                  <span className="font-semibold text-gray-700">
                    Est. Harvest: {crop.expectedHarvestDate || 'In 75 days'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Weather Advisory Banner */}
          {weather?.alerts && weather.alerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase">
                  Agro-Meteorological Advisory ({currentDistrict || 'Karnal'})
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {weather.alerts[0].description} {weather.alerts[0].actionableAdvice}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Upcoming Activities / Crop Calendar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>{t('upcomingActivities')}</span>
            </h2>
            <button
              onClick={() => onNavigate('crops')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View Calendar
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-xs divide-y divide-gray-100 space-y-3">
            {activities.slice(0, 5).map((act) => {
              const isCompleted = act.status === 'Completed';
              return (
                <div key={act._id} className="pt-3 first:pt-0 flex items-start gap-3">
                  <button
                    onClick={() => handleToggleActivity(act._id, act.status)}
                    className="mt-0.5 shrink-0 focus:outline-hidden"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 transition-colors ${
                        isCompleted ? 'text-emerald-600 fill-emerald-100' : 'text-gray-300 hover:text-emerald-500'
                      }`}
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {act.title}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{act.cropName}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {act.scheduledDate}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          act.priority === 'High'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {act.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
