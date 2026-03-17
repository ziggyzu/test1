import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getSchedule, getCourses } from '../lib/firestore';
import { CalendarDays, Clock, MapPin, BookOpen } from 'lucide-react';
import type { ScheduleSlot, Course } from '../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function EmptyRoutine() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <CalendarDays className="w-16 h-16 text-surface-700 mb-4" />
      <h3 className="text-lg font-semibold text-surface-400 mb-2">No Routine Yet</h3>
      <p className="text-surface-500 text-sm max-w-xs">
        Your CR hasn't updated the routine yet. Check back later!
      </p>
    </div>
  );
}

export default function Routine() {
  const { user } = useAuth();
  const batchId = user?.batchId ?? '';

  const { data: schedule = [], isLoading: schedLoading } = useQuery({
    queryKey: ['schedule', batchId],
    queryFn: () => getSchedule(batchId),
    enabled: !!batchId,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', batchId],
    queryFn: () => getCourses(batchId),
    enabled: !!batchId,
  });

  const isLoading = schedLoading || coursesLoading;
  const courseMap = Object.fromEntries(courses.map((c: Course) => [c.id, c]));
  const today = DAYS[new Date().getDay()];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (schedule.length === 0) return <EmptyRoutine />;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Class Routine</h1>
        <p className="text-surface-400 text-sm mt-1">Weekly schedule for your batch</p>
      </div>

      {DAYS.map(day => {
        const slots = schedule
          .filter((s: ScheduleSlot) => s.day === day)
          .sort((a: ScheduleSlot, b: ScheduleSlot) => a.startTime.localeCompare(b.startTime));
        if (slots.length === 0) return null;

        return (
          <div key={day} className="glass rounded-2xl overflow-hidden">
            <div className={`px-5 py-3 flex items-center gap-2 ${day === today ? 'bg-primary-600' : 'bg-surface-800/60'}`}>
              <CalendarDays className="w-4 h-4 text-white/80" />
              <h2 className="font-semibold text-white">{day}{day === today ? ' · Today' : ''}</h2>
            </div>
            <div className="divide-y divide-surface-800/40">
              {slots.map((slot: ScheduleSlot) => {
                const course = courseMap[slot.courseId];
                return (
                  <div key={slot.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="shrink-0 text-xs text-center min-w-[64px]">
                      <p className="text-primary-400 font-semibold">{slot.startTime}</p>
                      <p className="text-surface-500">–</p>
                      <p className="text-surface-400">{slot.endTime}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-primary-400 shrink-0" />
                        <p className="font-semibold text-white truncate">{course?.name ?? slot.courseId}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-surface-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{slot.room}</span>
                        {course && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.instructor}</span>}
                      </div>
                    </div>
                    {course && (
                      <span className="shrink-0 text-xs bg-surface-800 border border-surface-700 rounded-lg px-2 py-1 text-surface-400 font-mono">
                        {course.code}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
