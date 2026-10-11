import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Send, 
  ArrowUpRight, 
  ShieldCheck, 
  Star, 
  Camera,
  RotateCcw,
  MessageSquare,
  Lock,
  Globe
} from 'lucide-react';
import { 
  Grievance, 
  GrievanceStatus, 
  UserRole 
} from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';

interface GrievanceDetailModalProps {
  grievance: Grievance | null;
  onClose: () => void;
  language: Language;
  onOpenEvidenceModal: (grievance: Grievance) => void;
  onOpenVerifyModal: (grievance: Grievance) => void;
}

export const GrievanceDetailModal: React.FC<GrievanceDetailModalProps> = ({
  grievance,
  onClose,
  language,
  onOpenEvidenceModal,
  onOpenVerifyModal
}) => {
  if (!grievance) return null;

  const t = translations[language];
  const currentUser = store.currentUser;
  const isOfficer = ['ao', 'rdo', 'dro', 'collector', 'admin'].includes(currentUser.role);
  const isSupervisor = ['rdo', 'dro', 'collector'].includes(currentUser.role);

  // States for interactive actions
  const [activeTab, setActiveTab] = useState<'timeline' | 'coordination' | 'evidence' | 'comments'>('timeline');
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(isOfficer);
  const [statusChangeValue, setStatusChangeValue] = useState<GrievanceStatus>(grievance.status);
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Reopen & Feedback state
  const [showReopen, setShowReopen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(grievance.satisfactionRating || 5);
  const [feedbackComment, setFeedbackComment] = useState(grievance.feedbackComment || '');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  // Escalation state
  const [showEscalate, setShowEscalate] = useState(false);
  const [escalateRole, setEscalateRole] = useState<UserRole>('rdo');
  const [escalateReason, setEscalateReason] = useState('');

  // Derived records
  const statusHistory = store.statusHistory.filter(sh => sh.grievanceId === grievance.id);
  const evidenceList = store.evidence.filter(ev => ev.grievanceId === grievance.id);
  const verifications = store.verifications.filter(v => v.grievanceId === grievance.id);
  const comments = store.comments.filter(c => {
    if (c.grievanceId !== grievance.id) return false;
    // Citizens cannot see internal officer notes
    if (!isOfficer && c.isInternal) return false;
    return true;
  });
  const leadDept = store.departments.find(d => d.id === grievance.leadDepartmentId);

  // SLA calculation
  const targetDate = new Date(grievance.targetResolutionDate);
  const now = new Date();
  const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0 && grievance.status !== 'Closed';

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError('');
    if (!statusChangeReason.trim()) {
      setStatusError(language === 'ta' ? 'காரணத்தை உள்ளிடவும்.' : 'Please provide a valid reason for status change.');
      return;
    }

    try {
      await store.transitionStatus(grievance.id, statusChangeValue, statusChangeReason);
      setShowStatusChange(false);
      setStatusChangeReason('');
    } catch (err: any) {
      setStatusError(err.message || 'Status transition error');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    store.addComment(grievance.id, newComment, isInternalComment);
    setNewComment('');
  };

  const handleEscalate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateReason.trim()) return;
    store.escalateGrievance(grievance.id, escalateRole, escalateReason);
    setShowEscalate(false);
    setEscalateReason('');
  };

  const handleReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    store.reopenGrievance(grievance.id, reopenReason);
    setShowReopen(false);
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    store.submitFeedback(grievance.id, feedbackRating, feedbackComment);
    setFeedbackSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl my-6 overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-teal-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
              {grievance.referenceNumber}
            </span>
            <span className="text-xs text-slate-400">
              {language === 'ta' && leadDept?.nameTa ? leadDept.nameTa : leadDept?.nameEn}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
              {grievance.status}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Main Title & Description */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {language === 'ta' && grievance.titleTa ? grievance.titleTa : grievance.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{grievance.locality}, {grievance.taluk}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(grievance.createdAt).toLocaleDateString()}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-700">
                Priority: {grievance.priority}
              </span>
              {grievance.status !== 'Closed' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className={`font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                    SLA: {isOverdue ? `${Math.abs(diffDays)} ${t.overdueBy}` : `${diffDays} ${t.daysLeft}`}
                  </span>
                </>
              )}
            </div>

            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed pt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {language === 'ta' && grievance.descriptionTa ? grievance.descriptionTa : grievance.description}
            </p>
          </div>

          {/* Citizen Photos Attached initially */}
          {grievance.photos.length > 0 && (
            <div>
              <span className="block font-semibold text-slate-800 mb-2">
                {language === 'ta' ? 'மனுதாரர் இணைத்த களப் புகைப்படம்' : 'Citizen Attached Field Photograph'}
              </span>
              <div className="flex items-center gap-3 overflow-x-auto">
                {grievance.photos.map((p, idx) => (
                  <div key={idx} className="relative w-48 h-32 rounded-lg overflow-hidden border border-slate-200">
                    <img 
                      src={p} 
                      alt="Field evidence" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Officer Action Bar (Visible to Officers) */}
          {isOfficer && (
            <div className="bg-slate-900 text-white p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-teal-400 text-xs uppercase tracking-wider">
                  {language === 'ta' ? 'அதிகாரப்பூர்வ நடவடிக்கை பலகை' : 'Administrative Action Controls'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentUser.fullName} ({currentUser.designation || currentUser.role.toUpperCase()})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowStatusChange(!showStatusChange)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-xs transition-colors"
                >
                  {t.actionChangeStatus}
                </button>

                <button
                  onClick={() => onOpenEvidenceModal(grievance)}
                  className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.actionSubmitEvidence}</span>
                </button>

                {isSupervisor && (
                  <button
                    onClick={() => onOpenVerifyModal(grievance)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.actionVerifyEvidence}</span>
                  </button>
                )}

                <button
                  onClick={() => setShowEscalate(!showEscalate)}
                  className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 rounded font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{t.actionEscalate}</span>
                </button>
              </div>

              {/* Status Change Drawer */}
              {showStatusChange && (
                <form onSubmit={handleStatusUpdate} className="p-3 bg-slate-800 rounded border border-slate-700 space-y-2 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">New Status</label>
                      <select
                        value={statusChangeValue}
                        onChange={e => setStatusChangeValue(e.target.value as GrievanceStatus)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      >
                        <option value="Under Review">Under Review</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Awaiting Department">Awaiting Department</option>
                        <option value="Awaiting Evidence">Awaiting Evidence</option>
                        <option value="Resolution Submitted">Resolution Submitted</option>
                        <option value="Closed">Closed (Requires approved verification)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Administrative Reason / Notes *</label>
                      <input
                        type="text"
                        value={statusChangeReason}
                        onChange={e => setStatusChangeReason(e.target.value)}
                        placeholder="State reason for transition"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  {statusError && (
                    <div className="text-rose-400 text-[11px]">{statusError}</div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowStatusChange(false)}
                      className="px-2.5 py-1 text-slate-400 hover:text-white"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded"
                    >
                      {t.save}
                    </button>
                  </div>
                </form>
              )}

              {/* Escalation Drawer */}
              {showEscalate && (
                <form onSubmit={handleEscalate} className="p-3 bg-slate-800 rounded border border-slate-700 space-y-2 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Escalate To</label>
                      <select
                        value={escalateRole}
                        onChange={e => setEscalateRole(e.target.value as UserRole)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      >
                        <option value="rdo">Revenue Divisional Officer (RDO)</option>
                        <option value="dro">District Revenue Officer (DRO)</option>
                        <option value="collector">District Collector (IAS)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Escalation Reason *</label>
                      <input
                        type="text"
                        value={escalateReason}
                        onChange={e => setEscalateReason(e.target.value)}
                        placeholder="Explain lack of resolution, interdepartmental deadlock, or SLA lapse"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowEscalate(false)}
                      className="px-2.5 py-1 text-slate-400 hover:text-white"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded"
                    >
                      Submit Escalation
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Citizen Appeal / Reopen and Feedback Section (When Closed) */}
          {grievance.status === 'Closed' && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'ta' ? 'மனு தீர்க்கப்பட்டு முடிக்கப்பட்டுள்ளது' : 'Grievance Verified & Closed'}
                  </span>
                </div>

                {!showReopen && !grievance.isReopened && (
                  <button
                    onClick={() => setShowReopen(true)}
                    className="text-amber-800 hover:text-amber-950 font-semibold text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.actionReopen}</span>
                  </button>
                )}
              </div>

              {/* Citizen Rating Form */}
              <form onSubmit={handleSaveFeedback} className="space-y-2 pt-1">
                <span className="block text-slate-700 font-medium text-[11px]">
                  {language === 'ta' ? 'மனுதாரர் கருத்து மற்றும் மதிப்பீடு:' : 'Citizen Satisfaction Feedback:'}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className={`p-1 ${feedbackRating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={feedbackComment}
                    onChange={e => setFeedbackComment(e.target.value)}
                    placeholder="Enter feedback comments regarding field repair quality..."
                    className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded text-slate-800"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-slate-900 text-white rounded font-medium text-xs shrink-0"
                  >
                    {feedbackSaved ? 'Saved!' : 'Submit'}
                  </button>
                </div>
              </form>

              {/* Reopen form */}
              {showReopen && (
                <form onSubmit={handleReopen} className="p-3 bg-amber-100/50 border border-amber-300 rounded space-y-2">
                  <label className="block text-amber-900 font-semibold text-[11px]">
                    {language === 'ta' ? 'மறு ஆய்வு கோருவதற்கான காரணம்:' : 'Grounds for Appeal / Reopening:'}
                  </label>
                  <textarea
                    rows={2}
                    value={reopenReason}
                    onChange={e => setReopenReason(e.target.value)}
                    placeholder="Describe why the work on ground was inadequate, incomplete, or flawed..."
                    className="w-full p-2 bg-white border border-amber-300 rounded text-xs"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReopen(false)}
                      className="px-2.5 py-1 text-slate-600"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-amber-800 text-white rounded font-semibold text-xs"
                    >
                      Submit Reopen Appeal
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Interactive Navigation Tabs for Evidence, Timeline, Notes */}
          <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2.5 transition-colors ${
                activeTab === 'timeline'
                  ? 'border-b-2 border-teal-600 text-teal-800'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'ta' ? 'நடவடிக்கை வரலாறு' : 'Status History & Timeline'} ({statusHistory.length})
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className={`pb-2.5 transition-colors ${
                activeTab === 'evidence'
                  ? 'border-b-2 border-teal-600 text-teal-800'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'ta' ? 'தீர்வுச் சான்றுகள் & சரிபார்ப்பு' : 'Resolution Evidence & Verification'} ({evidenceList.length})
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-2.5 transition-colors ${
                activeTab === 'comments'
                  ? 'border-b-2 border-teal-600 text-teal-800'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'ta' ? 'குறிப்புகள் & தொடர்பாடல்' : 'Notes & Updates'} ({comments.length})
            </button>
          </div>

          {/* Tab 1: Timeline History */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 pt-1">
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {statusHistory.map((item, idx) => (
                  <div key={item.id} className="relative flex items-start gap-3 pl-6">
                    <div className="absolute left-1.5 -translate-x-1/2 top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-white ring-1 ring-slate-300" />
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg w-full text-xs space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">
                          {item.previousStatus} → <span className="text-teal-700">{item.newStatus}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{item.reason}</p>
                      <div className="text-[11px] text-slate-500 pt-1">
                        By: {item.actorName} ({item.actorRole.toUpperCase()})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Evidence & Verification Records */}
          {activeTab === 'evidence' && (
            <div className="space-y-4 pt-1">
              {evidenceList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
                  {language === 'ta' 
                    ? 'இம்மனுவிற்கு தீர்வுச் சான்றுகள் இன்னும் சமர்ப்பிக்கப்படவில்லை.' 
                    : 'No resolution evidence submitted yet. Field officer must attach work order and completion photos.'}
                </div>
              ) : (
                evidenceList.map(ev => {
                  const matchingVerif = verifications.find(v => v.evidenceId === ev.id);
                  return (
                    <div key={ev.id} className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <strong className="block text-slate-900 font-semibold text-sm">
                            {language === 'ta' ? 'களப்பணி சான்று அறிக்கை' : 'Field Work Completion Record'}
                          </strong>
                          <span className="text-slate-500 text-[11px]">
                            Submitted by {ev.submittingOfficerName} · {new Date(ev.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {ev.workOrderOrGoNumber && (
                          <span className="font-mono text-xs font-semibold text-slate-800 bg-white border border-slate-300 px-2.5 py-1 rounded">
                            Order: {ev.workOrderOrGoNumber}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-700 leading-relaxed">
                        {ev.actionTaken}
                      </p>

                      {/* Before / After Photographs */}
                      {(ev.beforePhotoUrl || ev.afterPhotoUrl) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {ev.beforePhotoUrl && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-slate-700">
                                {t.beforePhotoLabel}
                              </span>
                              <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200">
                                <img
                                  src={ev.beforePhotoUrl}
                                  alt="Before evidence"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}

                          {ev.afterPhotoUrl && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-teal-800">
                                {t.afterPhotoLabel}
                              </span>
                              <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200">
                                <img
                                  src={ev.afterPhotoUrl}
                                  alt="After completion evidence"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Supervisory Verification Status Box */}
                      <div className="pt-3 border-t border-slate-200">
                        {matchingVerif ? (
                          <div className={`p-3 rounded-lg border text-xs ${
                            matchingVerif.decision === 'Approved'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}>
                            <div className="flex items-center justify-between font-semibold mb-1">
                              <span>Supervisory Review: {matchingVerif.decision}</span>
                              <span className="text-[11px] font-normal">{new Date(matchingVerif.verifiedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="leading-relaxed">{matchingVerif.decisionNotes}</p>
                            <div className="text-[11px] text-slate-500 pt-1">
                              Reviewer: {matchingVerif.reviewerName} ({matchingVerif.reviewerRole.toUpperCase()})
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs flex items-center justify-between">
                            <span>Awaiting Supervisory Review & Inspection</span>
                            {isSupervisor && (
                              <button
                                onClick={() => onOpenVerifyModal(grievance)}
                                className="px-2.5 py-1 bg-amber-800 text-white font-semibold rounded"
                              >
                                Review Now
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 3: Case Comments & Updates */}
          {activeTab === 'comments' && (
            <div className="space-y-4 pt-1">
              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-[11px]">
                    {language === 'ta' ? 'புதிய குறிப்பை சேர்க்க' : 'Add Case Update / Note'}
                  </span>

                  {isOfficer && (
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={e => setIsInternalComment(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      <span>Internal Officer Note (Confidential)</span>
                    </label>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder={isInternalComment ? "Internal administrative meeting note or engineering assessment..." : "Public update visible to citizen on tracking portal..."}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs text-slate-900"
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{t.save}</span>
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">No updates yet.</div>
                ) : (
                  comments.map(c => (
                    <div 
                      key={c.id} 
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        c.isInternal 
                          ? 'bg-amber-50/50 border-amber-200' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900">{c.authorName}</strong>
                          <span className="text-slate-500 text-[11px]">({c.authorRole.toUpperCase()})</span>
                          {c.isInternal && (
                            <span className="flex items-center gap-0.5 text-[10px] text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.2 rounded">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Internal</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
