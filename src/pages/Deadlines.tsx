import { useState } from 'react';
import { Timer, Plus, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDeadlines, useDeadlineCompletions, useToggleDeadlineDone, useCourses, useCreateDeadline } from '../hooks/useApi';

export default function Deadlines() {
  const { user, isAdmin } = useAuth();
  const { data: deadlines } = useDeadlines();
  const { data: completions } = useDeadlineCompletions(user?.id);
  const { data: courses } = useCourses();
  const toggleDone = useToggleDeadlineDone();
  const createDeadline = useCreateDeadline();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ courseId: '', title: '', description: '', dueDate: '', submissionLink: '' });

  const isDone = (dlId: string) => completions?.some((c) => c.deadlineId === dlId) ?? false;

  const handleToggle = (deadlineId: string) => {
    if (!user) return;
    toggleDone.mutate({ deadlineId, userId: user.id });
  };

  const handleCreate = () => {
    if (!user || !form.courseId || !form.title || !form.dueDate) return;
    createDeadline.mutate({
      courseId: form.courseId,
      title: form.title,
      description: form.description,
      dueDate: form.dueDate,
      submissionLink: form.submissionLink || undefined,
      createdBy: user.id,
    });
    setForm({ courseId: '', title: '', description: '', dueDate: '', submissionLink: '' });
    setShowForm(false);
  };

  const sorted = [...(deadlines ?? [])].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const pending = sorted.filter((d) => !isDone(d.id));
  const done = sorted.filter((d) => isDone(d.id));

  const getTimeLeft = (dueDate: string) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = new Date(dueDate).getTime() - Date.now();
    if (diff <= 0) return { text: 'Overdue', urgent: true };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return { text: `${days}d ${hours}h left`, urgent: days <= 2 };
    return { text: `${hours}h left`, urgent: true };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <Timer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Deadlines</h1>
            <p className="text-xs text-surface-500">{pending.length} pending</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Add
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && isAdmin && (
        <div className="glass rounded-2xl p-5 space-y-3 animate-fade-in-up">
          <h3 className="font-semibold text-sm">New Deadline</h3>
          <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none">
            <option value="">Select Course</option>
            {courses?.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none resize-none" />
          <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          <input value={form.submissionLink} onChange={(e) => setForm({ ...form, submissionLink: e.target.value })} placeholder="Submission link (optional)" className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          <button onClick={handleCreate} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer">Create</button>
        </div>
      )}

      {/* Pending */}
      <div className="space-y-3 stagger">
        {pending.map((dl) => {
          const course = courses?.find((c) => c.id === dl.courseId);
          const { text, urgent } = getTimeLeft(dl.dueDate);
          return (
            <div key={dl.id} className={`glass rounded-2xl p-4 border ${urgent ? 'border-rose-500/20' : 'border-transparent'}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => handleToggle(dl.id)} className="mt-0.5 shrink-0 cursor-pointer">
                  <Circle className="w-5 h-5 text-surface-600 hover:text-primary-400 transition-colors" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{dl.title}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{course?.code}</p>
                  {dl.description && <p className="text-xs text-surface-400 mt-1">{dl.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-medium ${urgent ? 'text-rose-400' : 'text-amber-400'}`}>{text}</span>
                    {dl.submissionLink && (
                      <a href={dl.submissionLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
                        <ExternalLink className="w-3 h-3" /> Submit
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Done */}
      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">Completed</h2>
          <div className="space-y-2">
            {done.map((dl) => {
              const course = courses?.find((c) => c.id === dl.courseId);
              return (
                <div key={dl.id} className="glass rounded-xl p-3 opacity-60">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggle(dl.id)} className="shrink-0 cursor-pointer">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-through truncate">{dl.title}</p>
                      <p className="text-xs text-surface-500">{course?.code}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
