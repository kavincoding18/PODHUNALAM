import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Camera, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  Upload
} from 'lucide-react';
import { GrievanceCategory, PriorityLevel, Grievance } from '../types';
import { Language, translations } from '../i18n/translations';
import { store } from '../services/store';

interface GrievanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSuccess: (grievance: Grievance) => void;
  isOfflineEntry?: boolean;
}

export const GrievanceFormModal: React.FC<GrievanceFormModalProps> = ({
  isOpen,
  onClose,
  language,
  onSuccess,
  isOfflineEntry = false
}) => {
  const t = translations[language];

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GrievanceCategory>('roads');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [description, setDescription] = useState('');
  const [taluk, setTaluk] = useState('Tiruchirappalli West');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  
  // Citizen Details
  const currentUser = store.currentUser;
  const [citizenName, setCitizenName] = useState(currentUser.role === 'citizen' ? currentUser.fullName : '');
  const [citizenPhone, setCitizenPhone] = useState(currentUser.role === 'citizen' ? (currentUser.phone || '') : '');
  const [citizenEmail, setCitizenEmail] = useState(currentUser.role === 'citizen' ? currentUser.email : '');
  const [campName, setCampName] = useState(isOfflineEntry ? 'Tiruchirappalli Collectorate Monday Grievance Day Camp' : '');

  // Privacy consent
  const [consentAccepted, setConsentAccepted] = useState(false);
  
  // Photo preview
  const [photoUrl, setPhotoUrl] = useState<string>('');
  
  // State for created confirmation
  const [createdGrievance, setCreatedGrievance] = useState<Grievance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Check potential duplicates
  const potentialDuplicates = locality.trim().length > 3 
    ? store.findPotentialDuplicates(taluk, locality, category) 
    : [];

  const taluks = [
    { id: 'Tiruchirappalli West', labelEn: 'Tiruchirappalli West (K.Abishekapuram Zone)', labelTa: 'திருச்சிராப்பள்ளி மேற்கு (கே.அபிஷேகபுரம் மண்டலம்)' },
    { id: 'Tiruchirappalli East', labelEn: 'Tiruchirappalli East (Ariyamangalam & Fort)', labelTa: 'திருச்சிராப்பள்ளி கிழக்கு (அரியமங்கலம் & கோட்டை)' },
    { id: 'Srirangam', labelEn: 'Srirangam (Zone 1)', labelTa: 'ஸ்ரீரங்கம் மண்டலம் (மண்டலம் 1)' },
    { id: 'Ponmalai (Zone 3)', labelEn: 'Ponmalai / Golden Rock (Zone 3)', labelTa: 'பொன்மலை மண்டலம் (மண்டலம் 3)' },
    { id: 'Thiruverumbur', labelEn: 'Thiruverumbur Taluk', labelTa: 'திருவெறும்பூர் வட்டம்' },
    { id: 'Manapparai', labelEn: 'Manapparai Taluk', labelTa: 'மணப்பாறை வட்டம்' },
    { id: 'Lalgudi', labelEn: 'Lalgudi Taluk', labelTa: 'லால்குடி வட்டம்' },
    { id: 'Musiri', labelEn: 'Musiri Taluk', labelTa: 'முசிறி வட்டம்' }
  ];

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(language === 'ta' ? 'ஜிபிஎஸ் வசதி கிடைக்கவில்லை' : 'Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    setLocationMessage('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6))
        });
        setIsDetectingLocation(false);
        setLocationMessage(`${t.locationCaptured}: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        setIsDetectingLocation(false);
        // Fallback to Tiruchirappalli center coordinates
        setCoords({ lat: 10.7905, lng: 78.7047 });
        setLocationMessage(language === 'ta' ? 'திருச்சிராப்பள்ளி மையம் குறிக்கப்பட்டது' : 'Pinned to Tiruchirappalli Center');
      },
      { timeout: 7000 }
    );
  };

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !description.trim() || !locality.trim() || !citizenName.trim() || !citizenPhone.trim()) {
      setErrorMessage(language === 'ta' ? 'அனைத்து தேவையான விவரங்களையும் நிரப்பவும்.' : 'Please fill all mandatory fields marked with *');
      return;
    }

    if (!consentAccepted) {
      setErrorMessage(language === 'ta' ? 'தனியுரிமை மற்றும் சம்மத அறிவிப்பை ஏற்கவும்.' : 'Please agree to the privacy and consent policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find lead department for category
      let leadDeptId = 'dept-highways';
      if (category === 'drinking_water' || category === 'drainage') leadDeptId = 'dept-twad';
      else if (category === 'streetlights' || category === 'electricity') leadDeptId = 'dept-tangedco';
      else if (category === 'waste_management' || category === 'sanitation') leadDeptId = 'dept-sanitation';
      else if (category === 'revenue_records') leadDeptId = 'dept-revenue';
      else if (category === 'public_infrastructure') leadDeptId = 'dept-municipality';

      const created = await store.submitGrievance({
        title,
        titleTa: language === 'ta' ? title : undefined,
        description,
        descriptionTa: language === 'ta' ? description : undefined,
        category,
        priority,
        citizenName,
        citizenPhone,
        citizenEmail,
        isOfflineEntry,
        campName: isOfflineEntry ? campName : undefined,
        district: 'Tiruchirappalli',
        taluk,
        locality,
        address,
        latitude: coords.lat,
        longitude: coords.lng,
        leadDepartmentId: leadDeptId,
        photos: photoUrl ? [photoUrl] : []
      });

      setCreatedGrievance(created);
      onSuccess(created);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">
              {isOfflineEntry ? t.offlineCampTitle : t.newGrievanceHeading}
            </h2>
            <p className="text-xs text-slate-400">
              {t.newGrievanceSubhead}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {createdGrievance ? (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">{t.submittedSuccessTitle}</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">{t.keepRefNote}</p>
              </div>

              {/* Reference Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 max-w-md mx-auto text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">{t.referenceNumberLabel}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(createdGrievance.referenceNumber)}
                    className="text-xs text-teal-700 hover:text-teal-900 flex items-center gap-1 font-medium"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-2xl font-mono font-extrabold text-slate-900 tracking-wider">
                  {createdGrievance.referenceNumber}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t.targetDateLabel}:</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {new Date(createdGrievance.targetResolutionDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  {language === 'ta' ? 'முடிவு' : 'Done'}
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Offline Camp Banner if Applicable */}
              {isOfflineEntry && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1.5">
                  <strong className="block font-semibold">
                    {language === 'ta' ? 'நேரடி மனு முகாம் விவரம்' : 'In-Person Camp Details'}
                  </strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-amber-800 block mb-0.5">{t.campNameLabel}</label>
                      <input
                        type="text"
                        value={campName}
                        onChange={e => setCampName(e.target.value)}
                        placeholder={t.campNamePlaceholder}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-amber-800 block mb-0.5">{t.operatorIdLabel}</label>
                      <div className="text-xs font-semibold py-1.5 text-slate-800">
                        {currentUser.fullName} ({currentUser.designation || 'Operator'})
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 1: Complaint Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.formCategory} *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as GrievanceCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="roads">{t.cat_roads}</option>
                    <option value="drinking_water">{t.cat_drinking_water}</option>
                    <option value="sanitation">{t.cat_sanitation}</option>
                    <option value="drainage">{t.cat_drainage}</option>
                    <option value="streetlights">{t.cat_streetlights}</option>
                    <option value="waste_management">{t.cat_waste_management}</option>
                    <option value="public_infrastructure">{t.cat_public_infrastructure}</option>
                    <option value="revenue_records">{t.cat_revenue_records}</option>
                    <option value="electricity">{t.cat_electricity}</option>
                    <option value="other">{t.cat_other}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.formPriority} *
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Low">{t.priorityLow}</option>
                    <option value="Medium">{t.priorityMedium}</option>
                    <option value="High">{t.priorityHigh}</option>
                    <option value="Emergency">{t.priorityEmergency}</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.formTitle} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t.formTitlePlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.formDescription} *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t.formDescriptionPlaceholder}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Section 2: Location & Taluk */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.formTaluk} *
                  </label>
                  <select
                    value={taluk}
                    onChange={e => setTaluk(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-500"
                  >
                    {taluks.map(tlk => (
                      <option key={tlk.id} value={tlk.id}>
                        {language === 'ta' ? tlk.labelTa : tlk.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.formLocality} *
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={e => setLocality(e.target.value)}
                    placeholder={t.formLocalityPlaceholder}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Duplicate Detection Alert if similar complaint found */}
              {potentialDuplicates.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {language === 'ta' 
                        ? 'இப்பகுதியில் ஏற்கனவே பதியப்பட்ட மனுக்கள் கண்டறியப்பட்டுள்ளன:' 
                        : 'Possible duplicate / related complaint already registered in this locality:'}
                    </span>
                  </div>
                  <div className="text-[11px] space-y-1">
                    {potentialDuplicates.map(dup => (
                      <div key={dup.id} className="text-slate-700">
                        <span className="font-mono font-semibold text-slate-900">{dup.referenceNumber}</span>: {dup.title} ({dup.status})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address & GPS Detection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.formAddress}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder={t.formAddressPlaceholder}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.formCoordinates}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-semibold text-slate-800 flex items-center gap-1.5 shrink-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isDetectingLocation ? 'Detecting...' : t.captureCurrentLocation}</span>
                    </button>
                    {locationMessage && (
                      <span className="text-[11px] text-slate-600 truncate">{locationMessage}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo Evidence Upload */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.attachPhoto}
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded flex items-center gap-1.5 text-xs text-slate-700">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Photograph / Document</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleSimulatePhotoUpload} 
                    />
                  </label>
                  {photoUrl && (
                    <div className="relative w-12 h-12 rounded border border-slate-300 overflow-hidden">
                      <img src={photoUrl} alt="Attached preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-0 right-0 bg-slate-900 text-white p-0.5 rounded-bl text-[9px]"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Citizen Personal Information */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <span className="block font-semibold text-slate-800 text-xs">
                  {language === 'ta' ? 'மனுதாரர் தொடர்பு விவரங்கள்' : 'Citizen Contact Information'}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">{t.formCitizenName} *</label>
                    <input
                      type="text"
                      value={citizenName}
                      onChange={e => setCitizenName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">{t.formCitizenPhone} *</label>
                    <input
                      type="tel"
                      value={citizenPhone}
                      onChange={e => setCitizenPhone(e.target.value)}
                      placeholder="+91 98400 XXXXX"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Notice & Consent Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="privacy-consent"
                  checked={consentAccepted}
                  onChange={e => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  required
                />
                <label htmlFor="privacy-consent" className="text-[11px] text-slate-600 leading-relaxed cursor-pointer">
                  <strong className="text-slate-800">{t.privacyNotice}: </strong>
                  {t.privacyNoticeText}
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  {isSubmitting ? t.submitting : t.submitGrievanceBtn}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
