import { NavLink } from 'react-router-dom';
import {
  Home, CalendarDays, Users, BookOpen, UserCircle,
  ClipboardList, Calculator, Timer, PartyPopper,
  UserPlus, AlarmClock, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/routine', icon: CalendarDays, label: 'Routine' },
  { to: '/class-tests', icon: ClipboardList, label: 'Class Tests' },
  { to: '/deadlines', icon: Timer, label: 'Deadlines' },
  { to: '/grade-calculator', icon: Calculator, label: 'Grade Calc' },
  { to: '/directory', icon: Users, label: 'Student Directory' },
  { to: '/events', icon: PartyPopper, label: 'Events & Fees' },
  { to: '/teammates', icon: UserPlus, label: 'Teammate Finder' },
  { to: '/resources', icon: BookOpen, label: 'Resources' },
  { to: '/wakeup', icon: AlarmClock, label: 'Wake-Up Call' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

import { ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 glass-strong border-r border-surface-800 z-40">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center font-extrabold text-white text-sm">
          CC
        </div>
        <div>
          <h1 className="text-base font-bold gradient-text">Class Companion</h1>
          <p className="text-[10px] text-surface-500 tracking-wider uppercase">University Hub BD</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-600/20 text-primary-300 shadow-lg shadow-primary-600/10'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group mt-4 border border-primary-500/30 ${
                isActive
                  ? 'bg-primary-600/20 text-primary-300 shadow-lg shadow-primary-600/10'
                  : 'text-primary-400 hover:text-primary-300 hover:bg-primary-900/30'
              }`
            }
          >
            <ShieldCheck className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* User footer */}
      {user && (
        <div className="p-4 border-t border-surface-800">
          <div className="flex items-center gap-3">
            <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full bg-surface-700" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-surface-500 uppercase">{user.role === 'admin' ? 'CR / Admin' : 'Student'}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg text-surface-500 hover:text-rose-400 hover:bg-surface-800 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
