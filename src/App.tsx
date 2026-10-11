import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CitizenPortal } from './components/CitizenPortal';
import { OfficerDashboard } from './components/OfficerDashboard';
import { CollectorDashboard } from './components/CollectorDashboard';
import { InteractiveMap } from './components/InteractiveMap';
import { AdminPanel } from './components/AdminPanel';
import { GrievanceFormModal } from './components/GrievanceFormModal';
import { GrievanceDetailModal } from './components/GrievanceDetailModal';
import { EvidenceModal } from './components/EvidenceModal';
import { VerificationModal } from './components/VerificationModal';
import { SupabaseConnectionModal } from './components/SupabaseConnectionModal';
import { Language, translations } from './i18n/translations';
import { Grievance } from './types';
import { store } from './services/store';

export default function App() {
  const [language, setLanguage] = useState<Language>('ta');
  const [currentTab, setCurrentTab] = useState<string>('citizen');
  const [, setTick] = useState(0);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isOfflineCampModalOpen, setIsOfflineCampModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [evidenceGrievance, setEvidenceGrievance] = useState<Grievance | null>(null);
  const [verifyGrievance, setVerifyGrievance] = useState<Grievance | null>(null);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  const handleSelectGrievance = (grievance: Grievance) => {
    // Refresh with latest object from store
    const fresh = store.grievances.find(g => g.id === grievance.id) || grievance;
    setSelectedGrievance(fresh);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenOfflineModal={() => setIsOfflineCampModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'citizen' && (
          <CitizenPortal
            language={language}
            onOpenReport={() => setIsReportModalOpen(true)}
            onSelectGrievance={handleSelectGrievance}
          />
        )}

        {currentTab === 'track' && (
          <CitizenPortal
            language={language}
            onOpenReport={() => setIsReportModalOpen(true)}
            onSelectGrievance={handleSelectGrievance}
            initialTrackRef="TN-TRY-2026-0842"
          />
        )}

        {currentTab === 'map' && (
          <InteractiveMap
            language={language}
            onSelectGrievance={handleSelectGrievance}
          />
        )}

        {currentTab === 'officer' && (
          <OfficerDashboard
            language={language}
            onSelectGrievance={handleSelectGrievance}
            onOpenEvidenceModal={g => setEvidenceGrievance(g)}
            onOpenVerifyModal={g => setVerifyGrievance(g)}
          />
        )}

        {currentTab === 'collector' && (
          <CollectorDashboard
            language={language}
            onSelectGrievance={handleSelectGrievance}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            language={language}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        language={language}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Citizen New Grievance Modal */}
      <GrievanceFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        language={language}
        onSuccess={newGrievance => {
          setSelectedGrievance(newGrievance);
        }}
      />

      {/* Offline Camp Entry Modal for Operators */}
      <GrievanceFormModal
        isOpen={isOfflineCampModalOpen}
        onClose={() => setIsOfflineCampModalOpen(false)}
        language={language}
        isOfflineEntry={true}
        onSuccess={newGrievance => {
          setSelectedGrievance(newGrievance);
        }}
      />

      {/* Grievance Detail & Lifecycle Dossier Modal */}
      <GrievanceDetailModal
        grievance={selectedGrievance}
        onClose={() => setSelectedGrievance(null)}
        language={language}
        onOpenEvidenceModal={g => setEvidenceGrievance(g)}
        onOpenVerifyModal={g => setVerifyGrievance(g)}
      />

      {/* Evidence Submission Modal */}
      <EvidenceModal
        isOpen={Boolean(evidenceGrievance)}
        grievance={evidenceGrievance}
        onClose={() => setEvidenceGrievance(null)}
        language={language}
        onEvidenceSubmitted={() => {
          if (selectedGrievance && evidenceGrievance && selectedGrievance.id === evidenceGrievance.id) {
            const fresh = store.grievances.find(g => g.id === evidenceGrievance.id);
            if (fresh) setSelectedGrievance(fresh);
          }
        }}
      />

      {/* Supervisory Verification Modal */}
      <VerificationModal
        isOpen={Boolean(verifyGrievance)}
        grievance={verifyGrievance}
        onClose={() => setVerifyGrievance(null)}
        language={language}
        onVerified={() => {
          if (selectedGrievance && verifyGrievance && selectedGrievance.id === verifyGrievance.id) {
            const fresh = store.grievances.find(g => g.id === verifyGrievance.id);
            if (fresh) setSelectedGrievance(fresh);
          }
        }}
      />

      {/* Supabase Connection & SQL Migration Modal */}
      <SupabaseConnectionModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        language={language}
      />
    </div>
  );
}
