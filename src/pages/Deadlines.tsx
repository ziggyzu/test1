import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getDeadlines, getCourses } from '../lib/firestore';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ClipboardList, Clock, ExternalLink, CheckCircle2 } from 'lucide-react';
import type { Deadline, Course } from '../types';

function EmptyDeadlines() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ClipboardList className="w-16 h-16 text-surface-700 mb-4" />
      <h3 className="text-lg font-semibold text-surface-400 mb-2">No Deadlines Yet</h3>
      <p className="text-surface-500 text-sm max-w-xs">
        No deadlines posted yet. Your CR will post assignments here.
      </p>
    </div>
  );
}

export default function Deadlines() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const batchId = user?.batchId ?? '';

  const { data: deadlines = [], isLoading: dlLoading } = useQuery({
    queryKey: ['deadlines', batchId],
    queryFn: () => getDeadlines(batchId),
    enabled: !!batchId,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', batchId],
    queryFn: () => getCourses(batchId),
    enabled: !!batchId,
  });

  const { data: completions = [] } = useQuery({
    queryKey: ['completions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const snap = await import('firebase/firestore').then(({ collection, query, where, getDocs }) =>
        getDocs(query(collection(db, 'deadlineCompletions'), where('userId', '==', user.id)))
      );
      return snap.docs.map(d => d.data().deadlineId as string);
    },
    enabled: !!user,
  });

  const toggleComplete = useMutation({
    mutationFn: async (deadlineId: string) => {
      if (!user) return;
      const id = `${user.id}_${deadlineId}`;
      const ref = doc(db, 'deadlineCompletions', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { userId: user.id, deadlineId, completedAt: new Date().toISOString() });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['completions', user?.id] }),
  });

  const courseMap = Object.fromEntries(courses.map((c: Course) => [c.id, c]));
  const sorted = [...deadlines].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const upcoming = sorted.filter(d => !completions.includes(d.id) && new Date(d.dueDate) > new Date());
  const done = sorted.filter(d => completions.includes(d.id));
  const overdue = sorted.filter(d => !completions.includes(d.id) && new Date(d.dueDate) <= new Date());

  if (dlLoading) {
    return <div className="flex items-center justify-center py-32"><div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" /></div>;
  }

  if (deadlines.length === 0) return <EmptyDeadlines />;

  const DeadlineCard = ({ d, completed }: { d: Deadline; completed: boolean }) => {
    const course = courseMap[d.courseId];
    const due = new Date(d.dueDate);
    const isOverdue = due < new Date() && !completed;
    return (
      <div className={`glass rounded-2xl p-5 transition-all ${completed ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-3">
          <button onClick={() => toggleComplete.mutate(d.id)}
            className={`mt-0.5 shrink-0 rounded-full w-5 h-5 border-2 flex items-center justify-center transition-colors ${
              completed ? 'bg-green-500 border-green-500' : 'border-surface-600 hover:border-primary-500'
            }`}>
            {completed && <CheckCircle2 className="w-3 h-3 text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold ${completed ? 'line-through text-surface-500' : 'text-white'}`}>{d.title}</p>
            <p className="text-sm text-surface-400 mt-1 mb-3">{d.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {course && <span className="bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-surface-300">{course.code}</span>}
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-surface-400'}`}>
                <Clock className="w-3 h-3" /> Due {due.toLocaleDateString()} {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {d.submissionLink && (
                <a href={d.submissionLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Submit
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Deadlines</h1>
        <p className="text-surface-400 text-sm mt-1">Track your assignments and submissions</p>
      </div>

      {overdue.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Overdue ({overdue.length})
          </h2>
          <div className="space-y-3">{overdue.map(d => <DeadlineCard key={d.id} d={d} completed={false} />)}</div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-400 inline-block" /> Upcoming ({upcoming.length})
          </h2>
          <div className="space-y-3">{upcoming.map(d => <DeadlineCard key={d.id} d={d} completed={false} />)}</div>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Completed ({done.length})
          </h2>
          <div className="space-y-3">{done.map(d => <DeadlineCard key={d.id} d={d} completed />)}</div>
        </section>
      )}
    </div>
  );
}
