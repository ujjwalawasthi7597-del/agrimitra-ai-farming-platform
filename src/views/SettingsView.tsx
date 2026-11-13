import React, { useState } from 'react';
import { Settings, User, MapPin, Globe, Save, CheckCircle2, Sprout } from 'lucide-react';
import { api } from '../utils/api.js';
import { LanguageCode, SUPPORTED_LANGUAGES, getTranslation } from '../utils/translations.js';

interface SettingsViewProps {
  lang: LanguageCode;
  user: any;
  onUpdateUser: (user: any) => void;
  onSelectLang: (lang: LanguageCode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  user,
  onUpdateUser,
  onSelectLang,
}) => {
  const [name, setName] = useState(user?.name || 'Ramesh Kumar Patel');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [state, setState] = useState(user?.location?.state || 'Haryana');
  const [district, setDistrict] = useState(user?.location?.district || 'Karnal');
  const [village, setVillage] = useState(user?.location?.village || 'Taraori');
  const [landArea, setLandArea] = useState(user?.totalLandAreaAcres?.toString() || '8.5');
  const [soilType, setSoilType] = useState(user?.primarySoilType || 'Alluvial Loam');
  const [irrigationSource, setIrrigationSource] = useState(user?.irrigationSource || 'Tube Well & Drip');
  const [experience, setExperience] = useState(user?.farmingExperienceYears?.toString() || '18');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const t = (key: string) => getTranslation(lang, key);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await api.auth.updateProfile({
        name,
        phone,
        location: { state, district, village },
        preferredLanguage: lang,
        totalLandAreaAcres: parseFloat(landArea) || 5,
        primarySoilType: soilType,
        irrigationSource,
        farmingExperienceYears: parseInt(experience, 10) || 5,
      });
      onUpdateUser(res.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>{t('settings')} & Farmer Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your personal farmer credentials, farm location, soil characteristics, and preferred regional language.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs max-w-3xl">
        <form onSubmit={handleSave} className="space-y-5">
          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Farmer profile updated successfully!</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Basic Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Farmer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Mobile Number (Kisan SMS Alert)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Location & Agro-Climatic Zone</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Village / Tehsil
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Farm Land & Soil Infrastructure</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Total Landholding ({t('acres')})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Primary Soil Classification
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                >
                  <option value="Alluvial Loam">Alluvial Loam</option>
                  <option value="Alluvial Clay Loam">Alluvial Clay Loam</option>
                  <option value="Black Cotton Soil">Black Cotton Soil</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                  <option value="Red Laterite">Red Laterite</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Irrigation Infrastructure
                </label>
                <input
                  type="text"
                  value={irrigationSource}
                  onChange={(e) => setIrrigationSource(e.target.value)}
                  placeholder="e.g. Solar Tube Well, Drip & Canal"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Farming Experience (Years)
                </label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Preferred Regional Language</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => onSelectLang(l.code)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    lang === l.code
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold shadow-xs'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-white text-gray-700 font-medium'
                  }`}
                >
                  <span className="block text-sm">{l.nativeLabel}</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
