import { useState } from 'react';
import { ClipboardList, ThumbsUp, ThumbsDown, Plus, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClassTests, useTestVotes, useVoteTest, useCourses, useCreateClassTest, useTestMarks } from '../hooks/useApi';
import { USERS } from '../data/mockData';

export default function ClassTests() {
  const { user, isAdmin } = useAuth();
  const { data: tests } = useClassTests();
  const { data: votes } = useTestVotes();
  const { data: courses } = useCourses();
  const { data: marks } = useTestMarks();
  const voteTest = useVoteTest();
  const createTest = useCreateClassTest();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ courseId: '', title: '', date: '', description: '', marksTotal: 20 });

  const getVoteCounts = (testId: string) => {
    const testVotes = votes?.filter((v) => v.testId === testId) ?? [];
    return {
      up: testVotes.filter((v) => v.vote === 'up').length,
      down: testVotes.filter((v) => v.vote === 'down').length,
      userVote: testVotes.find((v) => v.userId === user?.id)?.vote,
    };
  };

  const handleVote = (testId: string, vote: 'up' | 'down') => {
    if (!user) return;
    voteTest.mutate({ testId, userId: user.id, vote });
  };

  const handleCreate = () => {
    if (!user || !form.courseId || !form.title || !form.date) return;
    createTest.mutate({
      courseId: form.courseId,
      title: form.title,
      date: form.date,
      description: form.description,
      createdBy: user.id,
      marksTotal: form.marksTotal,
      status: 'upcoming',
    });
    setForm({ courseId: '', title: '', date: '', description: '', marksTotal: 20 });
    setShowForm(false);
  };

  const upcoming = tests?.filter((t) => t.status === 'upcoming') ?? [];
  const completed = tests?.filter((t) => t.status === 'completed') ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Class Tests</h1>
            <p className="text-xs text-surface-500">Upcoming tests & results</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> New Test
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && isAdmin && (
        <div className="glass rounded-2xl p-5 space-y-3 animate-fade-in-up">
          <h3 className="font-semibold text-sm">Post New Class Test</h3>
          <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none">
            <option value="">Select Course</option>
            {courses?.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Test title (e.g. CT-2: Graphs)" className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description / syllabus" rows={2} className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none resize-none" />
          <div className="flex gap-3">
            <input type="number" value={form.marksTotal} onChange={(e) => setForm({ ...form, marksTotal: +e.target.value })} placeholder="Total Marks" className="w-32 bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
            <button onClick={handleCreate} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer">Post</button>
          </div>
        </div>
      )}

      {/* Upcoming Tests */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">Upcoming</h2>
          <div className="space-y-3 stagger">
            {upcoming.map((test) => {
              const course = courses?.find((c) => c.id === test.courseId);
              const { up, down, userVote } = getVoteCounts(test.id);
              return (
                <div key={test.id} className="glass rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{test.title}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{course?.code} · {course?.instructor}</p>
                      <p className="text-xs text-primary-400 mt-1">{new Date(test.date).toLocaleDateString('en-BD', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(test.date).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}</p>
                      {test.description && <p className="text-xs text-surface-400 mt-2">{test.description}</p>}
                    </div>
                    <div className="text-xs font-medium text-surface-500 bg-surface-800/60 px-2.5 py-1 rounded-lg shrink-0">
                      {test.marksTotal} marks
                    </div>
                  </div>

                  {/* Voting */}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-surface-800">
                    <span className="text-xs text-surface-500">Consensus:</span>
                    <button
                      onClick={() => handleVote(test.id, 'up')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        userVote === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-800/60 text-surface-400 hover:text-emerald-400'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> {up}
                    </button>
                    <button
                      onClick={() => handleVote(test.id, 'down')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        userVote === 'down' ? 'bg-rose-500/20 text-rose-400' : 'bg-surface-800/60 text-surface-400 hover:text-rose-400'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" /> {down}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Tests with Marks */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">Completed</h2>
          <div className="space-y-3">
            {completed.map((test) => {
              const course = courses?.find((c) => c.id === test.courseId);
              const userMark = marks?.find((m) => m.testId === test.id && m.userId === user?.id);
              const allMarks = marks?.filter((m) => m.testId === test.id) ?? [];
              return (
                <div key={test.id} className="glass rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{test.title}</p>
                      <p className="text-xs text-surface-500">{course?.code}</p>
                    </div>
                    {userMark && (
                      <div className="flex items-center gap-1.5 bg-primary-600/20 text-primary-400 px-3 py-1.5 rounded-lg">
                        <Award className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold">{userMark.marks}/{test.marksTotal}</span>
                      </div>
                    )}
                  </div>
                  {/* Admin: show all marks */}
                  {isAdmin && allMarks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-surface-800 space-y-1.5">
                      <p className="text-xs text-surface-500 font-medium">All Marks:</p>
                      {allMarks.map((m) => {
                        const student = USERS.find((u) => u.id === m.userId);
                        return (
                          <div key={m.id} className="flex items-center justify-between text-xs">
                            <span className="text-surface-300">{student?.name}</span>
                            <span className="font-medium text-surface-200">{m.marks}/{test.marksTotal}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
