export type UserRole = 'applicant' | 'student' | 'visitor';

export type AppTab = 'chat' | 'admissions' | 'campus' | 'courses' | 'directory' | 'offline';

export interface College {
  id: string;
  name: string;
  shortName: string;
  color: string;
  dean: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  iconName: string;
  programs: Program[];
}

export interface Program {
  id: string;
  collegeId: string;
  name: string;
  degree: string;
  durationYears: number;
  jambCutOff: number;
  oLevelRequirements: string[];
  utmeSubjects: string[];
  careerProspects: string[];
  overview: string;
  tuitionRange: string;
  isPopular?: boolean;
}

export interface CampusLandmark {
  id: string;
  name: string;
  category: 'academic' | 'medical' | 'hostel' | 'administrative' | 'recreational' | 'dining' | 'service';
  zone: string;
  x: number; // SVG map percentage X (0-100)
  y: number; // SVG map percentage Y (0-100)
  description: string;
  hours: string;
  features: string[];
  contact?: string;
  color: string;
  isImportant?: boolean;
}

export interface DirectoryContact {
  id: string;
  name: string;
  title: string;
  department: string;
  category: 'executive' | 'faculty' | 'administration' | 'student_services' | 'emergency';
  email: string;
  phone: string;
  office: string;
  availability: string;
  responsibilities?: string;
}

export interface AdmissionStep {
  stepNumber: number;
  title: string;
  shortDesc: string;
  fullDesc: string;
  link?: string;
  actionText?: string;
  tips: string[];
  timeline: string;
}

export interface FeeSchedule {
  collegeName: string;
  degree: string;
  tuitionPerSession: number;
  installment1: number; // 50%
  installment2: number; // 30%
  installment3: number; // 20%
  includes: string[];
}

export interface Scholarship {
  id: string;
  title: string;
  amount: string;
  eligibility: string;
  deadline: string;
  description: string;
  category: 'merit' | 'deans_list' | 'sports' | 'indigent';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    tab?: AppTab;
    query?: string;
  }[];
  sources?: RAGSourceCitation[];
}

export interface RAGSourceCitation {
  title: string;
  snippet: string;
  sourceType: 'official_abuad_web' | 'uploaded_doc';
  docName?: string;
  url?: string;
}

export interface RAGDocument {
  id: string;
  name: string;
  sizeBytes: number;
  uploadedAt: string;
  chunksCount: number;
  rawText: string;
  category: 'circular' | 'syllabus' | 'handbook' | 'fees' | 'admissions' | 'general';
  active: boolean;
}

export interface RAGChunk {
  id: string;
  docId: string;
  docName: string;
  sourceType: 'official_abuad_web' | 'uploaded_doc';
  url?: string;
  text: string;
  keywords: string[];
}

export type AvatarPose = 'speaking' | 'listening' | 'thinking' | 'idle';

export interface SavedBookmark {
  id: string;
  title: string;
  category: string;
  details: string;
  savedAt: string;
  type: 'course' | 'landmark' | 'contact' | 'guide';
}
