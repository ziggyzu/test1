import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { collection, doc, query, where, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type {
  AttendanceRecord, ClassTest, TestVote, TestMark,
  Deadline, DeadlineCompletion, Event, EventPayment,
  Note, NoteVote, TeamPost, WakeUpPriority, ScheduleSlot, Course, User
} from '../types';
import { getBatchUsers } from '../lib/firestore';

// Helper to get batch ID safely
const useBatchId = () => {
  const { user } = useAuth();
  return user?.batchId || '';
};

// ── COURSES ──
export const useCourses = () => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['courses', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const snap = await getDocs(query(collection(db, 'courses'), where('batchId', '==', batchId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
    },
    enabled: !!batchId,
  });
};

// ── SCHEDULE ──
export const useSchedule = (day?: string) => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['schedule', batchId, day],
    queryFn: async () => {
      if (!batchId) return [];
      let q = query(collection(db, 'schedule'), where('batchId', '==', batchId));
      if (day) q = query(q, where('day', '==', day));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ScheduleSlot));
    },
    enabled: !!batchId,
  });
};

export const useTodaySchedule = () => {
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  return useSchedule(dayName);
};

// ── ATTENDANCE ──
export const useAttendance = (userId?: string) => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['attendance', batchId, userId],
    queryFn: async () => {
      if (!batchId) return [];
      let q = query(collection(db, 'attendance'), where('batchId', '==', batchId));
      if (userId) q = query(q, where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord));
    },
    enabled: !!batchId,
  });
};

export const useMarkAttendance = () => {
  const qc = useQueryClient();
  const batchId = useBatchId();
  return useMutation({
    mutationFn: async ({ userId, courseId, status }: { userId: string; courseId: string; status: 'present' | 'absent' }) => {
      const record = {
        userId, courseId, batchId,
        date: new Date().toISOString().slice(0, 10),
        status,
        timestamp: serverTimestamp()
      };
      const ref = await addDoc(collection(db, 'attendance'), record);
      return { id: ref.id, ...record };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance', batchId] }),
  });
};

// ── CLASS TESTS ──
export const useClassTests = () => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['classTests', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const snap = await getDocs(query(collection(db, 'classTests'), where('batchId', '==', batchId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassTest));
    },
    enabled: !!batchId,
  });
};

export const useCreateClassTest = () => {
  const qc = useQueryClient();
  const batchId = useBatchId();
  return useMutation({
    mutationFn: async (test: Omit<ClassTest, 'id' | 'batchId'>) => {
      const newTest = { ...test, batchId };
      const ref = await addDoc(collection(db, 'classTests'), newTest);
      return { id: ref.id, ...newTest };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classTests', batchId] }),
  });
};

export const useTestVotes = () => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['testVotes', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      // To scale properly we should put this as a subcollection, but keeping it flat with batchId for now
      const snap = await getDocs(query(collection(db, 'testVotes'), where('batchId', '==', batchId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TestVote));
    },
    enabled: !!batchId,
  });
};

export const useVoteTest = () => {
  const qc = useQueryClient();
  const batchId = useBatchId();
  return useMutation({
    mutationFn: async ({ testId, userId, vote }: { testId: string; userId: string; vote: 'up' | 'down' }) => {
      const id = `${testId}_${userId}`;
      const ref = doc(db, 'testVotes', id);
      await setDoc(ref, { testId, userId, vote, batchId });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['testVotes', batchId] }),
  });
};

export const useTestMarks = (userId?: string) => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['testMarks', batchId, userId],
    queryFn: async () => {
      if (!batchId) return [];
      let q = query(collection(db, 'testMarks'), where('batchId', '==', batchId));
      if (userId) q = query(q, where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TestMark));
    },
    enabled: !!batchId,
  });
};

export const useUploadMarks = () => {
  const qc = useQueryClient();
  const batchId = useBatchId();
  return useMutation({
    mutationFn: async (marks: Omit<TestMark, 'id'>[]) => {
      // Execute in parallel (should use batching ideally)
      await Promise.all(marks.map(m => {
        const id = `${m.testId}_${m.userId}`;
        return setDoc(doc(db, 'testMarks', id), { ...m, batchId });
      }));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['testMarks', batchId] }),
  });
};

// ── DEADLINES ──
export const useDeadlines = () => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['deadlines', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const snap = await getDocs(query(collection(db, 'deadlines'), where('batchId', '==', batchId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Deadline));
    },
    enabled: !!batchId,
  });
};

export const useCreateDeadline = () => {
  const qc = useQueryClient();
  const batchId = useBatchId();
  return useMutation({
    mutationFn: async (dl: Omit<Deadline, 'id' | 'batchId'>) => {
      const ref = await addDoc(collection(db, 'deadlines'), { ...dl, batchId });
      return { id: ref.id, ...dl };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deadlines', batchId] }),
  });
};

export const useDeadlineCompletions = (userId?: string) => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['deadlineCompletions', batchId, userId],
    queryFn: async () => {
      if (!batchId || !userId) return [];
      const q = query(collection(db, 'deadlineCompletions'), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DeadlineCompletion));
    },
    enabled: !!batchId,
  });
};

export const useToggleDeadlineDone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ deadlineId, userId }: { deadlineId: string; userId: string }) => {
      const id = `${userId}_${deadlineId}`;
      const ref = doc(db, 'deadlineCompletions', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { userId, deadlineId, completedAt: new Date().toISOString() });
      }
    },
    onSettled: (_, __, { userId }) => qc.invalidateQueries({ queryKey: ['deadlineCompletions', useBatchId(), userId] }),
  });
};

// ── EVENTS ──
export const useEvents = () => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['events', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const snap = await getDocs(query(collection(db, 'events'), where('batchId', '==', batchId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Event));
    },
    enabled: !!batchId,
  });
};

export const useCreateEvent = () => {
  const qc = useQueryClient();
  const batchId = useBatchId();
  return useMutation({
    mutationFn: async (ev: Omit<Event, 'id' | 'batchId'>) => {
      const ref = await addDoc(collection(db, 'events'), { ...ev, batchId });
      return { id: ref.id, ...ev };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events', batchId] }),
  });
};

export const useEventPayments = (eventId?: string) => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['eventPayments', batchId, eventId],
    queryFn: async () => {
      if (!batchId) return [];
      let q = query(collection(db, 'eventPayments'), where('batchId', '==', batchId));
      if (eventId) q = query(q, where('eventId', '==', eventId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as EventPayment));
    },
    enabled: !!batchId,
  });
};

export const useTogglePayment = () => {
  const qc = useQueryClient();
  const batchId = useBatchId();
  return useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      const id = `${eventId}_${userId}`;
      const ref = doc(db, 'eventPayments', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        await updateDoc(ref, { paid: !data.paid, paidAt: !data.paid ? new Date().toISOString().slice(0, 10) : null });
      } else {
        await setDoc(ref, { eventId, userId, paid: true, paidAt: new Date().toISOString().slice(0, 10), batchId });
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['eventPayments', batchId] }),
  });
};

// ── NOTES ──
export const useNotes = () => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['notes', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const snap = await getDocs(query(collection(db, 'notes'), where('batchId', '==', batchId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Note));
    },
    enabled: !!batchId,
  });
};

export const useCreateNote = () => {
  const qc = useQueryClient();
  const batchId = useBatchId();
  return useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'batchId'>) => {
      const ref = await addDoc(collection(db, 'notes'), { ...note, batchId });
      return { id: ref.id, ...note };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', batchId] }),
  });
};

export const useNoteVotes = () => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['noteVotes', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const snap = await getDocs(query(collection(db, 'noteVotes'), where('batchId', '==', batchId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as NoteVote));
    },
    enabled: !!batchId,
  });
};

export const useVoteNote = () => {
  const qc = useQueryClient();
  const batchId = useBatchId();
  return useMutation({
    mutationFn: async ({ noteId, userId, vote }: { noteId: string; userId: string; vote: 'up' | 'down' }) => {
      const id = `${noteId}_${userId}`;
      const ref = doc(db, 'noteVotes', id);
      await setDoc(ref, { noteId, userId, vote, batchId });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['noteVotes', batchId] }),
  });
};

// ── TEAM POSTS ──
export const useTeamPosts = () => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['teamPosts', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      const snap = await getDocs(query(collection(db, 'teamPosts'), where('batchId', '==', batchId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamPost));
    },
    enabled: !!batchId,
  });
};

export const useCreateTeamPost = () => {
  const qc = useQueryClient();
  const batchId = useBatchId();
  return useMutation({
    mutationFn: async (post: Omit<TeamPost, 'id' | 'batchId'>) => {
      const ref = await addDoc(collection(db, 'teamPosts'), { ...post, batchId });
      return { id: ref.id, ...post };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teamPosts', batchId] }),
  });
};

// ── WAKE UP ──
export const useWakeUpPriorities = (userId?: string) => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['wakeUp', batchId, userId],
    queryFn: async () => {
      if (!batchId || !userId) return [];
      const snap = await getDocs(query(collection(db, 'wakeUpPriorities'), where('userId', '==', userId)));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as WakeUpPriority));
    },
    enabled: !!batchId && !!userId,
  });
};

export const useUpdateWakeUpPriorities = () => {
  const qc = useQueryClient();
  const batchId = useBatchId();
  return useMutation({
    mutationFn: async ({ userId, priorities }: { userId: string; priorities: { friendId: string; priority: number }[] }) => {
      // Very crude batching for priorities just to match the old API
      const snap = await getDocs(query(collection(db, 'wakeUpPriorities'), where('userId', '==', userId)));
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
      await Promise.all(priorities.map(p => 
        addDoc(collection(db, 'wakeUpPriorities'), { userId, friendId: p.friendId, priority: p.priority, batchId })
      ));
    },
    onSuccess: (_, { userId }) => qc.invalidateQueries({ queryKey: ['wakeUp', batchId, userId] }),
  });
};

// ── HELPER: useCourseName ──
export const useCourseName = (courseId: string) => {
  const { data: courses } = useCourses();
  return courses?.find((c) => c.id === courseId);
};

// ── HELPER: useUserById ──
export const useUserById = (userId: string) => {
  const batchId = useBatchId();
  const { data: users = [] } = useQuery({
    queryKey: ['batchUsers', batchId],
    queryFn: () => getBatchUsers(batchId),
    enabled: !!batchId,
  });
  return users.find((u: User) => u.id === userId);
};

// ── HELPER: useBatchUsers ──
export const useBatchUsers = () => {
  const batchId = useBatchId();
  return useQuery({
    queryKey: ['batchUsers', batchId],
    queryFn: () => getBatchUsers(batchId),
    enabled: !!batchId,
  });
};
