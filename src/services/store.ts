import { 
  UserProfile, 
  Department, 
  AdministrativeUnit, 
  Grievance, 
  GrievanceStatus, 
  GrievanceStatusHistory, 
  GrievanceComment, 
  GrievanceDepartment, 
  ResolutionEvidence, 
  VerificationRecord, 
  EscalationRecord, 
  AppNotification, 
  AuditLog, 
  UserRole,
  PriorityLevel,
  GrievanceCategory
} from '../types';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_ADMIN_UNITS, 
  DEMO_USERS, 
  INITIAL_GRIEVANCES, 
  INITIAL_STATUS_HISTORY, 
  INITIAL_COMMENTS, 
  INITIAL_EVIDENCE, 
  INITIAL_VERIFICATIONS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS 
} from '../data/seedData';
import { getSupabase } from '../lib/supabase';

const STORAGE_KEY_PREFIX = 'podhunalam_data_try_v2_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key} to storage:`, e);
  }
}

class PodhunalamStore {
  departments: Department[] = loadFromStorage('departments', INITIAL_DEPARTMENTS);
  adminUnits: AdministrativeUnit[] = loadFromStorage('adminUnits', INITIAL_ADMIN_UNITS);
  users: UserProfile[] = loadFromStorage('users', DEMO_USERS);
  grievances: Grievance[] = loadFromStorage('grievances', INITIAL_GRIEVANCES);
  statusHistory: GrievanceStatusHistory[] = loadFromStorage('statusHistory', INITIAL_STATUS_HISTORY);
  comments: GrievanceComment[] = loadFromStorage('comments', INITIAL_COMMENTS);
  grievanceDepts: GrievanceDepartment[] = loadFromStorage('grievanceDepts', []);
  evidence: ResolutionEvidence[] = loadFromStorage('evidence', INITIAL_EVIDENCE);
  verifications: VerificationRecord[] = loadFromStorage('verifications', INITIAL_VERIFICATIONS);
  escalations: EscalationRecord[] = loadFromStorage('escalations', []);
  notifications: AppNotification[] = loadFromStorage('notifications', INITIAL_NOTIFICATIONS);
  auditLogs: AuditLog[] = loadFromStorage('auditLogs', INITIAL_AUDIT_LOGS);
  
  currentUser: UserProfile = DEMO_USERS[0]; // Citizen by default

  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.persistAll();
    this.listeners.forEach(fn => fn());
  }

  private persistAll() {
    saveToStorage('departments', this.departments);
    saveToStorage('adminUnits', this.adminUnits);
    saveToStorage('users', this.users);
    saveToStorage('grievances', this.grievances);
    saveToStorage('statusHistory', this.statusHistory);
    saveToStorage('comments', this.comments);
    saveToStorage('grievanceDepts', this.grievanceDepts);
    saveToStorage('evidence', this.evidence);
    saveToStorage('verifications', this.verifications);
    saveToStorage('escalations', this.escalations);
    saveToStorage('notifications', this.notifications);
    saveToStorage('auditLogs', this.auditLogs);
  }

  setCurrentUserRole(role: UserRole) {
    const found = this.users.find(u => u.role === role) || this.users[0];
    this.currentUser = found;
    this.notify();
  }

  generateReferenceNumber(): string {
    const year = new Date().getFullYear();
    const count = this.grievances.length + 101;
    const num = String(count).padStart(4, '0');
    return `TN-TRY-${year}-${num}`;
  }

  // Duplicate detection suggestions
  findPotentialDuplicates(taluk: string, locality: string, category: GrievanceCategory): Grievance[] {
    const normalizedLoc = locality.trim().toLowerCase();
    return this.grievances.filter(g => {
      if (g.status === 'Closed') return false;
      if (g.category !== category) return false;
      const gLoc = g.locality.toLowerCase();
      return (
        g.taluk.toLowerCase() === taluk.toLowerCase() &&
        (gLoc.includes(normalizedLoc) || normalizedLoc.includes(gLoc) || gLoc === normalizedLoc)
      );
    });
  }

  // Calculate target resolution date from department SLA
  calculateTargetDate(departmentId: string): string {
    const dept = this.departments.find(d => d.id === departmentId);
    const days = dept?.targetDaysDefault || 10;
    const target = new Date();
    target.setDate(target.getDate() + days);
    return target.toISOString();
  }

  // 1. Submit Grievance
  async submitGrievance(data: {
    title: string;
    titleTa?: string;
    description: string;
    descriptionTa?: string;
    category: GrievanceCategory;
    priority: PriorityLevel;
    citizenName: string;
    citizenPhone: string;
    citizenEmail?: string;
    isOfflineEntry?: boolean;
    campName?: string;
    district: string;
    taluk: string;
    locality: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    leadDepartmentId: string;
    photos?: string[];
  }): Promise<Grievance> {
    const ref = this.generateReferenceNumber();
    const targetDate = this.calculateTargetDate(data.leadDepartmentId);
    const now = new Date().toISOString();

    const newGrievance: Grievance = {
      id: `gr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      referenceNumber: ref,
      title: data.title,
      titleTa: data.titleTa,
      description: data.description,
      descriptionTa: data.descriptionTa,
      category: data.category,
      priority: data.priority,
      status: 'Submitted',
      citizenId: this.currentUser.role === 'citizen' ? this.currentUser.id : undefined,
      citizenName: data.citizenName,
      citizenPhone: data.citizenPhone,
      citizenEmail: data.citizenEmail,
      isOfflineEntry: data.isOfflineEntry || false,
      operatorId: data.isOfflineEntry ? this.currentUser.id : undefined,
      campName: data.campName,
      district: data.district || 'Tiruchirappalli',
      taluk: data.taluk,
      locality: data.locality,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      leadDepartmentId: data.leadDepartmentId,
      assignedOfficerId: 'user-ao', // Default to taluk Tahsildar / AO
      photos: data.photos || [],
      targetResolutionDate: targetDate,
      createdAt: now,
      updatedAt: now
    };

    this.grievances.unshift(newGrievance);

    // Record initial status history
    this.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      grievanceId: newGrievance.id,
      previousStatus: 'Submitted',
      newStatus: 'Submitted',
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: this.currentUser.role,
      reason: data.isOfflineEntry ? `Lodge in person at ${data.campName || 'Grievance Camp'}` : 'Lodged via Citizen Online Portal',
      createdAt: now
    });

    // Record audit log
    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'GRIEVANCE_SUBMITTED',
      entityType: 'grievance',
      entityId: newGrievance.id,
      performedBy: this.currentUser.fullName,
      userRole: this.currentUser.role,
      details: `Registered petition #${ref} in ${data.taluk} under category ${data.category}`,
      timestamp: now
    });

    // Create notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientId: this.currentUser.id,
      grievanceId: newGrievance.id,
      referenceNumber: ref,
      title: 'Grievance Registered',
      message: `Your grievance ${ref} has been received by Tiruchirappalli District Administration & Corporation.`,
      type: 'status_change',
      isRead: false,
      createdAt: now
    });

    // Also notify AO
    this.notifications.unshift({
      id: `notif-ao-${Date.now()}`,
      recipientId: 'user-ao',
      recipientRole: 'ao',
      grievanceId: newGrievance.id,
      referenceNumber: ref,
      title: 'New Grievance Assigned',
      message: `New complaint ${ref} (${data.category}) received in ${data.taluk}.`,
      type: 'assignment',
      isRead: false,
      createdAt: now
    });

    // Try Supabase insert if configured
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('grievances').insert({
          reference_number: newGrievance.referenceNumber,
          title: newGrievance.title,
          description: newGrievance.description,
          category: newGrievance.category,
          priority: newGrievance.priority,
          status: newGrievance.status,
          citizen_name: newGrievance.citizenName,
          citizen_phone: newGrievance.citizenPhone,
          taluk: newGrievance.taluk,
          locality: newGrievance.locality,
          address: newGrievance.address,
          latitude: newGrievance.latitude,
          longitude: newGrievance.longitude,
          lead_department_id: newGrievance.leadDepartmentId,
          target_resolution_date: newGrievance.targetResolutionDate
        });
      } catch (e) {
        console.warn('Supabase remote insert fallback to local state:', e);
      }
    }

    this.notify();
    return newGrievance;
  }

  // 2. Transition Status with strict verification rules
  async transitionStatus(
    grievanceId: string, 
    newStatus: GrievanceStatus, 
    reason: string
  ): Promise<boolean> {
    const grievance = this.grievances.find(g => g.id === grievanceId);
    if (!grievance) return false;

    // Strict Rule: Never allow transition to "Closed" without approved verification record!
    if (newStatus === 'Closed') {
      const hasVerification = this.verifications.some(
        v => v.grievanceId === grievanceId && v.decision === 'Approved'
      );
      if (!hasVerification) {
        throw new Error('A grievance cannot be marked Closed without formal supervisory verification and evidence review.');
      }
    }

    const previousStatus = grievance.status;
    const now = new Date().toISOString();

    grievance.status = newStatus;
    grievance.updatedAt = now;
    if (newStatus === 'Closed') {
      grievance.closedAt = now;
    }

    this.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      grievanceId,
      previousStatus,
      newStatus,
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: this.currentUser.role,
      reason,
      createdAt: now
    });

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'STATUS_TRANSITION',
      entityType: 'grievance',
      entityId: grievanceId,
      performedBy: this.currentUser.fullName,
      userRole: this.currentUser.role,
      details: `Status transitioned from ${previousStatus} to ${newStatus}. Reason: ${reason}`,
      timestamp: now
    });

    // Notify citizen
    if (grievance.citizenId) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        recipientId: grievance.citizenId,
        grievanceId,
        referenceNumber: grievance.referenceNumber,
        title: `Status Updated: ${newStatus}`,
        message: `Your grievance ${grievance.referenceNumber} status changed to ${newStatus}.`,
        type: 'status_change',
        isRead: false,
        createdAt: now
      });
    }

    this.notify();
    return true;
  }

  // 3. Assign or Reassign Officer
  assignOfficer(grievanceId: string, officerId: string, instructions: string) {
    const grievance = this.grievances.find(g => g.id === grievanceId);
    const officer = this.users.find(u => u.id === officerId);
    if (!grievance || !officer) return;

    grievance.assignedOfficerId = officerId;
    grievance.updatedAt = new Date().toISOString();
    if (grievance.status === 'Submitted' || grievance.status === 'Under Review') {
      grievance.status = 'Assigned';
    }

    this.comments.unshift({
      id: `cm-${Date.now()}`,
      grievanceId,
      authorId: this.currentUser.id,
      authorName: this.currentUser.fullName,
      authorRole: this.currentUser.role,
      authorDepartment: this.currentUser.designation || 'District Administration',
      content: `Assigned case to ${officer.fullName} (${officer.designation || officer.role.toUpperCase()}). Instructions: ${instructions}`,
      isInternal: true,
      createdAt: new Date().toISOString()
    });

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'OFFICER_ASSIGNED',
      entityType: 'assignment',
      entityId: grievanceId,
      performedBy: this.currentUser.fullName,
      userRole: this.currentUser.role,
      details: `Assigned to ${officer.fullName}. Notes: ${instructions}`,
      timestamp: new Date().toISOString()
    });

    this.notify();
  }

  // 4. Add Comment / Case Note
  addComment(grievanceId: string, content: string, isInternal: boolean) {
    const comment: GrievanceComment = {
      id: `cm-${Date.now()}`,
      grievanceId,
      authorId: this.currentUser.id,
      authorName: this.currentUser.fullName,
      authorRole: this.currentUser.role,
      authorDepartment: this.currentUser.designation || 'District Administration',
      content,
      isInternal,
      createdAt: new Date().toISOString()
    };
    this.comments.unshift(comment);
    this.notify();
  }

  // 5. Interdepartmental Coordination
  addDepartmentCollaboration(grievanceId: string, departmentId: string, taskDescription: string, dueDate?: string) {
    const grievanceDept: GrievanceDepartment = {
      id: `gd-${Date.now()}`,
      grievanceId,
      departmentId,
      isLead: false,
      taskDescription,
      dueDate,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    this.grievanceDepts.unshift(grievanceDept);

    const dept = this.departments.find(d => d.id === departmentId);
    this.addComment(
      grievanceId, 
      `Joint action request initiated for ${dept?.nameEn || 'Cooperating Department'}. Task: ${taskDescription}`, 
      true
    );

    this.notify();
  }

  // 6. Submit Resolution Evidence
  submitResolutionEvidence(data: {
    grievanceId: string;
    actionTaken: string;
    beforePhotoUrl?: string;
    afterPhotoUrl?: string;
    workOrderOrGoNumber?: string;
    completionDate: string;
    inspectionCoordinates?: { lat: number; lng: number };
  }): ResolutionEvidence {
    const grievance = this.grievances.find(g => g.id === data.grievanceId);
    if (!grievance) throw new Error('Grievance not found');

    const evidenceRecord: ResolutionEvidence = {
      id: `ev-${Date.now()}`,
      grievanceId: data.grievanceId,
      submittingOfficerId: this.currentUser.id,
      submittingOfficerName: `${this.currentUser.fullName} (${this.currentUser.designation || this.currentUser.role.toUpperCase()})`,
      actionTaken: data.actionTaken,
      beforePhotoUrl: data.beforePhotoUrl,
      afterPhotoUrl: data.afterPhotoUrl,
      workOrderOrGoNumber: data.workOrderOrGoNumber,
      completionDate: data.completionDate,
      inspectionCoordinates: data.inspectionCoordinates,
      submittedAt: new Date().toISOString()
    };

    this.evidence.unshift(evidenceRecord);
    grievance.status = 'Resolution Submitted';
    grievance.updatedAt = new Date().toISOString();

    this.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      grievanceId: data.grievanceId,
      previousStatus: 'In Progress',
      newStatus: 'Resolution Submitted',
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: this.currentUser.role,
      reason: `Engineering work executed per order ${data.workOrderOrGoNumber || 'Field Order'}. Evidence submitted for supervisory review.`,
      createdAt: new Date().toISOString()
    });

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'EVIDENCE_SUBMITTED',
      entityType: 'evidence',
      entityId: evidenceRecord.id,
      performedBy: this.currentUser.fullName,
      userRole: this.currentUser.role,
      details: `Resolution evidence uploaded with completion voucher ${data.workOrderOrGoNumber || 'N/A'}`,
      timestamp: new Date().toISOString()
    });

    // Notify RDO and DRO for verification
    this.notifications.unshift({
      id: `notif-rev-${Date.now()}`,
      recipientId: 'user-rdo',
      recipientRole: 'rdo',
      grievanceId: grievance.id,
      referenceNumber: grievance.referenceNumber,
      title: 'Resolution Evidence Submitted',
      message: `Evidence submitted for ${grievance.referenceNumber}. Requires supervisory verification.`,
      type: 'evidence_submitted',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    this.notify();
    return evidenceRecord;
  }

  // 7. Supervisory Verification
  verifyResolution(data: {
    grievanceId: string;
    evidenceId: string;
    decision: 'Approved' | 'Rejected' | 'Needs Modification';
    decisionNotes: string;
  }): VerificationRecord {
    const grievance = this.grievances.find(g => g.id === data.grievanceId);
    if (!grievance) throw new Error('Grievance not found');

    const record: VerificationRecord = {
      id: `vr-${Date.now()}`,
      grievanceId: data.grievanceId,
      evidenceId: data.evidenceId,
      reviewerId: this.currentUser.id,
      reviewerName: this.currentUser.fullName,
      reviewerRole: this.currentUser.role,
      decision: data.decision,
      decisionNotes: data.decisionNotes,
      verifiedAt: new Date().toISOString()
    };

    this.verifications.unshift(record);

    if (data.decision === 'Approved') {
      grievance.status = 'Closed';
      grievance.closedAt = new Date().toISOString();
      grievance.updatedAt = new Date().toISOString();

      this.statusHistory.unshift({
        id: `sh-${Date.now()}`,
        grievanceId: data.grievanceId,
        previousStatus: 'Resolution Submitted',
        newStatus: 'Closed',
        actorId: this.currentUser.id,
        actorName: this.currentUser.fullName,
        actorRole: this.currentUser.role,
        reason: `Supervisory verification approved by ${this.currentUser.fullName}. ${data.decisionNotes}`,
        createdAt: new Date().toISOString()
      });
    } else if (data.decision === 'Rejected') {
      grievance.status = 'In Progress';
      grievance.updatedAt = new Date().toISOString();

      this.statusHistory.unshift({
        id: `sh-${Date.now()}`,
        grievanceId: data.grievanceId,
        previousStatus: 'Resolution Submitted',
        newStatus: 'In Progress',
        actorId: this.currentUser.id,
        actorName: this.currentUser.fullName,
        actorRole: this.currentUser.role,
        reason: `Resolution rejected in supervisory check: ${data.decisionNotes}. Returned to field officer.`,
        createdAt: new Date().toISOString()
      });
    } else {
      grievance.status = 'Awaiting Evidence';
      grievance.updatedAt = new Date().toISOString();
    }

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: `VERIFICATION_${data.decision.toUpperCase()}`,
      entityType: 'verification',
      entityId: record.id,
      performedBy: this.currentUser.fullName,
      userRole: this.currentUser.role,
      details: `Decision: ${data.decision}. Remarks: ${data.decisionNotes}`,
      timestamp: new Date().toISOString()
    });

    this.notify();
    return record;
  }

  // 8. Escalate
  escalateGrievance(grievanceId: string, toRole: UserRole, reason: string) {
    const grievance = this.grievances.find(g => g.id === grievanceId);
    if (!grievance) return;

    grievance.isEscalated = true;
    grievance.escalationReason = reason;
    grievance.status = 'Escalated';
    grievance.updatedAt = new Date().toISOString();

    const record: EscalationRecord = {
      id: `esc-${Date.now()}`,
      grievanceId,
      escalatedFromRole: this.currentUser.role,
      escalatedToRole: toRole,
      escalatedById: this.currentUser.id,
      escalatedByName: this.currentUser.fullName,
      reason,
      escalatedAt: new Date().toISOString()
    };
    this.escalations.unshift(record);

    this.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      grievanceId,
      previousStatus: 'In Progress',
      newStatus: 'Escalated',
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: this.currentUser.role,
      reason: `Escalated to ${toRole.toUpperCase()}. ${reason}`,
      createdAt: new Date().toISOString()
    });

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'GRIEVANCE_ESCALATED',
      entityType: 'grievance',
      entityId: grievanceId,
      performedBy: this.currentUser.fullName,
      userRole: this.currentUser.role,
      details: `Escalated from ${this.currentUser.role} to ${toRole}. Reason: ${reason}`,
      timestamp: new Date().toISOString()
    });

    this.notify();
  }

  // 9. Reopen / Appeal by Citizen
  reopenGrievance(grievanceId: string, reason: string) {
    const grievance = this.grievances.find(g => g.id === grievanceId);
    if (!grievance) return;

    grievance.isReopened = true;
    grievance.reopenReason = reason;
    grievance.status = 'Reopened';
    grievance.updatedAt = new Date().toISOString();

    this.statusHistory.unshift({
      id: `sh-${Date.now()}`,
      grievanceId,
      previousStatus: 'Closed',
      newStatus: 'Reopened',
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: this.currentUser.role,
      reason: `Citizen Appeal: ${reason}`,
      createdAt: new Date().toISOString()
    });

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'GRIEVANCE_REOPENED',
      entityType: 'grievance',
      entityId: grievanceId,
      performedBy: this.currentUser.fullName,
      userRole: this.currentUser.role,
      details: `Appeal lodged by citizen: ${reason}`,
      timestamp: new Date().toISOString()
    });

    this.notify();
  }

  // 10. Submit Feedback
  submitFeedback(grievanceId: string, rating: number, comment: string) {
    const grievance = this.grievances.find(g => g.id === grievanceId);
    if (!grievance) return;

    grievance.satisfactionRating = rating;
    grievance.feedbackComment = comment;
    grievance.updatedAt = new Date().toISOString();

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      action: 'CITIZEN_FEEDBACK_SUBMITTED',
      entityType: 'grievance',
      entityId: grievanceId,
      performedBy: this.currentUser.fullName,
      userRole: 'citizen',
      details: `Rating: ${rating}/5. Feedback: ${comment}`,
      timestamp: new Date().toISOString()
    });

    this.notify();
  }

  // Mark notification read
  markNotificationRead(id: string) {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.isRead = true;
      this.notify();
    }
  }

  // CSV Report Generator
  exportGrievancesCsv(): string {
    const headers = [
      'Reference Number',
      'Title',
      'Category',
      'Priority',
      'Status',
      'Taluk',
      'Locality',
      'Lead Department',
      'Citizen Name',
      'Citizen Phone',
      'Created Date',
      'Target SLA Date',
      'Closed Date',
      'Is Escalated',
      'Is Reopened'
    ];

    const rows = this.grievances.map(g => {
      const dept = this.departments.find(d => d.id === g.leadDepartmentId)?.nameEn || g.leadDepartmentId;
      return [
        `"${g.referenceNumber}"`,
        `"${g.title.replace(/"/g, '""')}"`,
        `"${g.category}"`,
        `"${g.priority}"`,
        `"${g.status}"`,
        `"${g.taluk}"`,
        `"${g.locality.replace(/"/g, '""')}"`,
        `"${dept}"`,
        `"${g.citizenName}"`,
        `"${g.citizenPhone}"`,
        `"${g.createdAt.split('T')[0]}"`,
        `"${g.targetResolutionDate.split('T')[0]}"`,
        `"${g.closedAt ? g.closedAt.split('T')[0] : ''}"`,
        `"${g.isEscalated ? 'YES' : 'NO'}"`,
        `"${g.isReopened ? 'YES' : 'NO'}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // Reset demo data
  resetDemoData() {
    localStorage.clear();
    this.departments = INITIAL_DEPARTMENTS;
    this.adminUnits = INITIAL_ADMIN_UNITS;
    this.users = DEMO_USERS;
    this.grievances = INITIAL_GRIEVANCES;
    this.statusHistory = INITIAL_STATUS_HISTORY;
    this.comments = INITIAL_COMMENTS;
    this.grievanceDepts = [];
    this.evidence = INITIAL_EVIDENCE;
    this.verifications = INITIAL_VERIFICATIONS;
    this.escalations = [];
    this.notifications = INITIAL_NOTIFICATIONS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.currentUser = DEMO_USERS[0];
    this.notify();
  }
}

export const store = new PodhunalamStore();
