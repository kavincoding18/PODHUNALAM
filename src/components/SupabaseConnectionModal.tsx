import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection, 
  ConnectionStatus 
} from '../lib/supabase';
import { Language, translations } from '../i18n/translations';

interface SupabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SupabaseConnectionModal: React.FC<SupabaseConnectionModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const currentConfig = getSupabaseConfig();

  const [urlInput, setUrlInput] = useState(currentConfig.url);
  const [anonKeyInput, setAnonKeyInput] = useState(currentConfig.anonKey);
  const [testResult, setTestResult] = useState<ConnectionStatus | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'tables'>('config');

  useEffect(() => {
    runConnectionTest();
  }, []);

  const runConnectionTest = async () => {
    setIsTesting(true);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSave = () => {
    saveSupabaseConfig(urlInput, anonKeyInput);
    runConnectionTest();
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrlInput('');
    setAnonKeyInput('');
    setTestResult(null);
  };

  // Full SQL schema script content for 1-click copy
  const fullSqlSchema = `-- PODHUNALAM (பொதுநலம்) — Full Database DDL Script
-- Execute in Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ta VARCHAR(255) NOT NULL,
  lead_officer_title VARCHAR(150) NOT NULL,
  lead_officer_title_ta VARCHAR(150) NOT NULL,
  contact_email VARCHAR(255),
  target_days_default INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS administrative_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en VARCHAR(255) NOT NULL,
  name_ta VARCHAR(255) NOT NULL,
  unit_type VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES administrative_units(id),
  code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  full_name_ta VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  department_id UUID REFERENCES departments(id),
  administrative_unit_id UUID REFERENCES administrative_units(id),
  designation VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(300) NOT NULL,
  title_ta VARCHAR(300),
  description TEXT NOT NULL,
  description_ta TEXT,
  category VARCHAR(80) NOT NULL,
  priority VARCHAR(30) NOT NULL DEFAULT 'Standard',
  status VARCHAR(50) NOT NULL DEFAULT 'Submitted',
  citizen_name VARCHAR(255) NOT NULL,
  citizen_phone VARCHAR(20) NOT NULL,
  district VARCHAR(100) DEFAULT 'Chengalpattu',
  taluk VARCHAR(100) NOT NULL,
  locality VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  lead_department_id UUID REFERENCES departments(id),
  target_resolution_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resolution_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  submitting_officer_name VARCHAR(255) NOT NULL,
  action_taken TEXT NOT NULL,
  before_photo_url TEXT,
  after_photo_url TEXT,
  work_order_or_go_number VARCHAR(150),
  completion_date DATE NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  reviewer_name VARCHAR(255) NOT NULL,
  decision VARCHAR(50) NOT NULL,
  decision_notes TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  performed_by VARCHAR(255) NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);`;

  const copySql = () => {
    navigator.clipboard.writeText(fullSqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden text-slate-900 my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-400" />
              <span>Supabase Database Connection & Migration Status</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dedicated PostgreSQL backend, Row Level Security, and sync inspector
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-6 text-xs font-semibold pt-3">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'config' ? 'border-b-2 border-teal-600 text-teal-800' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Connection Setup
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'tables' ? 'border-b-2 border-teal-600 text-teal-800' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Tables & Policies
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'schema' ? 'border-b-2 border-teal-600 text-teal-800' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            SQL Migration Script
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 text-xs space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Active Tab: Config */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Connection Status Box */}
              <div className={`p-4 rounded-lg border text-xs flex items-start gap-3 ${
                testResult?.connected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {testResult?.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Server className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <strong className="block text-sm font-semibold">
                    {testResult?.connected ? 'Supabase Database Connected' : 'Local Sandbox Mode Active'}
                  </strong>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {testResult?.message || 'Application is functioning in offline-resilient local sandbox mode. Connect your dedicated Supabase project below for persistent cloud PostgreSQL sync.'}
                  </p>
                </div>
              </div>

              {/* Supabase URL and Key inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-mono text-xs text-slate-900 focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Found in your Supabase Project Settings → API → Project URL
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Supabase Anon Public Key (anon public)
                  </label>
                  <input
                    type="text"
                    value={anonKeyInput}
                    onChange={e => setAnonKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-mono text-xs text-slate-900 focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Found in Supabase Project Settings → API → Project API Keys (anon public)
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-slate-500 hover:text-rose-600 font-semibold"
                  >
                    Clear Credentials
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={runConnectionTest}
                      disabled={isTesting}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>Test Connection</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold transition-colors"
                    >
                      Save & Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Tab: Required Tables & Policies */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <p className="text-slate-600 text-xs">
                PODHUNALAM requires 14 relational tables with strict foreign keys and Row Level Security:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'departments', desc: 'Civic agencies, target SLAs, and lead titles' },
                  { name: 'administrative_units', desc: 'Hierarchy: District → Division → Taluk' },
                  { name: 'profiles', desc: 'Citizens, operators, and 5 administrative tiers' },
                  { name: 'officer_assignments', desc: 'Taluk and division jurisdiction mappings' },
                  { name: 'grievances', desc: 'Core petitions with coordinates and priority' },
                  { name: 'grievance_assignments', desc: 'Audit log of assigned field officers' },
                  { name: 'grievance_status_history', desc: 'Immutable timeline of state changes' },
                  { name: 'grievance_comments', desc: 'Separated public updates vs internal officer notes' },
                  { name: 'grievance_departments', desc: 'Interdepartmental multi-agency tasks' },
                  { name: 'resolution_evidence', desc: 'Before/After photos & Work Order / GO vouchers' },
                  { name: 'verification_records', desc: 'Supervisory approval / rejection records' },
                  { name: 'escalation_records', desc: 'AO → RDO → DRO → Collector escalation logs' },
                  { name: 'notifications', desc: 'In-app and SMS/Email delivery logs' },
                  { name: 'audit_logs', desc: 'Tamper-evident activity register' }
                ].map(tbl => (
                  <div key={tbl.name} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="block font-mono text-slate-900">{tbl.name}</strong>
                    <span className="text-[11px] text-slate-500">{tbl.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tab: SQL Script */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  Execute this SQL in Supabase SQL Editor
                </span>
                <button
                  onClick={copySql}
                  className="px-3 py-1 bg-slate-900 text-white rounded font-semibold text-xs flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed">
                {fullSqlSchema}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
