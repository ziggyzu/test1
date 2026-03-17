import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, ClipboardList, Calculator, Timer, Users,
  PartyPopper, UserPlus, BookOpen, AlarmClock, Clock,
  ChevronRight, Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTodaySchedule, useCourses } from '../hooks/useApi';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Assignment, Resource } from '../types';

const quickLinks = [
  { to: '/routine', icon: CalendarDays, label: 'Routine', color: 'from-emerald-500 to-teal-600' },
  { to: '/class-tests', icon: ClipboardList, label: 'Class Tests', color: 'from-blue-500 to-indigo-600' },
  { to: '/grade-calculator', icon: Calculator, label: 'Grade Calc', color: 'from-violet-500 to-purple-600' },
  { to: '/deadlines', icon: Timer, label: 'Deadlines', color: 'from-rose-500 to-pink-600' },
  { to: '/directory', icon: Users, label: 'Directory', color: 'from-cyan-500 to-blue-600' },
  { to: '/events', icon: PartyPopper, label: 'Events', color: 'from-amber-500 to-orange-600' },
  { to: '/teammates', icon: UserPlus, label: 'Teammates', color: 'from-lime-500 to-green-600' },
  { to: '/resources', icon: BookOpen, label: 'Resources', color: 'from-fuchsia-500 to-pink-600' },
];

function useCountdown(targetDate?: string) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Now!'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return remaining;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: todaySlots } = useTodaySchedule();
  const { data: courses } = useCourses();

  const [liveAssignments, setLiveAssignments] = useState<Assignment[]>([]);
  const [liveResources, setLiveResources] = useState<Resource[]>([]);

  useEffect(() => {
    const unsubA = onSnapshot(collection(db, 'assignments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
      // Only keep future ones and sort
      const now = Date.now();
      const upcoming = data.filter(a => new Date(a.dueDate).getTime() > now);
      upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      setLiveAssignments(upcoming);
    });

    const unsubR = onSnapshot(collection(db, 'resources'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
      data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setLiveResources(data);
    });

    return () => { unsubA(); unsubR(); };
  }, []);

  // Find next class
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nextSlot = todaySlots
    ?.map((s) => {
      const [h, m] = s.startTime.split(':').map(Number);
      return { ...s, startMin: h * 60 + m };
    })
    .filter((s) => s.startMin > nowMin)
    .sort((a, b) => a.startMin - b.startMin)[0];

  const nextCourse = nextSlot ? courses?.find((c) => c.id === nextSlot.courseId) : null;

  // Nearest assignment
  const nearestAssignment = liveAssignments[0];
  const countdown = useCountdown(nearestAssignment?.dueDate);

  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-6 stagger">
      {/* Header */}
      <div>
        <p className="text-surface-500 text-sm">{greeting} 👋</p>
        <h1 className="text-2xl font-bold mt-1">{user?.name?.split(' ')[0]}</h1>
      </div>

      {/* Today's Focus */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-primary-400">
          <Flame className="w-5 h-5" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Today's Focus</h2>
        </div>

        {/* Next Class */}
        <div className="flex items-center gap-4 bg-surface-800/50 rounded-xl p-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-surface-500 uppercase font-medium">Next Class</p>
            {nextCourse && nextSlot ? (
              <>
                <p className="font-semibold truncate">{nextCourse.name}</p>
                <p className="text-xs text-surface-400">{nextSlot.startTime} – {nextSlot.endTime} · {nextSlot.room}</p>
              </>
            ) : (
              <p className="text-surface-400 text-sm">No more classes today 🎉</p>
            )}
          </div>
        </div>

        {/* Countdown */}
        {nearestAssignment && (
          <div className="flex items-center gap-4 bg-surface-800/50 rounded-xl p-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 pulse-glow">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-surface-500 uppercase font-medium">Nearest Assignment</p>
              <p className="font-semibold truncate">{nearestAssignment.title}</p>
              <p className="text-xs text-surface-400">{nearestAssignment.subject}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-rose-400 tabular-nums">{countdown}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">Quick Access</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="glass rounded-2xl p-3 flex flex-col items-center gap-2 hover:bg-surface-800/80 hover:scale-105 transition-all duration-200 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center group-hover:shadow-lg transition-shadow`}>
                <link.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-surface-300 text-center leading-tight">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Pending Deadlines Summary */}
      {liveAssignments.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">Upcoming Assignments</h2>
            <Link to="/deadlines" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {liveAssignments.slice(0, 3).map((dl) => (
              <div key={dl.id} className="flex items-center gap-3 bg-surface-800/40 rounded-xl px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{dl.title}</p>
                  <p className="text-xs text-surface-500">{dl.subject} · {new Date(dl.dueDate).toLocaleDateString('en-BD', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Resources */}
      {liveResources.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">Latest Resources</h2>
            <Link to="/resources" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {liveResources.slice(0, 3).map((res) => (
              <a 
                href={res.link} 
                target="_blank" 
                rel="noopener noreferrer"
                key={res.id} 
                className="flex items-center gap-3 bg-surface-800/40 hover:bg-surface-700/50 transition-colors rounded-xl px-4 py-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary-400 transition-colors">{res.title}</p>
                  <p className="text-xs text-surface-500">{res.category}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Wake-up CTA */}
      <Link
        to="/wakeup"
        className="glass rounded-2xl p-4 flex items-center gap-4 hover:bg-surface-800/80 transition-all group"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
          <AlarmClock className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Wake-Up Call Priority</p>
          <p className="text-xs text-surface-500">Set your morning check-in buddies</p>
        </div>
        <ChevronRight className="w-5 h-5 text-surface-600 group-hover:text-surface-300 transition-colors" />
      </Link>
    </div>
  );
}
