import React, { useEffect, useState } from 'react';
import {
  Sprout,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  X,
  Target,
  Sparkles,
  Layers,
} from 'lucide-react';
import { api } from '../utils/api.js';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface CropsViewProps {
  lang: LanguageCode;
  user: any;
}

export const CropsView: React.FC<CropsViewProps> = ({ lang }) => {
  const [crops, setCrops] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'crops' | 'calendar'>('crops');
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add crop form
  const [cropName, setCropName] = useState('Wheat (गेहूं)');
  const [variety, setVariety] = useState('HD-2967');
  const [farmId, setFarmId] = useState('');
  const [areaAcres, setAreaAcres] = useState('3.0');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(
    new Date(Date.now() + 110 * 86400000).toISOString().split('T')[0]
  );
  const [targetYield, setTargetYield] = useState('50');

  // Add activity form
  const [actTitle, setActTitle] = useState('');
  const [actCropId, setActCropId] = useState('');
  const [actType, setActType] = useState('Fertilizer Application');
  const [actDate, setActDate] = useState(new Date().toISOString().split('T')[0]);
  const [actPriority, setActPriority] = useState('High');
  const [actDesc, setActDesc] = useState('');

  const t = (key: string) => getTranslation(lang, key);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cropsRes, farmsRes, actRes] = await Promise.all([
        api.crops.getAll(),
        api.farms.getAll(),
        api.crops.getCalendar(),
      ]);
      setCrops(cropsRes.crops || []);
      setFarms(farmsRes.farms || []);
      setActivities(actRes.activities || []);
      if (farmsRes.farms && farmsRes.farms.length > 0) {
        setFarmId(farmsRes.farms[0]._id);
      }
    } catch (err) {
      console.error('Failed to load crop data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.crops.create({
        cropName,
        variety,
        farmId,
        areaAcres: parseFloat(areaAcres),
        sowingDate,
        expectedHarvestDate,
        targetYieldQuintals: parseFloat(targetYield),
      });
      setShowAddCropModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to add crop:', err);
    }
  };

  const handleDeleteCrop = async (id: string) => {
    if (!confirm('Are you sure you want to delete this crop and its associated calendar?')) return;
    try {
      await api.crops.delete(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete crop:', err);
    }
  };

  const handleToggleActivity = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.crops.updateActivity(id, { status: nextStatus });
      setActivities(prev => prev.map(a => a._id === id ? { ...a, status: nextStatus } : a));
    } catch (err) {
      console.error('Failed to update activity:', err);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle || !actDate) return;
    try {
      await api.crops.addActivity({
        title: actTitle,
        cropId: actCropId,
        activityType: actType,
        scheduledDate: actDate,
        priority: actPriority,
        description: actDesc,
      });
      setShowAddActivityModal(false);
      setActTitle('');
      setActDesc('');
      const actRes = await api.crops.getCalendar();
      setActivities(actRes.activities || []);
    } catch (err) {
      console.error('Failed to add activity:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <Sprout className="w-6 h-6 text-emerald-600" />
            <span>{t('cropManagement')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track crop growth stages, harvest targets, and auto-generated ICAR milestone calendars.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'crops' ? (
            <button
              onClick={() => setShowAddCropModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addCrop')}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddActivityModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Farm Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('crops')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'crops'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Active Crops ({crops.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'calendar'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Crop Calendar & Milestones ({activities.length})</span>
        </button>
      </div>

      {/* Active Tab: Crops Gallery */}
      {activeTab === 'crops' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <div
              key={crop._id}
              className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs hover:border-emerald-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">{crop.cropName}</h3>
                  <span className="text-xs text-gray-500 block">Variety: {crop.variety}</span>
                </div>
                <button
                  onClick={() => handleDeleteCrop(crop._id)}
                  title="Remove Crop"
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-100">
                  {crop.areaAcres} {t('acres')}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-semibold border border-blue-100">
                  {crop.farmName}
                </span>
              </div>

              {/* Stage Progress */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-700">Stage: {crop.stage}</span>
                  <span className="font-extrabold text-emerald-700">{crop.stageProgressPercent || 40}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full"
                    style={{ width: `${crop.stageProgressPercent || 40}%` }}
                  />
                </div>
              </div>

              {/* Target Yield */}
              <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  Target Yield:
                </span>
                <span className="font-bold text-gray-900">
                  {crop.targetYieldQuintals} {t('quintals')}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Sown: {crop.sowingDate}</span>
                <span className="font-semibold text-gray-700">Harvest: {crop.expectedHarvestDate}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Crop Calendar Tab */
        <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">{t('cropCalendar')}</h3>
              <p className="text-xs text-gray-500">
                Synchronized ICAR farming schedule with irrigation, weed control, fertilizer, and pest monitoring reminders.
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {activities.map((act) => {
              const isCompleted = act.status === 'Completed';
              return (
                <div
                  key={act._id}
                  className="py-3.5 flex items-start gap-4 hover:bg-emerald-50/40 px-3 rounded-2xl transition-colors"
                >
                  <button
                    onClick={() => handleToggleActivity(act._id, act.status)}
                    className="mt-1 shrink-0 focus:outline-hidden"
                  >
                    <CheckCircle2
                      className={`w-6 h-6 transition-colors ${
                        isCompleted
                          ? 'text-emerald-600 fill-emerald-100'
                          : 'text-gray-300 hover:text-emerald-500'
                      }`}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        {act.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {act.cropName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          act.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {act.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {act.description || 'Routine agricultural maintenance task.'}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <Clock className="w-3.5 h-3.5" />
                        Due Date: {act.scheduledDate}
                      </span>
                      <span>Type: {act.activityType}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Crop Modal */}
      {showAddCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md overflow-hidden">
            <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sprout className="w-5 h-5 text-lime-400" />
                <h3 className="font-extrabold text-lg">{t('addCrop')}</h3>
              </div>
              <button
                onClick={() => setShowAddCropModal(false)}
                className="p-1 rounded-full bg-emerald-800 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCrop} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Crop Name
                </label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Wheat (गेहूं) or Mustard (सरसों)"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Variety
                  </label>
                  <input
                    type="text"
                    required
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. HD-2967 / Pusa"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Farm Plot
                  </label>
                  <select
                    value={farmId}
                    onChange={(e) => setFarmId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    {farms.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.areaAcres} ac)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Cultivated Area ({t('acres')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Target Yield ({t('quintals')})
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={targetYield}
                    onChange={(e) => setTargetYield(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Sowing Date
                  </label>
                  <input
                    type="date"
                    required
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Exp. Harvest Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                ICAR crop calendar milestones will be automatically scheduled!
              </p>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] mt-2"
              >
                {t('addCrop')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md overflow-hidden">
            <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-lime-400" />
                <h3 className="font-extrabold text-lg">Add Custom Task</h3>
              </div>
              <button
                onClick={() => setShowAddActivityModal(false)}
                className="p-1 rounded-full bg-emerald-800 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  placeholder="e.g. Zinc Spray or Interculture Weeding"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Related Crop
                  </label>
                  <select
                    value={actCropId}
                    onChange={(e) => setActCropId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="">Farm Common</option>
                    {crops.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.cropName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Task Type
                  </label>
                  <select
                    value={actType}
                    onChange={(e) => setActType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="Irrigation">Irrigation</option>
                    <option value="Fertilizer Application">Fertilizer Application</option>
                    <option value="Pest Management">Pest Management</option>
                    <option value="Weed Control">Weed Control</option>
                    <option value="Harvesting">Harvesting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={actPriority}
                    onChange={(e) => setActPriority(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                  placeholder="Instructions, chemicals or labor details..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] mt-2"
              >
                Schedule Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
