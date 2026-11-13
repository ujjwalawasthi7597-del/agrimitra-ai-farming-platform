import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Sprout,
  ScanSearch,
  Bot,
  CloudSun,
  Droplets,
  IndianRupee,
  Landmark,
  UserCheck,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lang: LanguageCode;
  user: any;
  onLogout: () => void;
  onOpenAuth: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  lang,
  user,
  onLogout,
  onOpenAuth,
  isOpenMobile,
  onCloseMobile,
}) => {
  const t = (key: string) => getTranslation(lang, key);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'farms', label: t('myFarms'), icon: MapPin },
    { id: 'crops', label: t('cropManagement'), icon: Sprout },
    { id: 'disease', label: t('diseaseDetection'), icon: ScanSearch, badge: 'AI' },
    { id: 'ai', label: t('aiAssistant'), icon: Bot, badge: 'Smart' },
    { id: 'weather', label: t('weather'), icon: CloudSun },
    { id: 'irrigation', label: t('irrigation'), icon: Droplets },
    { id: 'expenses', label: t('expenses'), icon: IndianRupee },
    { id: 'schemes', label: t('schemes'), icon: Landmark },
    { id: 'consultations', label: t('expertConsultation'), icon: UserCheck },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-[#153424] via-[#1b4332] to-[#122e20] text-emerald-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-emerald-950 font-bold">
              <Sprout className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">AgriMitra</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  🌱 Kisaan
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 font-medium truncate max-w-[170px]">
                {t('tagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-emerald-800">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-emerald-400/80 uppercase">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-semibold'
                    : 'text-emerald-100/90 hover:bg-emerald-800/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-lime-300' : 'text-emerald-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isActive
                          ? 'bg-lime-400 text-emerald-950'
                          : 'bg-emerald-500/20 text-lime-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-lime-300" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Farmer Profile Footer */}
        <div className="p-4 border-t border-emerald-800/60 bg-emerald-950/40">
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div
                onClick={() => handleNavClick('settings')}
                className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 hover:opacity-90"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-700 border border-emerald-500/50 flex items-center justify-center font-bold text-white shrink-0 shadow-inner">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'K'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-emerald-300 truncate">
                    {user.location?.district || 'Karnal'}, {user.location?.state || 'Haryana'}
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 rounded-lg text-emerald-300 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-emerald-950 font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <UserCheck className="w-4 h-4" />
              <span>{t('login')} / {t('register')}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
