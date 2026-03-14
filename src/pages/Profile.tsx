import { UserCircle, LogOut, Award, CalendarDays, Timer, Trophy, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAttendance, useCourses, useDeadlines, useDeadlineCompletions, useTestMarks, useNotes, useNoteVotes } from '../hooks/useApi';

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: attendance } = useAttendance(user?.id);
  const { data: courses } = useCourses();
  const { data: deadlines } = useDeadlines();
  const { data: completions } = useDeadlineCompletions(user?.id);
  const { data: marks } = useTestMarks(user?.id);
  const { data: notes } = useNotes();
  const { data: noteVotes } = useNoteVotes();

  if (!user) return null;

  // Attendance summary
  const totalPresent = attendance?.filter((a) => a.status === 'present').length ?? 0;
  const totalRecords = attendance?.length ?? 0;
  const overallPct = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 100;

  // Pending deadlines
  const pendingCount = deadlines?.filter((d) => {
    const isDone = completions?.some((c) => c.deadlineId === d.id);
    return !isDone && new Date(d.dueDate).getTime() > Date.now();
  }).length ?? 0;

  // Total marks
  const totalMarks = marks?.reduce((acc, m) => acc + m.marks, 0) ?? 0;
  const testCount = marks?.length ?? 0;
  const avgMark = testCount > 0 ? Math.round(totalMarks / testCount) : 0;

  // Leaderboard rank
  const contributorMap = new Map<string, number>();
  notes?.forEach((n) => {
    const nVotes = noteVotes?.filter((v) => v.noteId === n.id) ?? [];
    const score = nVotes.filter((v) => v.vote === 'up').length - nVotes.filter((v) => v.vote === 'down').length;
    contributorMap.set(n.uploadedBy, (contributorMap.get(n.uploadedBy) ?? 0) + score);
  });
  const sorted = [...contributorMap.entries()].sort((a, b) => b[1] - a[1]);
  const rank = sorted.findIndex(([id]) => id === user.id) + 1;

  const getAttColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-6 stagger">
      {/* Profile Header */}
      <div className="glass rounded-2xl p-6 text-center">
        <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full bg-surface-700 mx-auto mb-3" />
        <h1 className="text-xl font-bold">{user.name}</h1>
        <p className="text-xs text-surface-500 mt-0.5">{user.studentId} · {user.department} · Batch {user.batch}</p>
        <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
          user.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-primary-500/20 text-primary-400'
        }`}>
          {user.role === 'admin' ? 'CR / Admin' : 'Student'}
        </span>

        <div className="flex items-center justify-center gap-4 mt-4">
          <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-primary-400 transition-colors">
            <Mail className="w-3.5 h-3.5" /> {user.email}
          </a>
          {user.whatsapp && (
            <a href={`https://wa.me/${user.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-emerald-400 transition-colors">
              <Phone className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {user.skills.map((skill) => (
          <span key={skill} className="px-3 py-1 rounded-full bg-primary-600/15 text-primary-400 text-xs font-medium">{skill}</span>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 text-center">
          <CalendarDays className="w-5 h-5 text-primary-400 mx-auto mb-1" />
          <p className={`text-2xl font-bold ${getAttColor(overallPct)}`}>{overallPct}%</p>
          <p className="text-[10px] text-surface-500 mt-0.5">Attendance ({totalPresent}/{totalRecords})</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-2xl font-bold gradient-text">{avgMark}</p>
          <p className="text-[10px] text-surface-500 mt-0.5">Avg Test Score ({testCount} tests)</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <Timer className="w-5 h-5 text-rose-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-rose-400">{pendingCount}</p>
          <p className="text-[10px] text-surface-500 mt-0.5">Pending Deadlines</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-400">{rank > 0 ? `#${rank}` : '—'}</p>
          <p className="text-[10px] text-surface-500 mt-0.5">Leaderboard Rank</p>
        </div>
      </div>

      {/* Per-course attendance */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">Attendance by Course</h2>
        <div className="space-y-3">
          {courses?.map((course) => {
            const records = attendance?.filter((a) => a.courseId === course.id) ?? [];
            const present = records.filter((r) => r.status === 'present').length;
            const total = records.length;
            const pct = total > 0 ? Math.round((present / total) * 100) : 100;
            const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500';
            return (
              <div key={course.id} className="flex items-center gap-3">
                <p className="text-sm font-medium w-20 shrink-0 truncate">{course.code}</p>
                <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <span className={`text-xs font-bold w-10 text-right tabular-nums ${getAttColor(pct)}`}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span className="font-medium text-sm">Logout</span>
      </button>
    </div>
  );
}
