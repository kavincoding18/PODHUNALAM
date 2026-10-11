import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  Building2, 
  TrendingUp, 
  Calendar, 
  Filter, 
  ArrowUpRight,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';
import { Grievance, Department } from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';

interface CollectorDashboardProps {
  language: Language;
  onSelectGrievance: (grievance: Grievance) => void;
}

export const CollectorDashboard: React.FC<CollectorDashboardProps> = ({
  language,
  onSelectGrievance
}) => {
  const t = translations[language];
  const grievances = store.grievances;
  const departments = store.departments;

  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterTaluk, setFilterTaluk] = useState<string>('all');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Core Metrics
  const total = grievances.length;
  const closed = grievances.filter(g => g.status === 'Closed').length;
  const inProgress = grievances.filter(g => g.status === 'In Progress' || g.status === 'Under Review' || g.status === 'Assigned').length;
  const resolutionSubmitted = grievances.filter(g => g.status === 'Resolution Submitted').length;
  const escalated = grievances.filter(g => g.isEscalated).length;
  const reopened = grievances.filter(g => g.isReopened).length;
  
  const overdue = grievances.filter(g => {
    return new Date(g.targetResolutionDate).getTime() < Date.now() && g.status !== 'Closed';
  }).length;

  const efficiencyRate = total > 0 ? Math.round((closed / total) * 100) : 0;

  // Department Workload Distribution
  const deptStats = departments.map(d => {
    const list = grievances.filter(g => g.leadDepartmentId === d.id);
    const deptClosed = list.filter(g => g.status === 'Closed').length;
    const deptPending = list.filter(g => g.status !== 'Closed').length;
    return {
      id: d.id,
      name: language === 'ta' ? d.nameTa : d.nameEn,
      code: d.code,
      total: list.length,
      pending: deptPending,
      closed: deptClosed
    };
  });

  // Category Distribution
  const categoriesList = [
    { id: 'roads', name: t.cat_roads },
    { id: 'drinking_water', name: t.cat_drinking_water },
    { id: 'sanitation', name: t.cat_sanitation },
    { id: 'drainage', name: t.cat_drainage },
    { id: 'streetlights', name: t.cat_streetlights },
    { id: 'waste_management', name: t.cat_waste_management },
    { id: 'revenue_records', name: t.cat_revenue_records }
  ];

  const categoryStats = categoriesList.map(c => {
    const count = grievances.filter(g => g.category === c.id).length;
    return {
      ...c,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0
    };
  });

  // Taluk & Corporation Zone Resolution Breakdown
  const taluks = [
    'Tiruchirappalli West',
    'Tiruchirappalli East',
    'Srirangam',
    'Ponmalai (Zone 3)',
    'Thiruverumbur',
    'Manapparai',
    'Lalgudi',
    'Musiri'
  ];
  const talukStats = taluks.map(tlk => {
    const list = grievances.filter(g => g.taluk === tlk || g.locality.toLowerCase().includes(tlk.toLowerCase()));
    const tlkClosed = list.filter(g => g.status === 'Closed').length;
    const tlkPending = list.filter(g => g.status !== 'Closed').length;
    return {
      taluk: tlk,
      total: list.length,
      pending: tlkPending,
      closed: tlkClosed
    };
  });

  // Handle CSV Export
  const handleExportCsv = () => {
    const csvContent = store.exportGrievancesCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PODHUNALAM_Tiruchirappalli_District_Grievance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Executive Command Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold tracking-wider uppercase">
            <span>Tiruchirappalli District Collectorate & Corporation</span>
            <span aria-hidden="true">·</span>
            <span>Apex Oversight</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            {t.collectorTitle}
          </h1>

          <p className="text-slate-300 text-xs max-w-xl">
            {language === 'ta' 
              ? 'திரு பிரதீக் தயாள், இ.ஆ.ப., மாவட்ட ஆட்சித் தலைவர் மற்றும் நடுவர் தலைமையில் திருச்சிராப்பள்ளி மாவட்டம் மற்றும் மாநகராட்சி குறைதீர்ப்பு நிர்வாகம்.'
              : 'Governed by Mr. Pratik Tayal IAS, District Collector & District Magistrate, ensuring transparent resolution across Tiruchirappalli City Corporation and district boundaries.'}
          </p>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-teal-400">Collector:</span>
            <span className="text-white font-medium">Thiru Pratik Tayal, IAS (திரு பிரதீக் தயாள், இ.ஆ.ப.)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{downloadSuccess ? 'Report Downloaded!' : t.exportCsvBtn}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
        {/* Total */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px] mb-1">{t.statTotal}</span>
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{total}</span>
          <span className="text-[10px] text-slate-400 block mt-1">100% accounted</span>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px] mb-1">{t.statPending}</span>
          <span className="text-2xl font-bold font-mono text-sky-700 tabular-nums">{inProgress}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Under investigation</span>
        </div>

        {/* Awaiting Review */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px] mb-1">Awaiting Review</span>
          <span className="text-2xl font-bold font-mono text-teal-700 tabular-nums">{resolutionSubmitted}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Evidence submitted</span>
        </div>

        {/* Overdue */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px] mb-1">{t.statOverdue}</span>
          <span className="text-2xl font-bold font-mono text-rose-700 tabular-nums">{overdue}</span>
          <span className="text-[10px] text-rose-600 block mt-1">Lapsed SLA target</span>
        </div>

        {/* Escalated */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px] mb-1">{t.statEscalated}</span>
          <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">{escalated}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Division escalations</span>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <span className="text-slate-500 block text-[11px] mb-1">{t.statResolved}</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">{closed}</span>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">{efficiencyRate}% verified</span>
        </div>
      </div>

      {/* Analytics Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* Department Workload Bar Chart (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t.departmentWorkload}</h2>
              <p className="text-[11px] text-slate-500">Pending caseload versus verified closures</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 pt-2">
            {deptStats.map(ds => {
              const pendingPct = ds.total > 0 ? (ds.pending / total) * 100 : 0;
              const closedPct = ds.total > 0 ? (ds.closed / total) * 100 : 0;
              return (
                <div key={ds.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{ds.name}</span>
                    <span className="text-slate-500 tabular-nums font-mono">
                      {ds.pending} pending / {ds.total} total
                    </span>
                  </div>
                  
                  {/* Visual Stacked Metric Bar */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${(ds.closed / (ds.total || 1)) * 100}%` }}
                      className="bg-emerald-500 h-full transition-all"
                      title={`${ds.closed} Closed`}
                    />
                    <div 
                      style={{ width: `${(ds.pending / (ds.total || 1)) * 100}%` }}
                      className="bg-sky-500 h-full transition-all"
                      title={`${ds.pending} Pending`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t.categoryDistribution}</h2>
              <p className="text-[11px] text-slate-500">Citizen petition share by civic sector</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.map(cs => (
              <div key={cs.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-700 truncate max-w-[180px]">{cs.name}</span>
                <div className="flex items-center gap-3 shrink-0 tabular-nums">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${cs.pct}%` }} 
                      className="bg-teal-600 h-full rounded-full" 
                    />
                  </div>
                  <span className="font-mono text-slate-800 font-semibold w-8 text-right">{cs.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Taluk-wise Administrative Performance Ranking */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t.talukPerformance}</h2>
            <p className="text-[11px] text-slate-500">Taluk administration resolution efficiency rankings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 text-xs">
          {talukStats.map(ts => {
            const rate = ts.total > 0 ? Math.round((ts.closed / ts.total) * 100) : 0;
            return (
              <div key={ts.taluk} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">{ts.taluk} Taluk</strong>
                  <span className="font-mono text-slate-700 font-bold">{rate}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Total: {ts.total}</span>
                  <span>Pending: {ts.pending}</span>
                  <span>Closed: {ts.closed}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div style={{ width: `${rate}%` }} className="bg-teal-600 h-full" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Priority Overdue & Escalated Cases Requiring Collector Intervention */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {language === 'ta' ? 'ஆட்சியர் நேரடி ஆய்வுக்குரிய வழக்குகள்' : 'Priority Grievances Requiring District Executive Review'}
            </h2>
            <p className="text-[11px] text-slate-500">Escalated complaints and SLA lapses flagged by divisional officers</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {grievances.filter(g => g.isEscalated || g.priority === 'Emergency').map(g => (
            <div 
              key={g.id} 
              onClick={() => onSelectGrievance(g)}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded cursor-pointer transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{g.referenceNumber}</span>
                  <span className="text-rose-700 font-semibold">{g.priority}</span>
                  {g.isEscalated && (
                    <span className="text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded text-[10px]">
                      Escalated
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-slate-800 line-clamp-1">{g.title}</h4>
                <p className="text-[11px] text-slate-500">{g.locality}, {g.taluk}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-slate-700">{g.status}</span>
                <button className="text-teal-700 font-semibold hover:underline">
                  Inspect →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
