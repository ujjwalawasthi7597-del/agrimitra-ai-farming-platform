import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Edit3, Droplets, Mountain, Layers, X } from 'lucide-react';
import { api } from '../utils/api.js';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface FarmsViewProps {
  lang: LanguageCode;
  user: any;
}

export const FarmsView: React.FC<FarmsViewProps> = ({ lang }) => {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Add form fields
  const [name, setName] = useState('');
  const [areaAcres, setAreaAcres] = useState('');
  const [soilType, setSoilType] = useState('Alluvial Loam');
  const [waterSource, setWaterSource] = useState('Borewell');
  const [irrigationType, setIrrigationType] = useState('Drip Irrigation');
  const [locationDescription, setLocationDescription] = useState('');

  const t = (key: string) => getTranslation(lang, key);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const res = await api.farms.getAll();
      setFarms(res.farms || []);
    } catch (err) {
      console.error('Failed to fetch farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !areaAcres) return;
    setSubmitting(true);
    try {
      await api.farms.create({
        name,
        areaAcres: parseFloat(areaAcres),
        soilType,
        waterSource,
        irrigationType,
        locationDescription,
      });
      setShowAddModal(false);
      setName('');
      setAreaAcres('');
      setLocationDescription('');
      fetchFarms();
    } catch (err) {
      console.error('Failed to create farm plot:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFarm = async (id: string) => {
    if (!confirm('Are you sure you want to remove this farm plot?')) return;
    try {
      await api.farms.delete(id);
      setFarms(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      console.error('Failed to delete farm plot:', err);
    }
  };

  const totalLand = farms.reduce((sum, f) => sum + (parseFloat(f.areaAcres) || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-emerald-600" />
            <span>{t('myFarms')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your agricultural land holdings, soil profiles, and water infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
            Total Land: <span className="text-base text-emerald-700">{totalLand.toFixed(1)}</span> {t('acres')}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addPlot')}</span>
          </button>
        </div>
      </div>

      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {farms.map((farm) => (
          <div
            key={farm._id}
            className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">{farm.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{farm.locationDescription || 'Registered Farm Unit'}</p>
                </div>
                <button
                  onClick={() => handleDeleteFarm(farm._id)}
                  title="Remove Plot"
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Area Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-sm mb-4 border border-emerald-100">
                <Mountain className="w-4 h-4 text-emerald-600" />
                <span>{farm.areaAcres} {t('acres')}</span>
              </div>

              {/* Attributes List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    Soil Classification:
                  </span>
                  <span className="font-bold text-gray-800">{farm.soilType}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    Water Source:
                  </span>
                  <span className="font-bold text-gray-800">{farm.waterSource}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-500 font-medium">Irrigation Method:</span>
                  <span className="font-bold text-emerald-700">{farm.irrigationType}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Registered Farm Plot</span>
              <span className="text-emerald-700 font-bold">Active Cultivation</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Farm Plot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md overflow-hidden">
            <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-lime-400" />
                <h3 className="font-extrabold text-lg">{t('addPlot')}</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full bg-emerald-800 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFarm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Plot Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. West Canal Field"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Area ({t('acres')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(e.target.value)}
                    placeholder="e.g. 3.5"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
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
                    <option value="Alluvial Clay Loam">Alluvial Clay Loam</option>
                    <option value="Black Cotton Soil">Black Cotton Soil</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Red Laterite">Red Laterite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Water Source
                  </label>
                  <select
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="Borewell">Borewell</option>
                    <option value="Solar Tube Well">Solar Tube Well</option>
                    <option value="Canal Water">Canal Water</option>
                    <option value="Farm Pond">Farm Pond</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Irrigation System
                  </label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Flood / Furrow">Flood / Furrow</option>
                    <option value="Basin">Basin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Location / Landmarks
                </label>
                <input
                  type="text"
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  placeholder="e.g. Near village tube well, North gate"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {submitting ? 'Adding Plot...' : t('addPlot')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
