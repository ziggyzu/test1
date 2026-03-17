import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Batch, Course, ScheduleSlot, Deadline, Resource,
  Event, ClassTest, Note, TeamPost, User,
} from '../types';

// ─────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────

/** Generate a random batch code like BCH-XA91 */
export function generateBatchCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BCH-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ─────────────────────────────────────────────────
// BATCH
// ─────────────────────────────────────────────────

export async function createBatch(name: string, adminId: string): Promise<Batch> {
  const code = generateBatchCode();
  const batchRef = doc(collection(db, 'batches'));
  const batch: Batch = {
    id: batchRef.id,
    name,
    code,
    adminId,
    createdAt: new Date().toISOString(),
  };
  await setDoc(batchRef, batch);
  return batch;
}

export async function getBatch(batchId: string): Promise<Batch | null> {
  const snap = await getDoc(doc(db, 'batches', batchId));
  if (!snap.exists()) return null;
  return snap.data() as Batch;
}

export async function getBatchByCode(code: string): Promise<Batch | null> {
  const q = query(collection(db, 'batches'), where('code', '==', code.toUpperCase().trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Batch;
}

// ─────────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────────

export async function getCourses(batchId: string): Promise<Course[]> {
  const q = query(collection(db, 'courses'), where('batchId', '==', batchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
}

export async function addCourse(course: Omit<Course, 'id'>): Promise<Course> {
  const ref = await addDoc(collection(db, 'courses'), course);
  return { id: ref.id, ...course };
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<void> {
  await updateDoc(doc(db, 'courses', id), data);
}

export async function deleteCourse(id: string): Promise<void> {
  await deleteDoc(doc(db, 'courses', id));
}

// ─────────────────────────────────────────────────
// SCHEDULE / ROUTINE
// ─────────────────────────────────────────────────

export async function getSchedule(batchId: string): Promise<ScheduleSlot[]> {
  const q = query(collection(db, 'schedule'), where('batchId', '==', batchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ScheduleSlot));
}

export async function addScheduleSlot(slot: Omit<ScheduleSlot, 'id'>): Promise<ScheduleSlot> {
  const ref = await addDoc(collection(db, 'schedule'), slot);
  return { id: ref.id, ...slot };
}

export async function updateScheduleSlot(id: string, data: Partial<ScheduleSlot>): Promise<void> {
  await updateDoc(doc(db, 'schedule', id), data);
}

export async function deleteScheduleSlot(id: string): Promise<void> {
  await deleteDoc(doc(db, 'schedule', id));
}

// ─────────────────────────────────────────────────
// DEADLINES
// ─────────────────────────────────────────────────

export async function getDeadlines(batchId: string): Promise<Deadline[]> {
  const q = query(collection(db, 'deadlines'), where('batchId', '==', batchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Deadline));
}

export async function addDeadline(deadline: Omit<Deadline, 'id'>): Promise<Deadline> {
  const ref = await addDoc(collection(db, 'deadlines'), deadline);
  return { id: ref.id, ...deadline };
}

export async function updateDeadline(id: string, data: Partial<Deadline>): Promise<void> {
  await updateDoc(doc(db, 'deadlines', id), data);
}

export async function deleteDeadline(id: string): Promise<void> {
  await deleteDoc(doc(db, 'deadlines', id));
}

// ─────────────────────────────────────────────────
// RESOURCES
// ─────────────────────────────────────────────────

export async function getResources(batchId: string): Promise<Resource[]> {
  const q = query(collection(db, 'resources'), where('batchId', '==', batchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource));
}

export async function addResource(resource: Omit<Resource, 'id'>): Promise<Resource> {
  const ref = await addDoc(collection(db, 'resources'), resource);
  return { id: ref.id, ...resource };
}

export async function updateResource(id: string, data: Partial<Resource>): Promise<void> {
  await updateDoc(doc(db, 'resources', id), data);
}

export async function deleteResource(id: string): Promise<void> {
  await deleteDoc(doc(db, 'resources', id));
}

// ─────────────────────────────────────────────────
// CLASS TESTS
// ─────────────────────────────────────────────────

export async function getClassTests(batchId: string): Promise<ClassTest[]> {
  const q = query(collection(db, 'classTests'), where('batchId', '==', batchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassTest));
}

export async function addClassTest(test: Omit<ClassTest, 'id'>): Promise<ClassTest> {
  const ref = await addDoc(collection(db, 'classTests'), test);
  return { id: ref.id, ...test };
}

export async function deleteClassTest(id: string): Promise<void> {
  await deleteDoc(doc(db, 'classTests', id));
}

// ─────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────

export async function getEvents(batchId: string): Promise<Event[]> {
  const q = query(collection(db, 'events'), where('batchId', '==', batchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Event));
}

export async function addEvent(event: Omit<Event, 'id'>): Promise<Event> {
  const ref = await addDoc(collection(db, 'events'), event);
  return { id: ref.id, ...event };
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id));
}

// ─────────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────────

export async function getNotes(batchId: string): Promise<Note[]> {
  const q = query(collection(db, 'notes'), where('batchId', '==', batchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Note));
}

export async function addNote(note: Omit<Note, 'id'>): Promise<Note> {
  const ref = await addDoc(collection(db, 'notes'), note);
  return { id: ref.id, ...note };
}

export async function deleteNote(id: string): Promise<void> {
  await deleteDoc(doc(db, 'notes', id));
}

// ─────────────────────────────────────────────────
// TEAM POSTS
// ─────────────────────────────────────────────────

export async function getTeamPosts(batchId: string): Promise<TeamPost[]> {
  const q = query(collection(db, 'teamPosts'), where('batchId', '==', batchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamPost));
}

export async function addTeamPost(post: Omit<TeamPost, 'id'>): Promise<TeamPost> {
  const ref = await addDoc(collection(db, 'teamPosts'), post);
  return { id: ref.id, ...post };
}

export async function deleteTeamPost(id: string): Promise<void> {
  await deleteDoc(doc(db, 'teamPosts', id));
}

// ─────────────────────────────────────────────────
// USERS (batch directory)
// ─────────────────────────────────────────────────

export async function getBatchUsers(batchId: string): Promise<User[]> {
  const q = query(collection(db, 'users'), where('batchId', '==', batchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
}

// Suppress unused import warning for serverTimestamp (kept for future use)
void serverTimestamp;
