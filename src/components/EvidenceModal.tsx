import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Grievance } from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  grievance: Grievance | null;
  language: Language;
  onEvidenceSubmitted: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  grievance,
  language,
  onEvidenceSubmitted
}) => {
  if (!isOpen || !grievance) return null;

  const t = translations[language];
  const currentUser = store.currentUser;

  const [actionTaken, setActionTaken] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [beforePhotoUrl, setBeforePhotoUrl] = useState(
    grievance.photos[0] || '/src/assets/images/evidence_road_before_1791743003638.jpg'
  );
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    '/src/assets/images/evidence_road_after_1791743015421.jpg'
  );
  const [captureInspectionCoords, setCaptureInspectionCoords] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'before') setBeforePhotoUrl(reader.result as string);
        else setAfterPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!actionTaken.trim() || !workOrderNumber.trim()) {
      setErrorMessage(language === 'ta' ? 'அனைத்து விவரங்களையும் நிரப்பவும்.' : 'Please provide action description and work order number.');
      return;
    }

    setIsSubmitting(true);
    try {
      store.submitResolutionEvidence({
        grievanceId: grievance.id,
        actionTaken,
        workOrderOrGoNumber: workOrderNumber,
        completionDate,
        beforePhotoUrl,
        afterPhotoUrl,
        inspectionCoordinates: captureInspectionCoords ? {
          lat: grievance.latitude || 12.6934,
          lng: grievance.longitude || 80.0163
        } : undefined
      });

      onEvidenceSubmitted();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission error');
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
              <Camera className="w-4 h-4 text-teal-400" />
              <span>{t.evidenceHeading}</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Case Ref: {grievance.referenceNumber}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Submitting Officer Identity */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Submitting Field Officer</span>
              <strong className="text-slate-900">{currentUser.fullName}</strong>
            </div>
            <span className="font-semibold text-slate-600 bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px]">
              {currentUser.designation || currentUser.role.toUpperCase()}
            </span>
          </div>

          {/* Action Taken Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.actionTakenLabel} *
            </label>
            <textarea
              rows={3}
              value={actionTaken}
              onChange={e => setActionTaken(e.target.value)}
              placeholder={t.actionTakenPlaceholder}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs focus:ring-1 focus:ring-teal-500"
              required
            />
          </div>

          {/* Work Order / GO & Completion Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.workOrderLabel} *
              </label>
              <input
                type="text"
                value={workOrderNumber}
                onChange={e => setWorkOrderNumber(e.target.value)}
                placeholder={t.workOrderPlaceholder}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.completionDateLabel} *
              </label>
              <input
                type="date"
                value={completionDate}
                onChange={e => setCompletionDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          {/* Before & After Photographs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Before Photo */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                {t.beforePhotoLabel}
              </label>
              <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center">
                {beforePhotoUrl ? (
                  <img src={beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-xs">No Before Photo</span>
                )}
              </div>
              <label className="inline-block cursor-pointer text-[11px] text-teal-700 hover:underline font-semibold">
                <span>Upload / Replace Before Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'before')} />
              </label>
            </div>

            {/* After Photo */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                {t.afterPhotoLabel} *
              </label>
              <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center">
                {afterPhotoUrl ? (
                  <img src={afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-400 text-xs">Upload Completion Photo</span>
                )}
              </div>
              <label className="inline-block cursor-pointer text-[11px] text-teal-700 hover:underline font-semibold">
                <span>Upload / Replace After Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'after')} />
              </label>
            </div>
          </div>

          {/* GPS Inspection Metadata Consent */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="gps-inspection"
              checked={captureInspectionCoords}
              onChange={e => setCaptureInspectionCoords(e.target.checked)}
              className="rounded text-teal-600"
            />
            <label htmlFor="gps-inspection" className="text-slate-600 text-[11px] cursor-pointer">
              Attach field inspection geo-coordinates ({grievance.latitude || 12.6934}, {grievance.longitude || 80.0163}) to verify physical site presence.
            </label>
          </div>

          {/* Action Buttons */}
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
              {t.submitEvidenceBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
