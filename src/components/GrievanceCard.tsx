import React from 'react';
import { 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Grievance } from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';

interface GrievanceCardProps {
  grievance: Grievance;
  language: Language;
  onSelect: (grievance: Grievance) => void;
}

export const GrievanceCard: React.FC<GrievanceCardProps> = ({
  grievance,
  language,
  onSelect
}) => {
  const t = translations[language];

  // Calculate SLA days left or overdue
  const targetDate = new Date(grievance.targetResolutionDate);
  const now = new Date();
  const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0 && grievance.status !== 'Closed';

  const categoryName = (t as any)[`cat_${grievance.category}`] || grievance.category;
  const leadDept = store.departments.find(d => d.id === grievance.leadDepartmentId);
  const deptName = language === 'ta' ? (leadDept?.nameTa || leadDept?.nameEn) : leadDept?.nameEn;

  // Status color styles (Clean typography & icon, avoiding candy pill badges)
  const getStatusBadge = () => {
    switch (grievance.status) {
      case 'Closed':
        return (
          <span className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.statusClosed}</span>
          </span>
        );
      case 'Resolution Submitted':
        return (
          <span className="flex items-center gap-1 text-teal-700 font-semibold text-xs">
            <FileText className="w-3.5 h-3.5" />
            <span>{t.statusResolutionSubmitted}</span>
          </span>
        );
      case 'Escalated':
        return (
          <span className="flex items-center gap-1 text-rose-700 font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.statusEscalated}</span>
          </span>
        );
      case 'Reopened':
        return (
          <span className="flex items-center gap-1 text-amber-700 font-semibold text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t.statusReopened}</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="flex items-center gap-1 text-sky-700 font-semibold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.statusInProgress}</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-slate-700 font-semibold text-xs">
            <span>{(t as any)[`status${grievance.status.replace(/\s+/g, '')}`] || grievance.status}</span>
          </span>
        );
    }
  };

  return (
    <div 
      onClick={() => onSelect(grievance)}
      className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer group text-left"
    >
      {/* Top Metadata Line: Zero-Pill Unboxed Typography */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-slate-800 tracking-tight">
            {grievance.referenceNumber}
          </span>
          <span aria-hidden="true">·</span>
          <span>{categoryName}</span>
          {grievance.isOfflineEntry && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 font-medium">
                {language === 'ta' ? 'முகாம் மனு' : 'Camp Entry'}
              </span>
            </>
          )}
        </div>
        <div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Primary Title */}
      <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug mb-2">
        {language === 'ta' && grievance.titleTa ? grievance.titleTa : grievance.title}
      </h3>

      {/* Description Snippet */}
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
        {language === 'ta' && grievance.descriptionTa ? grievance.descriptionTa : grievance.description}
      </p>

      {/* Bottom Metadata & Location */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 truncate max-w-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{grievance.locality}, {grievance.taluk}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0 tabular-nums">
          {grievance.status !== 'Closed' && (
            <span className={`text-[11px] font-medium ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
              {isOverdue 
                ? `${Math.abs(diffDays)} ${t.overdueBy}` 
                : `${diffDays} ${t.daysLeft}`}
            </span>
          )}
          <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
};
