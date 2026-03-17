import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, Users, BookOpen, UserCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/routine', icon: CalendarDays, label: 'Routine' },
  { to: '/directory', icon: Users, label: 'Community' },
  { to: '/resources', icon: BookOpen, label: 'Resources' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function BottomTabBar() {
  const { user } = useAuth();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-surface-800">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary-400 scale-105'
                  : 'text-surface-400 hover:text-surface-200'
              }`
            }
          >
            <tab.icon className="w-5 h-5" strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary-400 scale-105'
                  : 'text-primary-500 hover:text-primary-400'
              }`
            }
          >
            <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />
            <span className="text-[10px] font-medium">Admin</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
