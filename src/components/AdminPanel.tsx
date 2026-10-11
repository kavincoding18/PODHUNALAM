import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Clock, 
  FileText, 
  RotateCcw, 
  PlusCircle, 
  CheckCircle2,
  Database
} from 'lucide-react';
import { Department, UserProfile, AuditLog } from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';

interface AdminPanelProps {
  language: Language;
  onOpenSupabaseModal: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  language,
  onOpenSupabaseModal
}) => {
  const t = translations[language];
  const departments = store.departments;
  const users = store.users;
  const auditLogs = store.auditLogs;

  const [activeTab, setActiveTab] = useState<'departments' | 'officers' | 'sla' | 'audit'>('departments');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Reset all sample records back to initial prototype seed state?')) {
      store.resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Admin Header */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>District System Administration & Security</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            {t.navAdmin}
          </h1>

          <p className="text-slate-300 text-xs max-w-xl">
            Configure department SLA targets, administrative hierarchy mappings, authorized officer roles, and inspect tamper-evident audit history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenSupabaseModal}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Supabase Sync</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetSuccess ? 'Reset Complete!' : 'Reset Demo Records'}</span>
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-6 font-semibold">
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-1 transition-colors ${
            activeTab === 'departments' ? 'border-b-2 border-teal-600 text-teal-800' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Departments & SLAs ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('officers')}
          className={`pb-1 transition-colors ${
            activeTab === 'officers' ? 'border-b-2 border-teal-600 text-teal-800' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Officer Directory & Roles ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-1 transition-colors ${
            activeTab === 'audit' ? 'border-b-2 border-teal-600 text-teal-800' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Security Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* Tab Content: Departments */}
      {activeTab === 'departments' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Department Name</th>
                  <th className="px-4 py-3">Designated Lead Title</th>
                  <th className="px-4 py-3 text-right">Target SLA (Days)</th>
                  <th className="px-4 py-3">Official Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{d.code}</td>
                    <td className="px-4 py-3">
                      <strong className="block text-slate-900">{d.nameEn}</strong>
                      <span className="text-[11px] text-slate-500">{d.nameTa}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{d.leadOfficerTitle}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {d.targetDaysDefault} days
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{d.contactEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Officers */}
      {activeTab === 'officers' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Official Name</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Official Email</th>
                  <th className="px-4 py-3">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 uppercase">{u.role}</td>
                    <td className="px-4 py-3">
                      <strong className="block text-slate-900">{u.fullName}</strong>
                      <span className="text-[11px] text-slate-500">{u.fullNameTa}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{u.designation || 'General User'}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{u.email}</td>
                    <td className="px-4 py-3 text-slate-700 font-mono text-[11px]">{u.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-slate-600">
            Immutable system audit logs recorded for every status change, evidence upload, and supervisory order.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor & Role</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap tabular-nums">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {log.performedBy} ({log.userRole.toUpperCase()})
                    </td>
                    <td className="px-4 py-3 text-slate-500">{log.entityType}</td>
                    <td className="px-4 py-3 text-slate-600 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
