import React, { useState } from 'react';
import {
  Menu,
  Globe,
  Bell,
  MapPin,
  CloudSun,
  User,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Database,
} from 'lucide-react';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  getTranslation,
} from '../utils/translations.js';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  lang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  user: any;
  onOpenAuth: () => void;
  currentDistrict: string;
  onSelectDistrict: (district: string) => void;
  weatherSummary?: {
    temperature: number;
    condition: string;
  };
  dbConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  lang,
  onSelectLang,
  user,
  onOpenAuth,
  currentDistrict,
  onSelectDistrict,
  weatherSummary,
  dbConnected,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const t = (key: string) => getTranslation(lang, key);

  const keyDistricts = [
    { name: 'Karnal', state: 'Haryana' },
    { name: 'Ludhiana', state: 'Punjab' },
    { name: 'Nashik', state: 'Maharashtra' },
    { name: 'Guntur', state: 'Andhra Pradesh' },
    { name: 'Indore', state: 'Madhya Pradesh' },
    { name: 'Varanasi', state: 'Uttar Pradesh' },
    { name: 'Jaipur', state: 'Rajasthan' },
    { name: 'Patna', state: 'Bihar' },
    { name: 'Coimbatore', state: 'Tamil Nadu' },
    { name: 'Rajkot', state: 'Gujarat' },
  ];

  const notifications = [
    {
      id: '1',
      title: 'Scattered Rainfall Alert',
      desc: '12-18mm rainfall predicted over Karnal. Postpone pesticide sprays.',
      time: '2h ago',
      urgent: true,
    },
    {
      id: '2',
      title: 'Irrigation Due for Wheat',
      desc: 'Crown root stage reached in North Field.',
      time: '14h ago',
      urgent: false,
    },
    {
      id: '3',
      title: 'PM-KISAN Update',
      desc: 'Direct Benefit Transfer credited to Aadhaar linked account.',
      time: '2d ago',
      urgent: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & location indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl text-emerald-800 hover:bg-emerald-50 lg:hidden focus:outline-hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* District Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLocationMenu(!showLocationMenu);
                setShowLangMenu(false);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 text-xs sm:text-sm font-semibold transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="capitalize">{currentDistrict || 'Karnal'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
            </button>

            {showLocationMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Agricultural Hub
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {keyDistricts.map((d) => (
                    <button
                      key={d.name}
                      onClick={() => {
                        onSelectDistrict(d.name.toLowerCase());
                        setShowLocationMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs sm:text-sm flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                        currentDistrict.toLowerCase() === d.name.toLowerCase()
                          ? 'font-bold text-emerald-700 bg-emerald-50/60'
                          : 'text-gray-700'
                      }`}
                    >
                      <span>
                        {d.name},{' '}
                        <span className="text-gray-400 text-xs">{d.state}</span>
                      </span>
                      {currentDistrict.toLowerCase() === d.name.toLowerCase() && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Real-time Weather mini pill */}
          {weatherSummary && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/70 text-xs font-medium">
              <CloudSun className="w-4 h-4 text-amber-600" />
              <span>
                {weatherSummary.temperature}°C • {weatherSummary.condition}
              </span>
            </div>
          )}
        </div>

        {/* Right controls: MongoDB status, Language, notifications, profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live MongoDB Status Indicator */}
          <div
            title={
              dbConnected
                ? 'MongoDB is connected via Mongoose'
                : 'MongoDB not connected. Set MONGODB_URI in your environment variables to connect.'
            }
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
              dbConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${dbConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span>{dbConnected ? 'MongoDB Connected' : 'MongoDB Offline'}</span>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowLocationMenu(false);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs sm:text-sm font-medium transition-colors"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">
                {SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.nativeLabel || 'English'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onSelectLang(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs sm:text-sm flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                      lang === l.code
                        ? 'font-bold text-emerald-700 bg-emerald-50/60'
                        : 'text-gray-700'
                    }`}
                  >
                    <span>
                      {l.nativeLabel} <span className="text-gray-400 text-xs">({l.label})</span>
                    </span>
                    {lang === l.code && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowLangMenu(false);
                setShowLocationMenu(false);
              }}
              className="relative p-2 rounded-full text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-emerald-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">{t('farmingAlerts')}</span>
                  <span className="text-[11px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-semibold">
                    3 New
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-2">
                        {n.urgent ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                          <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{n.desc}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Pill */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user.name?.charAt(0) || 'K'}
              </div>
              <span className="text-xs font-semibold text-gray-800 hidden md:block max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('login')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
