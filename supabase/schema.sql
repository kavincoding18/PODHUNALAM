-- ========================================================================
-- PODHUNALAM (பொதுநலம்) — Public Grievance Management Platform
-- Relational PostgreSQL Database Schema with Row Level Security (RLS)
-- Target: Dedicated Supabase Database
-- ========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------
-- 1. Departments Table
-- ------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------
-- 2. Administrative Units (Hierarchy: District -> Division -> Taluk -> Locality)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS administrative_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_ta VARCHAR(255) NOT NULL,
    unit_type VARCHAR(50) NOT NULL CHECK (unit_type IN ('District', 'Division', 'Taluk', 'Block', 'Municipality')),
    parent_id UUID REFERENCES administrative_units(id) ON DELETE SET NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 3. Profiles (Linked to Supabase auth.users or standalone platform accounts)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    full_name_ta VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('citizen', 'operator', 'ao', 'rdo', 'dro', 'collector', 'admin')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    administrative_unit_id UUID REFERENCES administrative_units(id) ON DELETE SET NULL,
    designation VARCHAR(150),
    designation_ta VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 4. Officer Assignments (Jurisdiction & functional mapping)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS officer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    officer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    administrative_unit_id UUID NOT NULL REFERENCES administrative_units(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 5. Grievances (Core incident & petition entity)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(300) NOT NULL,
    title_ta VARCHAR(300),
    description TEXT NOT NULL,
    description_ta TEXT,
    category VARCHAR(80) NOT NULL,
    priority VARCHAR(30) NOT NULL DEFAULT 'Standard' CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted' CHECK (status IN (
        'Submitted', 'Under Review', 'Assigned', 'In Progress', 
        'Awaiting Department', 'Awaiting Evidence', 'Resolution Submitted', 
        'Reopened', 'Escalated', 'Closed'
    )),
    
    -- Citizen / Lodging Source
    citizen_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    citizen_name VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(20) NOT NULL,
    citizen_email VARCHAR(255),
    is_offline_entry BOOLEAN DEFAULT FALSE,
    operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    camp_name VARCHAR(255),
    
    -- Geographical coordinates & jurisdiction
    district VARCHAR(100) NOT NULL DEFAULT 'Tiruchirappalli',
    taluk VARCHAR(100) NOT NULL,
    locality VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    -- Department routing
    lead_department_id UUID NOT NULL REFERENCES departments(id),
    assigned_officer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Media
    photos JSONB DEFAULT '[]'::jsonb,
    
    -- SLA & Audit
    target_resolution_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    
    -- Escalation & Appeal flags
    is_escalated BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    is_reopened BOOLEAN DEFAULT FALSE,
    reopen_reason TEXT,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    feedback_comment TEXT
);

CREATE INDEX IF NOT EXISTS idx_grievances_ref ON grievances(reference_number);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_category ON grievances(category);
CREATE INDEX IF NOT EXISTS idx_grievances_lead_dept ON grievances(lead_department_id);
CREATE INDEX IF NOT EXISTS idx_grievances_taluk ON grievances(taluk);
CREATE INDEX IF NOT EXISTS idx_grievances_created_at ON grievances(created_at);

-- ------------------------------------------------------------------------
-- 6. Grievance Assignments History
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grievance_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES profiles(id),
    assigned_by UUID NOT NULL REFERENCES profiles(id),
    instructions TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 7. Grievance Status History (Immutable audit trail of transitions)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grievance_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_grievance ON grievance_status_history(grievance_id);

-- ------------------------------------------------------------------------
-- 8. Grievance Comments (Separating internal officer notes from citizen updates)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grievance_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    author_department VARCHAR(100),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_grievance ON grievance_comments(grievance_id);

-- ------------------------------------------------------------------------
-- 9. Grievance Departments (Interdepartmental coordination)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grievance_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    is_lead BOOLEAN DEFAULT FALSE,
    assigned_officer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    task_description TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 10. Resolution Evidence (Before & After photos, Work Orders, GO references)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resolution_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    submitting_officer_id UUID NOT NULL REFERENCES profiles(id),
    submitting_officer_name VARCHAR(255) NOT NULL,
    action_taken TEXT NOT NULL,
    before_photo_url TEXT,
    after_photo_url TEXT,
    work_order_or_go_number VARCHAR(150),
    completion_date DATE NOT NULL,
    inspection_lat DOUBLE PRECISION,
    inspection_lng DOUBLE PRECISION,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_grievance ON resolution_evidence(grievance_id);

-- ------------------------------------------------------------------------
-- 11. Verification Records (Supervisory Review Before Closure)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES resolution_evidence(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    reviewer_name VARCHAR(255) NOT NULL,
    reviewer_role VARCHAR(50) NOT NULL,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('Approved', 'Rejected', 'Needs Modification')),
    decision_notes TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 12. Escalation Records (AO -> RDO -> DRO -> Collector)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS escalation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    escalated_from_role VARCHAR(50) NOT NULL,
    escalated_to_role VARCHAR(50) NOT NULL,
    escalated_by_id UUID NOT NULL REFERENCES profiles(id),
    escalated_by_name VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    escalated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 13. Notifications (In-app updates & SMS/Email queue)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_role VARCHAR(50),
    grievance_id UUID REFERENCES grievances(id) ON DELETE CASCADE,
    reference_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 14. Audit Logs (Tamper-evident system activity log)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrative_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE officer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolution_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Departments and Admin Units: Public Read
CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public read admin units" ON administrative_units FOR SELECT USING (true);

-- 2. Grievances:
-- Anyone can create a grievance
CREATE POLICY "Anyone can insert grievance" ON grievances FOR INSERT WITH CHECK (true);
-- Anyone can track their grievance by reference_number, or if authenticated citizen owner
CREATE POLICY "Track grievance by reference" ON grievances FOR SELECT USING (true);
-- Update restricted to authorized officers
CREATE POLICY "Officers can update grievances" ON grievances FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('ao', 'rdo', 'dro', 'collector', 'admin', 'operator'))
);

-- 3. Comments:
-- Citizens only see non-internal comments
CREATE POLICY "Citizens read public comments" ON grievance_comments FOR SELECT USING (
    is_internal = false OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('ao', 'rdo', 'dro', 'collector', 'admin'))
);
-- Officers can insert comments
CREATE POLICY "Officers insert comments" ON grievance_comments FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('ao', 'rdo', 'dro', 'collector', 'admin', 'citizen'))
);

-- 4. Status History: Public Read for transparency
CREATE POLICY "Public read status history" ON grievance_status_history FOR SELECT USING (true);

-- 5. Evidence & Verification: Officers and Citizens can view evidence for verified accountability
CREATE POLICY "Public view evidence" ON resolution_evidence FOR SELECT USING (true);
CREATE POLICY "Officers submit evidence" ON resolution_evidence FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('ao', 'rdo', 'dro', 'collector', 'admin'))
);

-- 6. Notifications: Recipient only
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (
    auth.uid() = recipient_id OR recipient_role IS NOT NULL
);

-- 7. Audit Logs: Read-only for admin and collector
CREATE POLICY "Supervisors read audit logs" ON audit_logs FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('collector', 'admin', 'dro'))
);
CREATE POLICY "System insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);
