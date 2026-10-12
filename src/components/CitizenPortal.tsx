import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileCheck, 
  ShieldCheck, 
  ChevronRight, 
  Star,
  RefreshCw,
  Send,
  Eye,
  Info
} from 'lucide-react';
import { Grievance, GrievanceCategory, PriorityLevel } from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';
import { GrievanceCard } from './GrievanceCard';
import civicHeroImg from '../assets/images/civic_hero_district_1791742992671.jpg';

interface CitizenPortalProps {
  language: Language;
  onOpenReport: () => void;
  onSelectGrievance: (grievance: Grievance) => void;
  initialTrackRef?: string;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  language,
  onOpenReport,
  onSelectGrievance,
  initialTrackRef
}) => {
  const t = translations[language];
  const [trackInput, setTrackInput] = useState(initialTrackRef || '');
  const [searchedGrievance, setSearchedGrievance] = useState<Grievance | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const currentUser = store.currentUser;
  const grievances = store.grievances;

  // Track search action
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    const found = grievances.find(
      g => g.referenceNumber.toLowerCase() === trackInput.trim().toLowerCase()
    );
    setSearchedGrievance(found || null);
    setHasSearched(true);
  };

  const categories: { id: GrievanceCategory; label: string }[] = [
    { id: 'roads', label: t.cat_roads },
    { id: 'drinking_water', label: t.cat_drinking_water },
    { id: 'sanitation', label: t.cat_sanitation },
    { id: 'drainage', label: t.cat_drainage },
    { id: 'streetlights', label: t.cat_streetlights },
    { id: 'waste_management', label: t.cat_waste_management },
    { id: 'public_infrastructure', label: t.cat_public_infrastructure },
    { id: 'revenue_records', label: t.cat_revenue_records },
    { id: 'electricity', label: t.cat_electricity },
    { id: 'other', label: t.cat_other }
  ];

  const filteredGrievances = grievances.filter(g => {
    if (activeCategoryFilter !== 'all' && g.category !== activeCategoryFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-12">
      {/* Hero Section with High-Fidelity Civic Visual Asset */}
      <section className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[380px]">
          {/* Left Column: Mission, Search, and Action */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6 z-10">
            <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold tracking-wider uppercase">
              <span>{language === 'ta' ? 'திருச்சிராப்பள்ளி மாவட்டம் & மாநகராட்சி' : 'Tiruchirappalli District & City Corporation'}</span>
              <span aria-hidden="true">·</span>
              <span>{language === 'ta' ? 'பொது மக்கள் குறைதீர்ப்பு தளம்' : 'Civic Accountability Platform'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight text-balance">
              {language === 'ta' 
                ? 'உங்கள் பகுதியின் பிரச்சனைகளை நேரடியாக மாவட்ட நிர்வாகத்திடம் கொண்டு செல்லுங்கள்'
                : 'Accountable Public Grievance Resolution for Every Citizen'}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              {language === 'ta'
                ? 'சாலை பழுது, குடிநீர் தட்டுப்பாடு, தெருவிளக்குகள் மற்றும் சுகாதாரம் குறித்த உங்கள் குறைகளை பதிவு செய்து, அதிகாரிகள் மேற்கொள்ளும் கள ஆய்வு மற்றும் புகைப்பட ஆதாரங்களுடன் கண்காணிக்கவும்.'
                : 'Report civic issues including roads, drinking water, streetlights, and sanitation. Track verified on-ground work orders with photographic proof and supervisory accountability.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenReport}
                className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.navNewGrievance}</span>
              </button>

              <a
                href="#track-section"
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {t.navTrack}
              </a>
            </div>
          </div>

          {/* Right Column: Generated Civic Architecture Photography */}
          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
            <img
              src={civicHeroImg}
              alt="Tiruchirappalli District Civic Administration and Infrastructure"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* Track Grievance Interactive Strip */}
      <section id="track-section" className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-semibold uppercase tracking-wider">
            <Search className="w-3.5 h-3.5" />
            <span>{t.trackHeading}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {language === 'ta' ? 'மனுவின் தற்போதைய நிலையை அறிய' : 'Track Your Complaint Status'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {t.trackSubhead}
          </p>

          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-lg mx-auto pt-2">
            <div className="relative w-full">
              <input
                type="text"
                value={trackInput}
                onChange={e => setTrackInput(e.target.value)}
                placeholder={t.enterRefPlaceholder}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0"
            >
              {t.trackSearchBtn}
            </button>
          </form>

          {/* Search Result Box */}
          {hasSearched && (
            <div className="mt-6 text-left pt-4 border-t border-slate-100">
              {searchedGrievance ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="text-xs text-slate-500">
                      <span className="font-mono font-bold text-slate-900">{searchedGrievance.referenceNumber}</span>
                      <span className="mx-2">·</span>
                      <span>{searchedGrievance.locality}, {searchedGrievance.taluk}</span>
                    </div>
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      {searchedGrievance.status}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {language === 'ta' && searchedGrievance.titleTa ? searchedGrievance.titleTa : searchedGrievance.title}
                  </h3>

                  <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                    {language === 'ta' && searchedGrievance.descriptionTa ? searchedGrievance.descriptionTa : searchedGrievance.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-500">
                      Target SLA: {new Date(searchedGrievance.targetResolutionDate).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onSelectGrievance(searchedGrievance)}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                    >
                      <span>{language === 'ta' ? 'முழு விவரம் & சான்றுகள்' : 'View Full Details & Evidence'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center text-xs text-amber-800">
                  {t.grievanceNotFound}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Complaint Categories Browser */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {language === 'ta' ? 'மனு வகைப்பாடுகள்' : 'Complaint Categories'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'ta' ? 'துறைவாரியான பொதுப் பிரச்சனைகளைத் தேர்ந்தெடுக்கவும்' : 'Filter registered complaints by department service area'}
            </p>
          </div>

          <button
            onClick={onOpenReport}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>{language === 'ta' ? '+ புதிய மனு பதிவு' : '+ File New Complaint'}</span>
          </button>
        </div>

        {/* Category Filter Buttons (Interactive Segmented Bar) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeCategoryFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.filterAll} ({grievances.length})
          </button>

          {categories.map(cat => {
            const count = grievances.filter(g => g.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeCategoryFilter === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {/* Complaints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredGrievances.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl">
              {t.noRecords}
            </div>
          ) : (
            filteredGrievances.map(grievance => (
              <GrievanceCard
                key={grievance.id}
                grievance={grievance}
                language={language}
                onSelect={onSelectGrievance}
              />
            ))
          )}
        </div>
      </section>

      {/* Citizen Trust & Accountability Workflow Callout */}
      <section className="bg-slate-100/70 border border-slate-200 rounded-xl p-6 sm:p-8">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          {language === 'ta' ? 'PODHUNALAM வெளிப்படைத்தன்மை செயல்முறை' : 'Evidence-Based Verification Guarantee'}
        </h3>
        <p className="text-xs text-slate-600 mb-6 max-w-2xl">
          {language === 'ta'
            ? 'அலுவலர் நிலைய மாற்றத்தால் மட்டும் எந்த மனுவும் மூடப்படாது. களப்பணி புகைப்படங்கள், அரசாணை அல்லது பணி நிறைவு ஆவணங்களை தாக்கல் செய்து, தாலுகா மற்றும் கோட்ட அளவிலான உயர் அதிகாரிகள் சரிபார்த்த பிறகே மனு நிறைவு செய்யப்படும்.'
            : 'No grievance is automatically marked as resolved solely on officer assertion. Work order vouchers, before-and-after photographic evidence, and supervisory administrative inspection are mandatory prior to official closure.'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-lg border border-slate-200/80">
            <span className="font-mono text-slate-400 block mb-1">01</span>
            <strong className="block text-slate-900 mb-1">{t.lifecycleReport}</strong>
            <span className="text-slate-500 text-[11px]">Instant unique reference tracking number</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200/80">
            <span className="font-mono text-slate-400 block mb-1">02</span>
            <strong className="block text-slate-900 mb-1">{t.lifecycleAssign}</strong>
            <span className="text-slate-500 text-[11px]">Direct department jurisdiction routing</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200/80">
            <span className="font-mono text-slate-400 block mb-1">03</span>
            <strong className="block text-slate-900 mb-1">{t.lifecycleResolve}</strong>
            <span className="text-slate-500 text-[11px]">Field work & timestamped photo evidence</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200/80">
            <span className="font-mono text-slate-400 block mb-1">04</span>
            <strong className="block text-slate-900 mb-1">{t.lifecycleVerify}</strong>
            <span className="text-slate-500 text-[11px]">RDO/DRO supervisory audit & citizen review</span>
          </div>
        </div>
      </section>
    </div>
  );
};
