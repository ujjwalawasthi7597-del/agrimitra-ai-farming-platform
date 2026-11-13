import React, { useState, useEffect } from 'react';
import { X, Sprout, User, Mail, Lock, Phone, MapPin, Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api, setAuthToken } from '../utils/api.js';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  lang: LanguageCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, lang }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; host: string | null; error: string | null } | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Haryana');
  const [district, setDistrict] = useState('Karnal');
  const [village, setVillage] = useState('Taraori');
  const [totalArea, setTotalArea] = useState('5.0');
  const [soilType, setSoilType] = useState('Alluvial Loam');

  useEffect(() => {
    if (isOpen) {
      api.getDbStatus()
        .then((res) => setDbStatus(res))
        .catch(() => setDbStatus({ connected: false, host: null, error: 'Database check failed' }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const t = (key: string) => getTranslation(lang, key);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      setAuthToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.register({
        name,
        email,
        phone,
        password,
        location: { state, district, village },
        preferredLanguage: lang,
        farmingDetails: {
          totalArea: parseFloat(totalArea) || 5,
          soilType,
          experience: 8,
          irrigationSource: 'Borewell & Canal',
        },
      });
      setAuthToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md overflow-hidden relative">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
              <Sprout className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-bold">AgriMitra</h3>
              <p className="text-xs text-emerald-200 font-medium">Smart Farming Assistant</p>
            </div>
          </div>

          {/* Real MongoDB Database Status Badge */}
          <div className="mt-4 pt-3 border-t border-emerald-700/60 flex items-center justify-between text-xs">
            <span className="text-emerald-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>MongoDB Database:</span>
            </span>
            {dbStatus?.connected ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-lime-300 font-bold border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-lime-400" />
                Connected
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-300" />
                Not Connected (Set MONGODB_URI)
              </span>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              tab === 'login'
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('login')}
          </button>
          <button
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              tab === 'register'
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('register')}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating with MongoDB...' : t('login')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Farmer Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar Patel"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@email.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Total Land ({t('acres')})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={totalArea}
                    onChange={(e) => setTotalArea(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Primary Soil
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="Alluvial Loam">Alluvial Loam</option>
                    <option value="Black Cotton Soil">Black Cotton Soil</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Clayey">Clayey</option>
                    <option value="Red Laterite">Red Laterite</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 mt-3"
              >
                {loading ? 'Registering in MongoDB...' : t('register')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
