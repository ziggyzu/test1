import { useState } from 'react';
import { CalendarDays, Plus, Minus, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTodaySchedule, useCourses, useAttendance, useMarkAttendance } from '../hooks/useApi';

export default function Routine() {
  const { user } = useAuth();
  const { data: slots, isLoading } = useTodaySchedule();
  const { data: courses } = useCourses();
  const { data: attendance } = useAttendance(user?.id);
  const markAttendance = useMarkAttendance();
  const [markedToday, setMarkedToday] = useState<Record<string, 'present' | 'absent'>>({});

  const today = new Date().toISOString().slice(0, 10);
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];

  const getAttendanceStats = (courseId: string) => {
    const records = attendance?.filter((a) => a.courseId === courseId) ?? [];
    const present = records.filter((r) => r.status === 'present').length;
    const total = records.length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 100;
    return { present, total, pct };
  };

  const getColor = (pct: number) => {
    if (pct >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (pct >= 60) return { bar: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { bar: 'bg-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  };

  const handleMark = (courseId: string, status: 'present' | 'absent') => {
    if (!user) return;
    // Check if already marked for today
    const alreadyMarked = attendance?.some((a) => a.courseId === courseId && a.date === today);
    if (alreadyMarked || markedToday[courseId]) return;
    markAttendance.mutate({ userId: user.id, courseId, status });
    setMarkedToday((prev) => ({ ...prev, [courseId]: status }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map((i) => (
          <div key={i} className="glass rounded-2xl p-5 h-28 shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Today's Routine</h1>
          <p className="text-xs text-surface-500">{dayName}, {new Date().toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Schedule Cards */}
      {(!slots || slots.length === 0) ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-surface-400">No classes scheduled for today 🎉</p>
        </div>
      ) : (
        <div className="space-y-3 stagger">
          {slots.map((slot) => {
            const course = courses?.find((c) => c.id === slot.courseId);
            if (!course) return null;
            const stats = getAttendanceStats(slot.courseId);
            const colors = getColor(stats.pct);
            const todayStatus = markedToday[slot.courseId] ?? (attendance?.find((a) => a.courseId === slot.courseId && a.date === today)?.status);

            return (
              <div key={slot.id} className={`glass rounded-2xl p-4 border ${colors.border} transition-all`}>
                <div className="flex items-start gap-4">
                  {/* Time badge */}
                  <div className="text-center shrink-0 min-w-[54px]">
                    <p className="text-sm font-bold text-surface-200">{slot.startTime}</p>
                    <p className="text-[10px] text-surface-500">{slot.endTime}</p>
                  </div>

                  {/* Course info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{course.name}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{course.code} · {course.instructor}</p>
                    <p className="text-xs text-surface-600 mt-0.5">{slot.room}</p>

                    {/* Attendance bar */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
                        <div className={`h-full ${colors.bar} rounded-full transition-all duration-500`} style={{ width: `${stats.pct}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${colors.text} tabular-nums`}>{stats.pct}%</span>
                    </div>
                    <p className="text-[10px] text-surface-500 mt-1">{stats.present}/{stats.total} classes attended</p>
                  </div>

                  {/* Mark buttons */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {todayStatus ? (
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        todayStatus === 'present' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {todayStatus === 'present' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {todayStatus === 'present' ? 'Present' : 'Absent'}
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleMark(slot.courseId, 'present')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-medium hover:bg-emerald-600/30 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Present
                        </button>
                        <button
                          onClick={() => handleMark(slot.courseId, 'absent')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 text-xs font-medium hover:bg-rose-600/30 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" /> Absent
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All Courses Attendance Summary */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Overall Attendance</h2>
        <div className="space-y-3">
          {courses?.map((course) => {
            const stats = getAttendanceStats(course.id);
            const colors = getColor(stats.pct);
            return (
              <div key={course.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${colors.bar} shrink-0`} />
                <p className="text-sm font-medium flex-1 truncate">{course.code}</p>
                <div className="w-24 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                  <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${stats.pct}%` }} />
                </div>
                <span className={`text-xs font-bold ${colors.text} w-10 text-right tabular-nums`}>{stats.pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
