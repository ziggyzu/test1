// ============================================================
// TYPES — Class Companion
// ============================================================

export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: UserRole;
  avatarUrl: string;
  phone?: string;
  whatsapp?: string;
  skills: string[];
  department: string;
  batch: string;
  section: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  totalClasses: number;
  creditHours: number;
}

export interface ScheduleSlot {
  id: string;
  courseId: string;
  day: string; // 'Sunday' | 'Monday' ... 
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  room: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  courseId: string;
  date: string; // ISO
  status: 'present' | 'absent';
}

export interface ClassTest {
  id: string;
  courseId: string;
  title: string;
  date: string; // ISO
  description: string;
  createdBy: string;
  marksTotal: number;
  status: 'upcoming' | 'completed';
}

export interface TestVote {
  id: string;
  testId: string;
  userId: string;
  vote: 'up' | 'down';
}

export interface TestMark {
  id: string;
  testId: string;
  userId: string;
  marks: number;
}

export interface Deadline {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string; // ISO
  submissionLink?: string;
  createdBy: string;
}

export interface DeadlineCompletion {
  id: string;
  deadlineId: string;
  userId: string;
  completedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  feeAmount: number;
  createdBy: string;
}

export interface EventPayment {
  id: string;
  eventId: string;
  userId: string;
  paid: boolean;
  paidAt?: string;
}

export interface Note {
  id: string;
  courseId: string;
  title: string;
  description: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
}

export interface NoteVote {
  id: string;
  noteId: string;
  userId: string;
  vote: 'up' | 'down';
}

export interface WakeUpPriority {
  id: string;
  userId: string;
  friendId: string;
  priority: number; // 1-5
}

export interface TeamPost {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'hackathon' | 'study-group';
  createdBy: string;
  maxMembers: number;
  whatsappLink?: string;
  createdAt: string;
}

// UGC Grading System
export const UGC_GRADES = [
  { grade: 'A+', minMark: 80, gpa: 4.00 },
  { grade: 'A',  minMark: 75, gpa: 3.75 },
  { grade: 'A-', minMark: 70, gpa: 3.50 },
  { grade: 'B+', minMark: 65, gpa: 3.25 },
  { grade: 'B',  minMark: 60, gpa: 3.00 },
  { grade: 'B-', minMark: 55, gpa: 2.75 },
  { grade: 'C+', minMark: 50, gpa: 2.50 },
  { grade: 'C',  minMark: 45, gpa: 2.25 },
  { grade: 'D',  minMark: 40, gpa: 2.00 },
  { grade: 'F',  minMark: 0,  gpa: 0.00 },
] as const;
