import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Sun,
  Compass,
  AlertTriangle,
  MapPin,
  Calendar,
  CloudRain,
  Eye,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../utils/api.js';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface WeatherViewProps {
  lang: LanguageCode;
  currentDistrict: string;
  onSelectDistrict: (district: string) => void;
}

export const WeatherView: React.FC<WeatherViewProps> = ({
  lang,
  currentDistrict,
  onSelectDistrict,
}) => {
  const [weather, setWeather] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (key: string) => getTranslation(lang, key);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.weather.get(currentDistrict),
      api.weather.getLocations(),
    ])
      .then(([wRes, lRes]) => {
        setWeather(wRes);
        setLocations(lRes.locations || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentDistrict]);

  if (loading || !weather) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-emerald-100 text-center space-y-3">
        <CloudSun className="w-10 h-10 text-emerald-600 animate-pulse mx-auto" />
        <p className="text-sm font-bold text-gray-700">Loading Agricultural Weather Forecast...</p>
      </div>
    );
  }

  const { current, forecast, alerts, agroRecommendations } = weather;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Location Selector */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              IMD Agro-Met Service
            </span>
            <span className="text-xs text-gray-500">Live Satellite & Radar Synced</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1 flex items-center gap-2.5">
            <CloudSun className="w-6 h-6 text-amber-500" />
            <span>{t('weather')} ({current.locationName})</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time agro-meteorological advisories, rainfall forecasts, and field operation windows.
          </p>
        </div>

        {/* Location Hub Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
            District:
          </label>
          <select
            value={currentDistrict.toLowerCase()}
            onChange={(e) => onSelectDistrict(e.target.value)}
            className="px-3.5 py-2 rounded-2xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-800 bg-gray-50 hover:bg-gray-100 focus:outline-hidden focus:border-emerald-500"
          >
            {locations.map((loc) => (
              <option key={loc.key} value={loc.key}>
                {loc.district}, {loc.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Weather Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Temp & Condition */}
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-lime-400" />
              <span>{current.locationName}</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight">
                {current.temperature}°
              </span>
              <span className="text-xl sm:text-2xl font-semibold text-emerald-200">
                {current.condition}
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 font-medium">
              Feels like {current.feelsLike}°C • Dew Point {current.dewPoint}°C • UV Index {current.uvIndex}
            </p>
          </div>

          {/* Environmental Metrics Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 text-emerald-200 text-xs mb-1">
                <Droplets className="w-4 h-4 text-cyan-300" />
                <span>Relative Humidity</span>
              </div>
              <span className="text-xl font-extrabold">{current.humidity}%</span>
              <span className="text-[10px] text-emerald-200/80 block mt-0.5">Optimal for crops</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 text-emerald-200 text-xs mb-1">
                <Wind className="w-4 h-4 text-lime-300" />
                <span>Wind Speed</span>
              </div>
              <span className="text-xl font-extrabold">{current.windSpeedKmh} km/h</span>
              <span className="text-[10px] text-emerald-200/80 block mt-0.5">{current.windDirection}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 text-emerald-200 text-xs mb-1">
                <CloudRain className="w-4 h-4 text-blue-300" />
                <span>Precipitation</span>
              </div>
              <span className="text-xl font-extrabold">{current.rainfallMm} mm</span>
              <span className="text-[10px] text-emerald-200/80 block mt-0.5">Dry canopy today</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center gap-1.5 text-emerald-200 text-xs mb-1">
                <Sun className="w-4 h-4 text-amber-300" />
                <span>Soil Moisture</span>
              </div>
              <span className="text-xl font-extrabold">~{current.soilMoistureEstimatePercent}%</span>
              <span className="text-[10px] text-emerald-200/80 block mt-0.5">Estimated model</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Alerts & Warnings */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            Active Agro-Meteorological Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-amber-950 text-sm">{alert.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {alert.severity} Risk
                  </span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">{alert.description}</p>
                <div className="pt-2 border-t border-amber-200/60 flex items-center gap-1 text-xs font-semibold text-amber-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Farmer Action: {alert.actionableAdvice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specific Farming Recommendations */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Weather-Based Field Recommendations</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agroRecommendations?.map((rec: any, idx: number) => (
            <div key={idx} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">{rec.category}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                  {rec.status}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{rec.advice}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast Cards */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>7-Day Agricultural Forecast</span>
          </h2>
          <span className="text-xs text-gray-400">Includes Rain Risk & Advisory</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecast?.map((day: any, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border text-center flex flex-col justify-between space-y-2 transition-all ${
                idx === 0
                  ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                  : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-emerald-200'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-gray-800 block">{day.day}</span>
                <span className="text-[10px] text-gray-400 block">{day.date}</span>
              </div>

              <div className="py-1">
                <CloudSun className="w-7 h-7 text-amber-500 mx-auto" />
                <span className="text-[11px] font-semibold text-gray-700 block mt-1 truncate">
                  {day.condition}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-center items-baseline gap-1 text-sm font-extrabold">
                  <span className="text-gray-900">{day.maxTemp}°</span>
                  <span className="text-xs font-normal text-gray-400">/ {day.minTemp}°</span>
                </div>

                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 py-0.5 rounded-full">
                  <CloudRain className="w-3 h-3" />
                  <span>{day.rainProbability}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
