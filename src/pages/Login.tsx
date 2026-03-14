import { GraduationCap, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { user, login } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-30%] left-[-20%] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mb-4 shadow-2xl shadow-primary-600/30">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold gradient-text">Class Companion</h1>
          <p className="text-surface-400 text-sm mt-1">University Hub BD</p>
        </div>

        {/* Role cards */}
        <div className="space-y-3">
          <button
            onClick={() => login('admin')}
            id="login-admin"
            className="w-full glass rounded-2xl p-5 flex items-center gap-4 hover:bg-surface-800/80 hover:border-primary-500/30 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-surface-100 group-hover:text-white transition-colors">CR / Admin</p>
              <p className="text-xs text-surface-500">Full access — manage routines, marks, events</p>
            </div>
          </button>

          <button
            onClick={() => login('student')}
            id="login-student"
            className="w-full glass rounded-2xl p-5 flex items-center gap-4 hover:bg-surface-800/80 hover:border-primary-500/30 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-surface-100 group-hover:text-white transition-colors">Student</p>
              <p className="text-xs text-surface-500">View routines, track attendance, find teammates</p>
            </div>
          </button>
        </div>

        <p className="text-center text-[11px] text-surface-600 mt-8">
          Demo mode — select a role to explore the app
        </p>
      </div>
    </div>
  );
}
