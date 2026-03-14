import { useState } from 'react';
import { BookOpen, Plus, ThumbsUp, ThumbsDown, ExternalLink, Trophy, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotes, useNoteVotes, useVoteNote, useCourses, useCreateNote } from '../hooks/useApi';
import { USERS } from '../data/mockData';

export default function Resources() {
  const { user } = useAuth();
  const { data: notes } = useNotes();
  const { data: votes } = useNoteVotes();
  const { data: courses } = useCourses();
  const voteNote = useVoteNote();
  const createNote = useCreateNote();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ courseId: '', title: '', description: '' });
  const [courseFilter, setCourseFilter] = useState('');

  const getVoteCounts = (noteId: string) => {
    const noteVotes = votes?.filter((v) => v.noteId === noteId) ?? [];
    return {
      up: noteVotes.filter((v) => v.vote === 'up').length,
      down: noteVotes.filter((v) => v.vote === 'down').length,
      userVote: noteVotes.find((v) => v.userId === user?.id)?.vote,
      score: noteVotes.filter((v) => v.vote === 'up').length - noteVotes.filter((v) => v.vote === 'down').length,
    };
  };

  const handleVote = (noteId: string, vote: 'up' | 'down') => {
    if (!user) return;
    voteNote.mutate({ noteId, userId: user.id, vote });
  };

  const handleCreate = () => {
    if (!user || !form.courseId || !form.title) return;
    createNote.mutate({
      courseId: form.courseId,
      title: form.title,
      description: form.description,
      fileUrl: '#',
      uploadedBy: user.id,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setForm({ courseId: '', title: '', description: '' });
    setShowForm(false);
  };

  // Leaderboard
  const contributorMap = new Map<string, number>();
  notes?.forEach((n) => {
    const score = getVoteCounts(n.id).score;
    contributorMap.set(n.uploadedBy, (contributorMap.get(n.uploadedBy) ?? 0) + score);
  });
  const leaderboard = [...contributorMap.entries()]
    .map(([userId, score]) => ({ user: USERS.find((u) => u.id === userId)!, score }))
    .filter((l) => l.user)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const filteredNotes = courseFilter ? notes?.filter((n) => n.courseId === courseFilter) : notes;
  const sortedNotes = [...(filteredNotes ?? [])].sort((a, b) => getVoteCounts(b.id).score - getVoteCounts(a.id).score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Resource Hub</h1>
            <p className="text-xs text-surface-500">Notes, guides & resources</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Upload
        </button>
      </div>

      {/* Official Telegram Link */}
      <a href="https://t.me/cse_resources_bd" target="_blank" rel="noopener noreferrer"
        className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-surface-800/80 transition-all group block">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Official Resource Drive</p>
          <p className="text-xs text-surface-500">Telegram — Books, slides, past papers</p>
        </div>
        <ExternalLink className="w-4 h-4 text-surface-500 group-hover:text-primary-400 transition-colors" />
      </a>

      {/* Upload Form */}
      {showForm && (
        <div className="glass rounded-2xl p-5 space-y-3 animate-fade-in-up">
          <h3 className="font-semibold text-sm">Upload Study Note</h3>
          <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none">
            <option value="">Select Course</option>
            {courses?.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Note title" className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none resize-none" />
          <button onClick={handleCreate} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer">Upload</button>
        </div>
      )}

      {/* Leaderboard */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 text-amber-400 mb-3">
          <Trophy className="w-5 h-5" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Top Contributors</h2>
        </div>
        <div className="space-y-2">
          {leaderboard.map((entry, i) => (
            <div key={entry.user.id} className="flex items-center gap-3 bg-surface-800/40 rounded-xl px-3 py-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-surface-400/20 text-surface-300' : 'bg-orange-500/20 text-orange-400'
              }`}>{i + 1}</span>
              <img src={entry.user.avatarUrl} alt="" className="w-7 h-7 rounded-full bg-surface-700 shrink-0" />
              <p className="text-sm font-medium flex-1 truncate">{entry.user.name}</p>
              <span className="text-xs font-bold text-primary-400">{entry.score} pt{entry.score !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Course Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCourseFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${!courseFilter ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'}`}>All</button>
        {courses?.map((c) => (
          <button key={c.id} onClick={() => setCourseFilter(c.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${courseFilter === c.id ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'}`}>{c.code}</button>
        ))}
      </div>

      {/* Notes */}
      <div className="space-y-3 stagger">
        {sortedNotes.map((note) => {
          const course = courses?.find((c) => c.id === note.courseId);
          const author = USERS.find((u) => u.id === note.uploadedBy);
          const { up, down, userVote } = getVoteCounts(note.id);
          return (
            <div key={note.id} className="glass rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{note.title}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{course?.code} · by {author?.name}</p>
                  {note.description && <p className="text-xs text-surface-400 mt-1">{note.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-surface-800">
                <button onClick={() => handleVote(note.id, 'up')} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  userVote === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surface-800/60 text-surface-400 hover:text-emerald-400'
                }`}>
                  <ThumbsUp className="w-3.5 h-3.5" /> {up}
                </button>
                <button onClick={() => handleVote(note.id, 'down')} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  userVote === 'down' ? 'bg-rose-500/20 text-rose-400' : 'bg-surface-800/60 text-surface-400 hover:text-rose-400'
                }`}>
                  <ThumbsDown className="w-3.5 h-3.5" /> {down}
                </button>
                <span className="text-[10px] text-surface-600 ml-auto">{note.createdAt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
