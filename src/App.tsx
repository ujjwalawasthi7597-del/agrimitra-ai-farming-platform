/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { Navbar } from './components/Navbar.js';
import { AuthModal } from './components/AuthModal.js';
import { DashboardView } from './views/DashboardView.js';
import { FarmsView } from './views/FarmsView.js';
import { CropsView } from './views/CropsView.js';
import { DiseaseDetectionView } from './views/DiseaseDetectionView.js';
import { AIAssistantView } from './views/AIAssistantView.js';
import { WeatherView } from './views/WeatherView.js';
import { IrrigationView } from './views/IrrigationView.js';
import { ExpensesView } from './views/ExpensesView.js';
import { SchemesView } from './views/SchemesView.js';
import { ConsultationView } from './views/ConsultationView.js';
import { SettingsView } from './views/SettingsView.js';
import { LanguageCode } from './utils/translations.js';
import { api, getAuthToken, removeAuthToken } from './utils/api.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<LanguageCode>('en');
  const [user, setUser] = useState<any | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState('karnal');
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [weatherSummary, setWeatherSummary] = useState<{ temperature: number; condition: string }>({
    temperature: 24,
    condition: 'Partly Cloudy',
  });

  // Check real database connection status and verify JWT authentication
  useEffect(() => {
    const savedLang = localStorage.getItem('agrimitra_lang') as LanguageCode;
    if (savedLang) {
      setLang(savedLang);
    }

    // Check actual MongoDB connection status
    api.getDbStatus()
      .then((status) => {
        setDbConnected(status.connected);
      })
      .catch(() => {
        setDbConnected(false);
      });

    // Check actual JWT token validity with backend Express API
    const token = getAuthToken();
    if (token) {
      api.auth
        .getMe()
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
            if (res.user.preferredLanguage) setLang(res.user.preferredLanguage);
            if (res.user.location?.district) {
              setCurrentDistrict(res.user.location.district.toLowerCase());
            }
          } else {
            removeAuthToken();
            setUser(null);
          }
        })
        .catch(() => {
          removeAuthToken();
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, []);

  // Update weather pill on district change
  useEffect(() => {
    api.weather
      .get(currentDistrict)
      .then((res) => {
        if (res?.current) {
          setWeatherSummary({
            temperature: res.current.temperature,
            condition: res.current.condition,
          });
        }
      })
      .catch(console.error);
  }, [currentDistrict]);

  const handleSelectLang = (newLang: LanguageCode) => {
    setLang(newLang);
    localStorage.setItem('agrimitra_lang', newLang);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-gray-800 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lang={lang}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthModalOpen(true)}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        <Navbar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          lang={lang}
          onSelectLang={handleSelectLang}
          user={user}
          onOpenAuth={() => setAuthModalOpen(true)}
          currentDistrict={currentDistrict}
          onSelectDistrict={setCurrentDistrict}
          weatherSummary={weatherSummary}
          dbConnected={dbConnected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              lang={lang}
              user={user}
              onNavigate={setCurrentTab}
              currentDistrict={currentDistrict}
            />
          )}

          {currentTab === 'farms' && <FarmsView lang={lang} user={user} />}

          {currentTab === 'crops' && <CropsView lang={lang} user={user} />}

          {currentTab === 'disease' && (
            <DiseaseDetectionView lang={lang} user={user} />
          )}

          {currentTab === 'ai' && <AIAssistantView lang={lang} user={user} />}

          {currentTab === 'weather' && (
            <WeatherView
              lang={lang}
              currentDistrict={currentDistrict}
              onSelectDistrict={setCurrentDistrict}
            />
          )}

          {currentTab === 'irrigation' && (
            <IrrigationView lang={lang} user={user} />
          )}

          {currentTab === 'expenses' && <ExpensesView lang={lang} user={user} />}

          {currentTab === 'schemes' && <SchemesView lang={lang} user={user} />}

          {currentTab === 'consultations' && (
            <ConsultationView lang={lang} user={user} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              lang={lang}
              user={user}
              onUpdateUser={setUser}
              onSelectLang={handleSelectLang}
            />
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => setUser(u)}
        lang={lang}
      />
    </div>
  );
}
