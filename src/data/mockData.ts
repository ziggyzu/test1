import type {
  User, Course, ScheduleSlot, AttendanceRecord, ClassTest,
  TestVote, TestMark, Deadline, DeadlineCompletion, Event,
  EventPayment, Note, NoteVote, TeamPost, WakeUpPriority,
} from '../types';

// ─── USERS ───
export const USERS: User[] = [
  { id: 'u1', name: 'Rafiq Ahmed', email: 'rafiq@cse.uiu.ac.bd', studentId: '011221001', role: 'admin', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Rafiq', phone: '01712345678', whatsapp: '8801712345678', skills: ['React', 'Node.js', 'Python'], department: 'CSE', batch: '48', section: 'A' },
  { id: 'u2', name: 'Fatima Begum', email: 'fatima@cse.uiu.ac.bd', studentId: '011221002', role: 'student', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Fatima', phone: '01812345679', whatsapp: '8801812345679', skills: ['UI/UX', 'Figma', 'Flutter'], department: 'CSE', batch: '48', section: 'A' },
  { id: 'u3', name: 'Kamal Hossain', email: 'kamal@cse.uiu.ac.bd', studentId: '011221003', role: 'student', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Kamal', phone: '01912345680', whatsapp: '8801912345680', skills: ['Java', 'Spring Boot', 'MySQL'], department: 'CSE', batch: '48', section: 'A' },
  { id: 'u4', name: 'Nusrat Jahan', email: 'nusrat@cse.uiu.ac.bd', studentId: '011221004', role: 'student', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Nusrat', phone: '01612345681', whatsapp: '8801612345681', skills: ['Machine Learning', 'Python', 'TensorFlow'], department: 'CSE', batch: '48', section: 'A' },
  { id: 'u5', name: 'Imran Khan', email: 'imran@cse.uiu.ac.bd', studentId: '011221005', role: 'student', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Imran', phone: '01512345682', whatsapp: '8801512345682', skills: ['C++', 'Competitive Programming'], department: 'CSE', batch: '48', section: 'A' },
  { id: 'u6', name: 'Ayesha Siddiqua', email: 'ayesha@cse.uiu.ac.bd', studentId: '011221006', role: 'student', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ayesha', phone: '01312345683', whatsapp: '8801312345683', skills: ['React Native', 'TypeScript'], department: 'CSE', batch: '48', section: 'A' },
  { id: 'u7', name: 'Tanvir Islam', email: 'tanvir@cse.uiu.ac.bd', studentId: '011221007', role: 'student', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Tanvir', phone: '01412345684', whatsapp: '8801412345684', skills: ['DevOps', 'Docker', 'AWS'], department: 'CSE', batch: '48', section: 'A' },
  { id: 'u8', name: 'Mithila Rahman', email: 'mithila@cse.uiu.ac.bd', studentId: '011221008', role: 'student', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Mithila', phone: '01112345685', whatsapp: '8801112345685', skills: ['Data Science', 'R', 'Tableau'], department: 'CSE', batch: '48', section: 'A' },
  { id: 'u9', name: 'Sakib Al Hasan', email: 'sakib@cse.uiu.ac.bd', studentId: '011221009', role: 'student', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Sakib', phone: '01712345686', whatsapp: '8801712345686', skills: ['Kotlin', 'Android'], department: 'CSE', batch: '48', section: 'A' },
  { id: 'u10', name: 'Labiba Akter', email: 'labiba@cse.uiu.ac.bd', studentId: '011221010', role: 'student', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Labiba', phone: '01812345687', whatsapp: '8801812345687', skills: ['Cybersecurity', 'Networking'], department: 'CSE', batch: '48', section: 'A' },
  { id: 'u11', name: 'Arif Chowdhury', email: 'arif@cse.uiu.ac.bd', studentId: '011221011', role: 'student', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Arif', phone: '01912345688', whatsapp: '8801912345688', skills: ['Go', 'Microservices'], department: 'CSE', batch: '48', section: 'A' },
  { id: 'u12', name: 'Shaira Noor', email: 'shaira@cse.uiu.ac.bd', studentId: '011221012', role: 'student', avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Shaira', phone: '01612345689', whatsapp: '8801612345689', skills: ['Blockchain', 'Solidity'], department: 'CSE', batch: '48', section: 'A' },
];

// ─── COURSES ───
export const COURSES: Course[] = [
  { id: 'c1', code: 'CSE 3101', name: 'Data Structures', instructor: 'Dr. Mahbub Alam', totalClasses: 40, creditHours: 3 },
  { id: 'c2', code: 'CSE 3102', name: 'Algorithms', instructor: 'Prof. Nazma Khatun', totalClasses: 40, creditHours: 3 },
  { id: 'c3', code: 'CSE 3201', name: 'Database Systems', instructor: 'Dr. Karim Uddin', totalClasses: 36, creditHours: 3 },
  { id: 'c4', code: 'CSE 3202', name: 'Operating Systems', instructor: 'Prof. Rahim Khan', totalClasses: 36, creditHours: 3 },
  { id: 'c5', code: 'CSE 3301', name: 'Computer Networks', instructor: 'Dr. Selina Akter', totalClasses: 32, creditHours: 3 },
  { id: 'c6', code: 'ENG 2001', name: 'Technical Writing', instructor: 'Ms. Farzana Islam', totalClasses: 28, creditHours: 2 },
];

// ─── SCHEDULE ───
const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
export const SCHEDULE: ScheduleSlot[] = [
  { id: 's1', courseId: 'c1', day: todayName, startTime: '09:00', endTime: '10:20', room: 'Room 301' },
  { id: 's2', courseId: 'c2', day: todayName, startTime: '10:30', endTime: '11:50', room: 'Room 302' },
  { id: 's3', courseId: 'c3', day: todayName, startTime: '12:00', endTime: '13:20', room: 'Lab 201' },
  { id: 's4', courseId: 'c4', day: todayName, startTime: '14:00', endTime: '15:20', room: 'Room 401' },
  { id: 's5', courseId: 'c5', day: 'Monday', startTime: '09:00', endTime: '10:20', room: 'Room 501' },
  { id: 's6', courseId: 'c6', day: 'Wednesday', startTime: '11:00', endTime: '12:00', room: 'Room 102' },
  { id: 's7', courseId: 'c1', day: 'Tuesday', startTime: '09:00', endTime: '10:20', room: 'Room 301' },
  { id: 's8', courseId: 'c2', day: 'Thursday', startTime: '10:30', endTime: '11:50', room: 'Room 302' },
];

// ─── ATTENDANCE ───
export const initialAttendance: AttendanceRecord[] = [
  { id: 'a1', userId: 'u2', courseId: 'c1', date: '2026-03-01', status: 'present' },
  { id: 'a2', userId: 'u2', courseId: 'c1', date: '2026-03-03', status: 'present' },
  { id: 'a3', userId: 'u2', courseId: 'c1', date: '2026-03-05', status: 'absent' },
  { id: 'a4', userId: 'u2', courseId: 'c2', date: '2026-03-02', status: 'present' },
  { id: 'a5', userId: 'u2', courseId: 'c2', date: '2026-03-04', status: 'absent' },
  { id: 'a6', userId: 'u2', courseId: 'c3', date: '2026-03-01', status: 'present' },
  { id: 'a7', userId: 'u2', courseId: 'c4', date: '2026-03-02', status: 'absent' },
  { id: 'a8', userId: 'u2', courseId: 'c4', date: '2026-03-04', status: 'absent' },
  { id: 'a9', userId: 'u2', courseId: 'c5', date: '2026-03-03', status: 'present' },
];

// ─── CLASS TESTS ───
export const initialClassTests: ClassTest[] = [
  { id: 'ct1', courseId: 'c1', title: 'CT-1: Linked Lists & Trees', date: '2026-03-20T09:00:00', description: 'Covers chapters 4-6. Bring calculator.', createdBy: 'u1', marksTotal: 20, status: 'upcoming' },
  { id: 'ct2', courseId: 'c2', title: 'CT-1: Sorting Algorithms', date: '2026-03-22T10:30:00', description: 'Quick sort, merge sort, heap sort analysis.', createdBy: 'u1', marksTotal: 15, status: 'upcoming' },
  { id: 'ct3', courseId: 'c3', title: 'CT-1: ER Diagrams', date: '2026-03-10T12:00:00', description: 'Normalization and ER modeling.', createdBy: 'u1', marksTotal: 20, status: 'completed' },
];

export const initialTestVotes: TestVote[] = [
  { id: 'tv1', testId: 'ct1', userId: 'u2', vote: 'up' },
  { id: 'tv2', testId: 'ct1', userId: 'u3', vote: 'up' },
  { id: 'tv3', testId: 'ct1', userId: 'u4', vote: 'down' },
  { id: 'tv4', testId: 'ct2', userId: 'u2', vote: 'down' },
];

export const initialTestMarks: TestMark[] = [
  { id: 'tm1', testId: 'ct3', userId: 'u2', marks: 17 },
  { id: 'tm2', testId: 'ct3', userId: 'u3', marks: 14 },
  { id: 'tm3', testId: 'ct3', userId: 'u4', marks: 19 },
];

// ─── DEADLINES ───
export const initialDeadlines: Deadline[] = [
  { id: 'd1', courseId: 'c1', title: 'Assignment 2: BST Implementation', description: 'Implement AVL tree with insert, delete, search.', dueDate: '2026-03-18T23:59:00', submissionLink: 'https://classroom.google.com', createdBy: 'u1' },
  { id: 'd2', courseId: 'c3', title: 'Project Proposal: E-Commerce DB', description: 'Submit ER diagram and schema design.', dueDate: '2026-03-25T23:59:00', submissionLink: 'https://classroom.google.com', createdBy: 'u1' },
  { id: 'd3', courseId: 'c6', title: 'Essay: AI Ethics in Bangladesh', description: '2000 words, APA format.', dueDate: '2026-03-30T17:00:00', createdBy: 'u1' },
];

export const initialDeadlineCompletions: DeadlineCompletion[] = [];

// ─── EVENTS ───
export const initialEvents: Event[] = [
  { id: 'e1', title: 'Batch Tour — Cox\'s Bazar', description: '3-day trip to Cox\'s Bazar. Transport + hotel included.', date: '2026-04-15', feeAmount: 3500, createdBy: 'u1' },
  { id: 'e2', title: 'Farewell Party — Batch 44', description: 'Farewell for seniors at university auditorium.', date: '2026-04-01', feeAmount: 500, createdBy: 'u1' },
];

export const initialEventPayments: EventPayment[] = [
  { id: 'ep1', eventId: 'e1', userId: 'u2', paid: true, paidAt: '2026-03-10' },
  { id: 'ep2', eventId: 'e1', userId: 'u3', paid: false },
  { id: 'ep3', eventId: 'e1', userId: 'u4', paid: true, paidAt: '2026-03-11' },
  { id: 'ep4', eventId: 'e1', userId: 'u5', paid: false },
  { id: 'ep5', eventId: 'e1', userId: 'u6', paid: true, paidAt: '2026-03-12' },
  { id: 'ep6', eventId: 'e2', userId: 'u2', paid: true, paidAt: '2026-03-08' },
  { id: 'ep7', eventId: 'e2', userId: 'u3', paid: true, paidAt: '2026-03-09' },
  { id: 'ep8', eventId: 'e2', userId: 'u4', paid: false },
];

// ─── NOTES ───
export const initialNotes: Note[] = [
  { id: 'n1', courseId: 'c1', title: 'Linked List Complete Notes', description: 'Covers singly, doubly, circular LL with diagrams.', fileUrl: '#', uploadedBy: 'u2', createdAt: '2026-03-05' },
  { id: 'n2', courseId: 'c2', title: 'Sorting Algorithms Cheat Sheet', description: 'Time/space complexity comparison table.', fileUrl: '#', uploadedBy: 'u5', createdAt: '2026-03-07' },
  { id: 'n3', courseId: 'c3', title: 'SQL Practice Problems', description: '50 SQL queries from easy to hard.', fileUrl: '#', uploadedBy: 'u4', createdAt: '2026-03-08' },
  { id: 'n4', courseId: 'c1', title: 'Tree Traversal Visualized', description: 'BFS & DFS with step-by-step diagrams.', fileUrl: '#', uploadedBy: 'u3', createdAt: '2026-03-10' },
];

export const initialNoteVotes: NoteVote[] = [
  { id: 'nv1', noteId: 'n1', userId: 'u3', vote: 'up' },
  { id: 'nv2', noteId: 'n1', userId: 'u4', vote: 'up' },
  { id: 'nv3', noteId: 'n1', userId: 'u5', vote: 'up' },
  { id: 'nv4', noteId: 'n2', userId: 'u2', vote: 'up' },
  { id: 'nv5', noteId: 'n2', userId: 'u3', vote: 'up' },
  { id: 'nv6', noteId: 'n3', userId: 'u2', vote: 'up' },
  { id: 'nv7', noteId: 'n4', userId: 'u2', vote: 'down' },
];

// ─── TEAM POSTS ───
export const initialTeamPosts: TeamPost[] = [
  { id: 'tp1', title: 'Need 2 devs for Hackathon BUET CSE Fest', description: 'Looking for React and Node.js developers. Theme: Ed-Tech.', type: 'hackathon', createdBy: 'u3', maxMembers: 4, whatsappLink: 'https://wa.me/8801912345680', createdAt: '2026-03-12' },
  { id: 'tp2', title: 'Study Group: Algorithm Practice', description: 'Daily 1-hour practice for upcoming CT. LeetCode medium+hard.', type: 'study-group', createdBy: 'u5', maxMembers: 6, whatsappLink: 'https://wa.me/8801512345682', createdAt: '2026-03-11' },
  { id: 'tp3', title: 'DB Project Partner Needed', description: 'E-Commerce database project. Need someone good at normalization.', type: 'project', createdBy: 'u4', maxMembers: 2, whatsappLink: 'https://wa.me/8801612345681', createdAt: '2026-03-10' },
];

// ─── WAKE UP ───
export const initialWakeUpPriorities: WakeUpPriority[] = [
  { id: 'w1', userId: 'u2', friendId: 'u3', priority: 1 },
  { id: 'w2', userId: 'u2', friendId: 'u5', priority: 2 },
  { id: 'w3', userId: 'u2', friendId: 'u4', priority: 3 },
  { id: 'w4', userId: 'u2', friendId: 'u6', priority: 4 },
  { id: 'w5', userId: 'u2', friendId: 'u7', priority: 5 },
];
