import React from 'react';
import { Language, translations } from '../i18n/translations';

interface FooterProps {
  language: Language;
  onOpenSupabaseModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onOpenSupabaseModal }) => {
  const t = translations[language];

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Motto */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">PODHUNALAM</span>
              <span className="text-sm font-semibold text-teal-400">பொதுநலம்</span>
            </div>
            <p className="text-slate-300 font-medium text-xs leading-relaxed">
              {t.fullTitle}
            </p>
            <p className="text-slate-400 text-xs italic">
              “{t.motto}”
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
              {t.prototypeDisclaimer}
            </p>
          </div>

          {/* District Administrative Chain */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase">
              {language === 'ta' ? 'நிர்வாகப் படிநிலை' : 'Administrative Chain'}
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>{language === 'ta' ? 'வட்டார நிர்வாக அலுவலர் (AO / வட்டாட்சியர்)' : 'Administrative Officer (AO / Tahsildar)'}</li>
              <li>{language === 'ta' ? 'வருவாய் கோட்ட அலுவலர் (RDO)' : 'Revenue Divisional Officer (RDO)'}</li>
              <li>{language === 'ta' ? 'மாவட்ட வருவாய் அலுவலர் (DRO)' : 'District Revenue Officer (DRO)'}</li>
              <li>{language === 'ta' ? 'மாவட்ட ஆட்சித் தலைவர் (District Collector)' : 'District Collector & Magistrate'}</li>
            </ul>
          </div>

          {/* Quick Technical & Governance Links */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase">
              {language === 'ta' ? 'தொழில்நுட்பம் & பாதுகாப்பு' : 'System & Security'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={onOpenSupabaseModal} className="hover:text-teal-400 transition-colors">
                  {language === 'ta' ? 'Supabase தரவுத்தள இணைப்பு' : 'Supabase PostgreSQL Connection'}
                </button>
              </li>
              <li>
                <span>{language === 'ta' ? 'தீர்வுச் சான்றுகள் சரிபார்ப்பு' : 'Evidence-Based Resolution (SLA)'}</span>
              </li>
              <li>
                <span>{language === 'ta' ? 'அதிகாரப்பூர்வ தணிக்கைப் பதிவு' : 'Immutable Audit Trails & RLS'}</span>
              </li>
              <li>
                <span>{language === 'ta' ? 'தனியுரிமை & தரவுப் பாதுகாப்பு' : 'Citizen Privacy & Data Consent'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 PODHUNALAM (பொதுநலம்) · Civic Technology Platform
          </div>
          <div className="flex items-center gap-4">
            <span>Tiruchirappalli District & City Corporation Model</span>
            <span aria-hidden="true">·</span>
            <span>WCAG AA Accessible</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
