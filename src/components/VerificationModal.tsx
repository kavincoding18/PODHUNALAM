import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Grievance, ResolutionEvidence } from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  grievance: Grievance | null;
  language: Language;
  onVerified: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  grievance,
  language,
  onVerified
}) => {
  if (!isOpen || !grievance) return null;

  const t = translations[language];
  const currentUser = store.currentUser;
  const evidenceList = store.evidence.filter(e => e.grievanceId === grievance.id);
  const latestEvidence = evidenceList[0];

  const [decision, setDecision] = useState<'Approved' | 'Rejected' | 'Needs Modification'>('Approved');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!latestEvidence) {
      setErrorMessage(language === 'ta' ? 'சரிபார்க்க தீர்வுச் சான்றுகள் இல்லை.' : 'No evidence record found to verify.');
      return;
    }

    if (!decisionNotes.trim()) {
      setErrorMessage(language === 'ta' ? 'மேற்பார்வை குறிப்புகளை உள்ளிடவும்.' : 'Please provide supervisory inspection remarks.');
      return;
    }

    setIsSubmitting(true);
    try {
      store.verifyResolution({
        grievanceId: grievance.id,
        evidenceId: latestEvidence.id,
        decision,
        decisionNotes
      });

      onVerified();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-900 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.verifyResolutionTitle}</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Ref: {grievance.referenceNumber}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Evidence Review Summary */}
          {latestEvidence ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Submitted Evidence Details</span>
                <span className="font-mono text-[11px] text-slate-500">{latestEvidence.workOrderOrGoNumber}</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">{latestEvidence.actionTaken}</p>
              
              {/* Image Previews */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {latestEvidence.beforePhotoUrl && (
                  <div className="aspect-4/3 rounded overflow-hidden border border-slate-300">
                    <img src={latestEvidence.beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
                  </div>
                )}
                {latestEvidence.afterPhotoUrl && (
                  <div className="aspect-4/3 rounded overflow-hidden border border-slate-300">
                    <img src={latestEvidence.afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded text-amber-800">
              No evidence submitted yet.
            </div>
          )}

          {/* Decision Choices */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">
              {t.verifyDecisionLabel} *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('Approved')}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                  decision === 'Approved'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.verifyApprove}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal">Close case and notify citizen</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('Rejected')}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                  decision === 'Rejected'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold ring-1 ring-rose-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>{t.verifyReject}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal">Inadequate work, return to AO</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('Needs Modification')}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                  decision === 'Needs Modification'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>{t.verifyNeedsMod}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal">Request joint inspection</span>
              </button>
            </div>
          </div>

          {/* Decision Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.reviewerNotesLabel} *
            </label>
            <textarea
              rows={3}
              value={decisionNotes}
              onChange={e => setDecisionNotes(e.target.value)}
              placeholder="State supervisory findings, engineering compliance, and inspection observations..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs focus:ring-1 focus:ring-teal-500"
              required
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
            >
              {t.submitVerificationBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
