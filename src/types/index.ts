export type UserRole = 
  | 'citizen'
  | 'operator'
  | 'ao'
  | 'rdo'
  | 'dro'
  | 'collector'
  | 'admin';

export type GrievanceStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Department'
  | 'Awaiting Evidence'
  | 'Resolution Submitted'
  | 'Reopened'
  | 'Escalated'
  | 'Closed';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Emergency';

export type GrievanceCategory =
  | 'roads'
  | 'drinking_water'
  | 'sanitation'
  | 'drainage'
  | 'streetlights'
  | 'waste_management'
  | 'public_infrastructure'
  | 'revenue_records'
  | 'electricity'
  | 'other';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  fullNameTa: string;
  phone?: string;
  role: UserRole;
  departmentId?: string;
  administrativeUnitId?: string;
  designation?: string;
  designationTa?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  code: string;
  nameEn: string;
  nameTa: string;
  leadOfficerTitle: string;
  leadOfficerTitleTa: string;
  contactEmail: string;
  targetDaysDefault: number;
}

export interface AdministrativeUnit {
  id: string;
  nameEn: string;
  nameTa: string;
  type: 'District' | 'Division' | 'Taluk' | 'Block' | 'Municipality';
  parentId?: string;
  code: string;
}

export interface Grievance {
  id: string;
  referenceNumber: string; // e.g. TN-CGL-2026-0842
  title: string;
  titleTa?: string;
  description: string;
  descriptionTa?: string;
  category: GrievanceCategory;
  priority: PriorityLevel;
  status: GrievanceStatus;
  
  // Citizen details
  citizenId?: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail?: string;
  isOfflineEntry?: boolean;
  operatorId?: string;
  campName?: string;
  
  // Location
  district: string;
  taluk: string;
  locality: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  
  // Department & Lead Officer
  leadDepartmentId: string;
  assignedOfficerId?: string;
  
  // Attachments
  photos: string[];
  
  // Timestamps & SLA
  targetResolutionDate: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  
  // Flags
  isEscalated?: boolean;
  escalationReason?: string;
  isReopened?: boolean;
  reopenReason?: string;
  satisfactionRating?: number;
  feedbackComment?: string;
}

export interface GrievanceStatusHistory {
  id: string;
  grievanceId: string;
  previousStatus: GrievanceStatus;
  newStatus: GrievanceStatus;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  reason: string;
  createdAt: string;
}

export interface GrievanceComment {
  id: string;
  grievanceId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorDepartment?: string;
  content: string;
  isInternal: boolean; // internal officer vs citizen visible update
  createdAt: string;
}

export interface GrievanceDepartment {
  id: string;
  grievanceId: string;
  departmentId: string;
  isLead: boolean;
  assignedOfficerId?: string;
  taskDescription: string;
  dueDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
}

export interface ResolutionEvidence {
  id: string;
  grievanceId: string;
  submittingOfficerId: string;
  submittingOfficerName: string;
  actionTaken: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  workOrderOrGoNumber?: string;
  completionDate: string;
  inspectionCoordinates?: {
    lat: number;
    lng: number;
  };
  submittedAt: string;
}

export interface VerificationRecord {
  id: string;
  grievanceId: string;
  evidenceId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserRole;
  decision: 'Approved' | 'Rejected' | 'Needs Modification';
  decisionNotes: string;
  verifiedAt: string;
}

export interface EscalationRecord {
  id: string;
  grievanceId: string;
  escalatedFromRole: UserRole;
  escalatedToRole: UserRole;
  escalatedById: string;
  escalatedByName: string;
  reason: string;
  escalatedAt: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  recipientRole?: UserRole;
  grievanceId: string;
  referenceNumber: string;
  title: string;
  message: string;
  type: 'assignment' | 'status_change' | 'escalation' | 'evidence_submitted' | 'verified' | 'overdue';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'grievance' | 'evidence' | 'assignment' | 'verification' | 'user' | 'department';
  entityId: string;
  performedBy: string;
  userRole: UserRole;
  details: string;
  timestamp: string;
}
