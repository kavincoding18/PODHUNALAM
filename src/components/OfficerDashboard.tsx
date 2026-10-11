import React, { useState } from 'react';
import { 
  Briefcase, 
  Filter, 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Camera, 
  ShieldCheck, 
  Users, 
  ArrowUpRight,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { Grievance, GrievanceCategory, GrievanceStatus, PriorityLevel } from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';

interface OfficerDashboardProps {
  language: Language;
  onSelectGrievance: (grievance: Grievance) => void;
  onOpenEvidenceModal: (grievance: Grievance) => void;
  onOpenVerifyModal: (grievance: Grievance) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  language,
  onSelectGrievance,
  onOpenEvidenceModal,
  onOpenVerifyModal
}) => {
  const t = translations[language];
  const currentUser = store.currentUser;
  const grievances = store.grievances;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'assigned' | 'pending' | 'overdue' | 'escalated' | 'closed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTaluk, setSelectedTaluk] = useState<string>('all');

  // Role hierarchy info
  const getRoleHeader = () => {
    switch (currentUser.role) {
      case 'ao':
        return {
          title: language === 'ta' ? 'வட்டார நிர்வாக அலுவலர் பணித்தளம் (AO / வட்டாட்சியர், திருச்சி மேற்கு)' : 'Administrative Officer (AO / Tahsildar, Trichy West) Workspace',
          jurisdiction: 'Tiruchirappalli West Taluk & Corporation Wards'
        };
      case 'rdo':
        return {
          title: language === 'ta' ? 'வருவாய் கோட்ட அலுவலர் பணித்தளம் (RDO திருச்சி)' : 'Revenue Divisional Officer (RDO Trichy) Workspace',
          jurisdiction: 'Tiruchirappalli Revenue Division (Trichy West, East, Srirangam, Thiruverumbur)'
        };
      case 'dro':
        return {
          title: language === 'ta' ? 'மாவட்ட வருவாய் அலுவலர் பணித்தளம் (DRO திருச்சி)' : 'District Revenue Officer (DRO Trichy) Workspace',
          jurisdiction: 'Tiruchirappalli District-Wide Interdepartmental Coordination'
        };
      case 'collector':
        return {
          title: language === 'ta' ? 'மாவட்ட ஆட்சித் தலைவர் மேலாண்மை மையம் (திரு பிரதீக் தயாள் IAS)' : 'District Collector Command Center (Mr. Pratik Tayal IAS)',
          jurisdiction: 'Apex Executive Authority & District Collectorate, Tiruchirappalli'
        };
      default:
        return {
          title: t.officerHeading,
          jurisdiction: 'General Field Administration (Tiruchirappalli)'
        };
    }
  };

  const roleInfo = getRoleHeader();

  // Filter complaints
  const filteredGrievances = grievances.filter(g => {
    // Jurisdiction filter based on role
    if (currentUser.role === 'ao' && g.taluk !== 'Tiruchirappalli West' && g.assignedOfficerId !== currentUser.id) {
      // allow viewing all in demo, but highlights taluk
    }

    // Status / Workflow filter
    const targetDate = new Date(g.targetResolutionDate);
    const now = new Date();
    const isOverdue = targetDate.getTime() < now.getTime() && g.status !== 'Closed';

    if (selectedFilter === 'assigned' && g.assignedOfficerId !== currentUser.id) return false;
    if (selectedFilter === 'pending' && (g.status === 'Closed' || g.status === 'Resolution Submitted')) return false;
    if (selectedFilter === 'overdue' && !isOverdue) return false;
    if (selectedFilter === 'escalated' && !g.isEscalated) return false;
    if (selectedFilter === 'closed' && g.status !== 'Closed') return false;

    // Category filter
    if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;

    // Taluk filter
    if (selectedTaluk !== 'all' && g.taluk !== selectedTaluk) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = g.referenceNumber.toLowerCase().includes(q);
      const matchTitle = g.title.toLowerCase().includes(q) || (g.titleTa && g.titleTa.toLowerCase().includes(q));
      const matchLoc = g.locality.toLowerCase().includes(q);
      if (!matchRef && !matchTitle && !matchLoc) return false;
    }

    return true;
  });

  // Overdue count
  const overdueCount = grievances.filter(g => {
    return new Date(g.targetResolutionDate).getTime() < Date.now() && g.status !== 'Closed';
  }).length;

  const escalatedCount = grievances.filter(g => g.isEscalated).length;
  const resolutionSubmittedCount = grievances.filter(g => g.status === 'Resolution Submitted').length;

  return (
    <div className="space-y-6">
      {/* Officer Header Card */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold tracking-wider uppercase">
            <Briefcase className="w-4 h-4" />
            <span>{roleInfo.jurisdiction}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            {roleInfo.title}
          </h1>

          <p className="text-slate-300 text-xs">
            Officer: <span className="text-white font-semibold">{currentUser.fullName}</span> · {currentUser.designation || currentUser.role.toUpperCase()}
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0 text-xs">
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-lg text-center">
            <span className="block text-slate-400 text-[11px] mb-0.5">Active Queue</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums">
              {grievances.filter(g => g.status !== 'Closed').length}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-lg text-center">
            <span className="block text-amber-400 text-[11px] mb-0.5">Awaiting Review</span>
            <span className="text-lg font-bold font-mono text-amber-300 tabular-nums">
              {resolutionSubmittedCount}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-lg text-center">
            <span className="block text-rose-400 text-[11px] mb-0.5">Overdue SLA</span>
            <span className="text-lg font-bold font-mono text-rose-300 tabular-nums">
              {overdueCount}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Filter Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Row 1: Workflow Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.filterAll} ({grievances.length})
          </button>

          <button
            onClick={() => setSelectedFilter('assigned')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedFilter === 'assigned'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.filterAssignedToMe}
          </button>

          <button
            onClick={() => setSelectedFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedFilter === 'pending'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.filterPending}
          </button>

          <button
            onClick={() => setSelectedFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedFilter === 'overdue'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            {t.filterOverdue} ({overdueCount})
          </button>

          <button
            onClick={() => setSelectedFilter('escalated')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedFilter === 'escalated'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            {t.filterEscalated} ({escalatedCount})
          </button>

          <button
            onClick={() => setSelectedFilter('closed')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedFilter === 'closed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.filterClosed}
          </button>
        </div>

        {/* Row 2: Search, Category, and Taluk Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search reference #, title, locality..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900"
            >
              <option value="all">{t.allCategories}</option>
              <option value="roads">{t.cat_roads}</option>
              <option value="drinking_water">{t.cat_drinking_water}</option>
              <option value="sanitation">{t.cat_sanitation}</option>
              <option value="drainage">{t.cat_drainage}</option>
              <option value="streetlights">{t.cat_streetlights}</option>
              <option value="waste_management">{t.cat_waste_management}</option>
              <option value="revenue_records">{t.cat_revenue_records}</option>
            </select>
          </div>

          <div>
            <select
              value={selectedTaluk}
              onChange={e => setSelectedTaluk(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900"
            >
              <option value="all">All Taluks & Zones (Tiruchirappalli)</option>
              <option value="Tiruchirappalli West">Tiruchirappalli West (K.Abishekapuram Zone)</option>
              <option value="Tiruchirappalli East">Tiruchirappalli East (Ariyamangalam & Fort Zone)</option>
              <option value="Srirangam">Srirangam (Zone 1)</option>
              <option value="Ponmalai (Zone 3)">Ponmalai / Golden Rock (Zone 3)</option>
              <option value="Thiruverumbur">Thiruverumbur Taluk</option>
              <option value="Manapparai">Manapparai Taluk</option>
              <option value="Lalgudi">Lalgudi Taluk</option>
              <option value="Musiri">Musiri Taluk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grievances High-Density Operational Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="px-4 py-3 whitespace-nowrap">Reference #</th>
                <th className="px-4 py-3">Subject & Locality</th>
                <th className="px-4 py-3 whitespace-nowrap">Category</th>
                <th className="px-4 py-3 whitespace-nowrap">Priority</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Target SLA</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrievances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    {t.noRecords}
                  </td>
                </tr>
              ) : (
                filteredGrievances.map(g => {
                  const targetDate = new Date(g.targetResolutionDate);
                  const now = new Date();
                  const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isOverdue = diffDays < 0 && g.status !== 'Closed';

                  return (
                    <tr 
                      key={g.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => onSelectGrievance(g)}
                    >
                      {/* Ref Number */}
                      <td className="px-4 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {g.referenceNumber}
                        {g.isOfflineEntry && (
                          <span className="block text-[10px] text-amber-700 font-sans">Camp Entry</span>
                        )}
                      </td>

                      {/* Title & Locality */}
                      <td className="px-4 py-3 max-w-sm">
                        <strong className="block text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1 font-semibold">
                          {language === 'ta' && g.titleTa ? g.titleTa : g.title}
                        </strong>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{g.locality}, {g.taluk}</span>
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {(t as any)[`cat_${g.category}`] || g.category}
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3 whitespace-nowrap font-medium">
                        <span className={
                          g.priority === 'Emergency' ? 'text-rose-700 font-bold' :
                          g.priority === 'High' ? 'text-amber-700 font-semibold' : 'text-slate-700'
                        }>
                          {g.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {g.status}
                        </span>
                      </td>

                      {/* Target SLA */}
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                        {g.status === 'Closed' ? (
                          <span className="text-emerald-700 font-semibold text-[11px]">Closed</span>
                        ) : (
                          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {isOverdue ? `${Math.abs(diffDays)}d overdue` : `${diffDays}d left`}
                          </span>
                        )}
                      </td>

                      {/* Quick Action Button */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectGrievance(g);
                          }}
                          className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded font-semibold text-xs transition-colors"
                        >
                          View & Act →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
