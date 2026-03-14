import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type {
  AttendanceRecord, ClassTest, TestVote, TestMark,
  Deadline, DeadlineCompletion, Event, EventPayment,
  Note, NoteVote, TeamPost, WakeUpPriority, ScheduleSlot, Course,
} from '../types';
import {
  COURSES, SCHEDULE,
  initialAttendance, initialClassTests, initialTestVotes, initialTestMarks,
  initialDeadlines, initialDeadlineCompletions,
  initialEvents, initialEventPayments,
  initialNotes, initialNoteVotes,
  initialTeamPosts, initialWakeUpPriorities,
} from '../data/mockData';

// ───────────────────────────────────────────────
//  In-memory store (simulates a database)
// ───────────────────────────────────────────────
const store = {
  courses: [...COURSES] as Course[],
  schedule: [...SCHEDULE] as ScheduleSlot[],
  attendance: [...initialAttendance] as AttendanceRecord[],
  classTests: [...initialClassTests] as ClassTest[],
  testVotes: [...initialTestVotes] as TestVote[],
  testMarks: [...initialTestMarks] as TestMark[],
  deadlines: [...initialDeadlines] as Deadline[],
  deadlineCompletions: [...initialDeadlineCompletions] as DeadlineCompletion[],
  events: [...initialEvents] as Event[],
  eventPayments: [...initialEventPayments] as EventPayment[],
  notes: [...initialNotes] as Note[],
  noteVotes: [...initialNoteVotes] as NoteVote[],
  teamPosts: [...initialTeamPosts] as TeamPost[],
  wakeUpPriorities: [...initialWakeUpPriorities] as WakeUpPriority[],
};

let _id = 1000;
const genId = () => `gen_${_id++}`;
const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// ── COURSES ──
export const useCourses = () =>
  useQuery({ queryKey: ['courses'], queryFn: async () => { await delay(); return store.courses; } });

// ── SCHEDULE ──
export const useSchedule = (day?: string) =>
  useQuery({
    queryKey: ['schedule', day],
    queryFn: async () => {
      await delay();
      return day ? store.schedule.filter((s) => s.day === day) : store.schedule;
    },
  });

export const useTodaySchedule = () => {
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  return useSchedule(dayName);
};

// ── ATTENDANCE ──
export const useAttendance = (userId?: string) =>
  useQuery({
    queryKey: ['attendance', userId],
    queryFn: async () => {
      await delay();
      return userId ? store.attendance.filter((a) => a.userId === userId) : store.attendance;
    },
  });

export const useMarkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, courseId, status }: { userId: string; courseId: string; status: 'present' | 'absent' }) => {
      await delay();
      const record: AttendanceRecord = {
        id: genId(), userId, courseId,
        date: new Date().toISOString().slice(0, 10),
        status,
      };
      store.attendance.push(record);
      return record;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
};

// ── CLASS TESTS ──
export const useClassTests = () =>
  useQuery({ queryKey: ['classTests'], queryFn: async () => { await delay(); return store.classTests; } });

export const useCreateClassTest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (test: Omit<ClassTest, 'id'>) => {
      await delay();
      const newTest: ClassTest = { ...test, id: genId() };
      store.classTests.push(newTest);
      return newTest;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classTests'] }),
  });
};

export const useTestVotes = () =>
  useQuery({ queryKey: ['testVotes'], queryFn: async () => { await delay(); return store.testVotes; } });

export const useVoteTest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ testId, userId, vote }: { testId: string; userId: string; vote: 'up' | 'down' }) => {
      await delay(50);
      const existing = store.testVotes.findIndex((v) => v.testId === testId && v.userId === userId);
      if (existing >= 0) {
        store.testVotes[existing].vote = vote;
      } else {
        store.testVotes.push({ id: genId(), testId, userId, vote });
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['testVotes'] }),
  });
};

export const useTestMarks = (userId?: string) =>
  useQuery({
    queryKey: ['testMarks', userId],
    queryFn: async () => {
      await delay();
      return userId ? store.testMarks.filter((m) => m.userId === userId) : store.testMarks;
    },
  });

export const useUploadMarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (marks: Omit<TestMark, 'id'>[]) => {
      await delay();
      marks.forEach((m) => {
        const existing = store.testMarks.findIndex((tm) => tm.testId === m.testId && tm.userId === m.userId);
        if (existing >= 0) store.testMarks[existing].marks = m.marks;
        else store.testMarks.push({ ...m, id: genId() });
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['testMarks'] }),
  });
};

// ── DEADLINES ──
export const useDeadlines = () =>
  useQuery({ queryKey: ['deadlines'], queryFn: async () => { await delay(); return store.deadlines; } });

export const useCreateDeadline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dl: Omit<Deadline, 'id'>) => {
      await delay();
      const newDl: Deadline = { ...dl, id: genId() };
      store.deadlines.push(newDl);
      return newDl;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deadlines'] }),
  });
};

export const useDeadlineCompletions = (userId?: string) =>
  useQuery({
    queryKey: ['deadlineCompletions', userId],
    queryFn: async () => {
      await delay();
      return userId ? store.deadlineCompletions.filter((dc) => dc.userId === userId) : store.deadlineCompletions;
    },
  });

export const useToggleDeadlineDone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ deadlineId, userId }: { deadlineId: string; userId: string }) => {
      await delay(50);
      const idx = store.deadlineCompletions.findIndex((dc) => dc.deadlineId === deadlineId && dc.userId === userId);
      if (idx >= 0) {
        store.deadlineCompletions.splice(idx, 1);
      } else {
        store.deadlineCompletions.push({ id: genId(), deadlineId, userId, completedAt: new Date().toISOString() });
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['deadlineCompletions'] }),
  });
};

// ── EVENTS ──
export const useEvents = () =>
  useQuery({ queryKey: ['events'], queryFn: async () => { await delay(); return store.events; } });

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ev: Omit<Event, 'id'>) => {
      await delay();
      const newEv: Event = { ...ev, id: genId() };
      store.events.push(newEv);
      return newEv;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
};

export const useEventPayments = (eventId?: string) =>
  useQuery({
    queryKey: ['eventPayments', eventId],
    queryFn: async () => {
      await delay();
      return eventId ? store.eventPayments.filter((ep) => ep.eventId === eventId) : store.eventPayments;
    },
  });

export const useTogglePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      await delay(50);
      const ep = store.eventPayments.find((p) => p.eventId === eventId && p.userId === userId);
      if (ep) {
        ep.paid = !ep.paid;
        ep.paidAt = ep.paid ? new Date().toISOString().slice(0, 10) : undefined;
      } else {
        store.eventPayments.push({ id: genId(), eventId, userId, paid: true, paidAt: new Date().toISOString().slice(0, 10) });
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['eventPayments'] }),
  });
};

// ── NOTES ──
export const useNotes = () =>
  useQuery({ queryKey: ['notes'], queryFn: async () => { await delay(); return store.notes; } });

export const useCreateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: Omit<Note, 'id'>) => {
      await delay();
      const newNote: Note = { ...note, id: genId() };
      store.notes.push(newNote);
      return newNote;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });
};

export const useNoteVotes = () =>
  useQuery({ queryKey: ['noteVotes'], queryFn: async () => { await delay(); return store.noteVotes; } });

export const useVoteNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ noteId, userId, vote }: { noteId: string; userId: string; vote: 'up' | 'down' }) => {
      await delay(50);
      const existing = store.noteVotes.findIndex((v) => v.noteId === noteId && v.userId === userId);
      if (existing >= 0) {
        store.noteVotes[existing].vote = vote;
      } else {
        store.noteVotes.push({ id: genId(), noteId, userId, vote });
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['noteVotes'] }),
  });
};

// ── TEAM POSTS ──
export const useTeamPosts = () =>
  useQuery({ queryKey: ['teamPosts'], queryFn: async () => { await delay(); return store.teamPosts; } });

export const useCreateTeamPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: Omit<TeamPost, 'id'>) => {
      await delay();
      const newPost: TeamPost = { ...post, id: genId() };
      store.teamPosts.push(newPost);
      return newPost;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teamPosts'] }),
  });
};

// ── WAKE UP ──
export const useWakeUpPriorities = (userId?: string) =>
  useQuery({
    queryKey: ['wakeUp', userId],
    queryFn: async () => {
      await delay();
      return userId ? store.wakeUpPriorities.filter((w) => w.userId === userId) : store.wakeUpPriorities;
    },
  });

export const useUpdateWakeUpPriorities = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, priorities }: { userId: string; priorities: { friendId: string; priority: number }[] }) => {
      await delay();
      store.wakeUpPriorities = store.wakeUpPriorities.filter((w) => w.userId !== userId);
      priorities.forEach((p) => {
        store.wakeUpPriorities.push({ id: genId(), userId, friendId: p.friendId, priority: p.priority });
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wakeUp'] }),
  });
};

// ── HELPER: useCourseName ──
export const useCourseName = (courseId: string) => {
  const { data: courses } = useCourses();
  return courses?.find((c) => c.id === courseId);
};

// ── HELPER: useUserById ──
export const useUserById = (userId: string) => {
  const { allUsers } = useAuth();
  return allUsers.find((u) => u.id === userId);
};
