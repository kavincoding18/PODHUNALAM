import React, { useState } from 'react';
import { 
  Globe, 
  ShieldAlert, 
  User, 
  Bell, 
  Check, 
  Database,
  PlusCircle,
  Menu,
  X,
  MapPin
} from 'lucide-react';
import { UserRole } from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenSupabaseModal: () => void;
  onOpenOfflineModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  onOpenSupabaseModal,
  onOpenOfflineModal
}) => {
  const t = translations[language];
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = store.currentUser;
  const unreadNotifs = store.notifications.filter(n => !n.isRead);

  const roles: { role: UserRole; labelEn: string; labelTa: string }[] = [
    { role: 'citizen', labelEn: 'Citizen', labelTa: 'பொதுமக்கள்' },
    { role: 'operator', labelEn: 'Camp Operator', labelTa: 'முகாம் அலுவலர்' },
    { role: 'ao', labelEn: 'AO / Tahsildar (West)', labelTa: 'வட்டாட்சியர் (மேற்கு)' },
    { role: 'rdo', labelEn: 'RDO Division', labelTa: 'கோட்ட அலுவலர் (RDO)' },
    { role: 'dro', labelEn: 'DRO District', labelTa: 'மாவட்ட அலுவலர் (DRO)' },
    { role: 'collector', labelEn: 'Collector (Pratik Tayal IAS)', labelTa: 'ஆட்சியர் (பிரதீக் தயாள் IAS)' },
    { role: 'admin', labelEn: 'Sys Admin', labelTa: 'கணினி நிர்வாகி' }
  ];

  const handleRoleChange = (role: UserRole) => {
    store.setCurrentUserRole(role);
    if (role === 'citizen') {
      setCurrentTab('citizen');
    } else if (role === 'operator') {
      setCurrentTab('citizen');
      onOpenOfflineModal();
    } else if (role === 'collector') {
      setCurrentTab('collector');
    } else if (role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('officer');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Bar following strict 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        
        {/* Zone 1: Top-Left Corner Brand Heading prominently in TAMIL + Bilingual Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('citizen')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap group focus:outline-none"
            title="முகப்புப் பக்கம் / Home"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-extrabold text-lg shadow-xs">
              பொ
            </div>
            <div className="leading-tight">
              {/* Heading at top left is prominently in TAMIL per requirement */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-teal-400 transition-colors font-sans">
                  பொதுநலம்
                </span>
                <span className="hidden sm:inline text-xs text-teal-400 font-semibold tracking-wider font-mono">
                  PODHUNALAM
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                {language === 'ta' ? 'திருச்சிராப்பள்ளி மாவட்டம் & மாநகராட்சி' : 'Tiruchirappalli District & Corporation'}
              </div>
            </div>
          </button>

          {/* Bilingual Access Selector right on top-left bar */}
          <div className="hidden sm:flex items-center bg-slate-800/90 border border-slate-700 rounded-md p-0.5 text-xs">
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-1 rounded font-semibold transition-all whitespace-nowrap ${
                language === 'ta'
                  ? 'bg-teal-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="முழுமையான தமிழ் இடைமுகம்"
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded font-semibold transition-all whitespace-nowrap ${
                language === 'en'
                  ? 'bg-teal-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Full English Interface"
            >
              English
            </button>
          </div>
        </div>

        {/* Zone 2: Concise Nav Links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => setCurrentTab('citizen')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'citizen' ? 'text-teal-400 border-b-2 border-teal-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t.navHome}
          </button>
          
          <button
            onClick={() => setCurrentTab('track')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'track' ? 'text-teal-400 border-b-2 border-teal-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t.navTrack}
          </button>

          <button
            onClick={() => setCurrentTab('map')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'map' ? 'text-teal-400 border-b-2 border-teal-400 font-bold' : 'hover:text-white'
            }`}
          >
            {language === 'ta' ? 'திருச்சி வரைபடம்' : 'Trichy Map'}
          </button>

          <button
            onClick={() => setCurrentTab('officer')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'officer' ? 'text-teal-400 border-b-2 border-teal-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t.navOfficerWorkspace}
          </button>

          <button
            onClick={() => setCurrentTab('collector')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'collector' ? 'text-teal-400 border-b-2 border-teal-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t.navCollectorCommand}
          </button>

          <button
            onClick={() => setCurrentTab('admin')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'admin' ? 'text-teal-400 border-b-2 border-teal-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t.navAdmin}
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Utility */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile language switch */}
          <button
            onClick={() => setLanguage(language === 'ta' ? 'en' : 'ta')}
            className="sm:hidden px-2 py-1 text-xs font-semibold rounded bg-slate-800 text-teal-400 border border-slate-700"
          >
            {language === 'ta' ? 'EN' : 'தமிழ்'}
          </button>

          {/* Database / Supabase Inspector */}
          <button
            onClick={onOpenSupabaseModal}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Inspect Supabase Database"
          >
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>{language === 'ta' ? 'தரவுத்தளம்' : 'Supabase'}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-slate-900 flex items-center justify-center">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{language === 'ta' ? 'திருச்சி மாவட்ட அறிவிப்புகள்' : 'Tiruchirappalli Notifications'}</span>
                  <span className="text-slate-500 font-normal">{store.notifications.length} total</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {store.notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No notifications</div>
                  ) : (
                    store.notifications.slice(0, 5).map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => store.markNotificationRead(n.id)}
                        className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-teal-50/40' : ''}`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-900 mb-0.5">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{n.referenceNumber}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button: Report Problem */}
          <button
            onClick={() => setCurrentTab('new')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t.navNewGrievance}</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-300 hover:text-white rounded"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-b border-slate-700 px-4 py-3 space-y-2 text-xs font-semibold">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <span className="text-slate-400">Language / மொழி:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setLanguage('ta'); setMobileMenuOpen(false); }}
                className={`px-2.5 py-1 rounded font-semibold ${language === 'ta' ? 'bg-teal-400 text-slate-950' : 'text-slate-300'}`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => { setLanguage('en'); setMobileMenuOpen(false); }}
                className={`px-2.5 py-1 rounded font-semibold ${language === 'en' ? 'bg-teal-400 text-slate-950' : 'text-slate-300'}`}
              >
                English
              </button>
            </div>
          </div>
          <button
            onClick={() => { setCurrentTab('citizen'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1.5 text-slate-200 hover:text-teal-400"
          >
            {t.navHome}
          </button>
          <button
            onClick={() => { setCurrentTab('track'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1.5 text-slate-200 hover:text-teal-400"
          >
            {t.navTrack}
          </button>
          <button
            onClick={() => { setCurrentTab('map'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1.5 text-slate-200 hover:text-teal-400"
          >
            {language === 'ta' ? 'திருச்சி வரைபடம்' : 'Trichy Map'}
          </button>
          <button
            onClick={() => { setCurrentTab('officer'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1.5 text-slate-200 hover:text-teal-400"
          >
            {t.navOfficerWorkspace}
          </button>
          <button
            onClick={() => { setCurrentTab('collector'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1.5 text-slate-200 hover:text-teal-400"
          >
            {t.navCollectorCommand}
          </button>
          <button
            onClick={() => { setCurrentTab('admin'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1.5 text-slate-200 hover:text-teal-400"
          >
            {t.navAdmin}
          </button>
        </div>
      )}

      {/* Role Demonstration Switcher Strip (Testing & Multi-Role Governance in Tiruchirappalli) */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 py-1.5 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto py-0.5">
          <span className="text-slate-400 font-medium">
            {language === 'ta' ? 'செயல்முறைப் பங்கு:' : 'Active Role:'}
          </span>
          <div className="flex items-center gap-1">
            {roles.map(r => {
              const isActive = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => handleRoleChange(r.role)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/40'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {language === 'ta' ? r.labelTa : r.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 whitespace-nowrap ml-auto">
          <span className="text-slate-400">
            {currentUser.fullName} · {currentUser.designation || currentUser.role.toUpperCase()}
          </span>
          {currentUser.role === 'operator' && (
            <button
              onClick={onOpenOfflineModal}
              className="text-amber-400 hover:underline font-semibold"
            >
              + {language === 'ta' ? 'முகாம் மனு பதிவு' : 'Camp Entry'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
