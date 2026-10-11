import React, { useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  Send, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Grievance, Department } from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';

interface InterdepartmentalWorkspaceProps {
  grievance: Grievance;
  language: Language;
}

export const InterdepartmentalWorkspace: React.FC<InterdepartmentalWorkspaceProps> = ({
  grievance,
  language
}) => {
  const t = translations[language];
  const departments = store.departments;
  const leadDept = departments.find(d => d.id === grievance.leadDepartmentId);
  const collaborations = store.grievanceDepts.filter(gd => gd.grievanceId === grievance.id);

  const [selectedDeptId, setSelectedDeptId] = useState(departments[1]?.id || '');
  const [taskDescription, setTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCollaboration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDescription.trim()) return;
    store.addDepartmentCollaboration(grievance.id, selectedDeptId, taskDescription, dueDate);
    setTaskDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{t.interdeptTitle}</h3>
          <p className="text-[11px] text-slate-500">Cross-departmental task allocation and joint accountability</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{t.addCooperatingDept}</span>
        </button>
      </div>

      {/* Lead Department Display */}
      <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider block">
            {t.leadDept}
          </span>
          <strong className="text-slate-900 text-xs">
            {language === 'ta' && leadDept?.nameTa ? leadDept.nameTa : leadDept?.nameEn}
          </strong>
        </div>
        <span className="text-xs font-semibold text-teal-900 font-mono">Lead Accountable</span>
      </div>

      {/* Add Collaboration Form */}
      {showAddForm && (
        <form onSubmit={handleAddCollaboration} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <span className="font-semibold text-slate-800 block text-xs">
            Assign Supporting Department Task
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Supporting Department</label>
              <select
                value={selectedDeptId}
                onChange={e => setSelectedDeptId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800"
              >
                {departments.filter(d => d.id !== grievance.leadDepartmentId).map(d => (
                  <option key={d.id} value={d.id}>
                    {language === 'ta' ? d.nameTa : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Target Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-600 mb-1">{t.taskDesc}</label>
            <input
              type="text"
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              placeholder="e.g., TANGEDCO must disconnect overhead cable before Highways asphalt paving commences..."
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-slate-600 hover:text-slate-800"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 bg-slate-900 text-white font-semibold rounded"
            >
              Confirm Joint Task
            </button>
          </div>
        </form>
      )}

      {/* Collaborations List */}
      <div className="space-y-2">
        <span className="font-semibold text-slate-700 block text-[11px]">
          {t.cooperatingDepts} ({collaborations.length})
        </span>

        {collaborations.length === 0 ? (
          <div className="p-4 text-center text-slate-400 bg-slate-50 rounded border border-slate-200">
            No assisting departments assigned yet. Lead department is currently managing resolution.
          </div>
        ) : (
          collaborations.map(collab => {
            const coDept = departments.find(d => d.id === collab.departmentId);
            return (
              <div key={collab.id} className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900">{coDept?.nameEn}</strong>
                  <span className="text-[11px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                    {collab.status}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{collab.taskDescription}</p>
                {collab.dueDate && (
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    Target: {new Date(collab.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
