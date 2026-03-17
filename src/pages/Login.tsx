import { useState } from 'react';
import { GraduationCap, Mail, Lock, LogIn, User2, ShieldCheck, KeyRound, Building2, Copy, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../types';

export default function Login() {
  const { user, signInWithGoogle, loginWithEmail, signUpWithEmail } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [batchName, setBatchName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (user && !successCode) return <Navigate to="/" replace />;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await loginWithEmail(email, password);
      } else {
        const result = await signUpWithEmail(email, password, name, role, batchCode, batchName);
        if (result.batchCode) {
          setSuccessCode(result.batchCode);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (successCode) {
      navigator.clipboard.writeText(successCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Success Screen (shown to admin after registration) ──
  if (successCode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-surface-950 relative overflow-hidden">
        <div className="absolute top-[-30%] left-[-20%] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-600/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Batch Created! 🎉</h2>
            <p className="text-surface-400 text-sm mb-6">
              Share this <strong className="text-white">Batch Security Pass</strong> with your students so they can join.
            </p>
            <div className="bg-surface-900 border border-surface-700 rounded-2xl p-5 mb-6">
              <p className="text-xs text-surface-500 uppercase tracking-widest mb-2">Batch Code</p>
              <p className="text-4xl font-mono font-extrabold tracking-widest gradient-text">{successCode}</p>
            </div>
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl transition-colors mb-3"
            >
              {copied ? <CheckCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <Navigate to="/" replace />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-30%] left-[-20%] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mb-4 shadow-2xl shadow-primary-600/30">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold gradient-text">Class Companion</h1>
          <p className="text-surface-400 text-sm mt-1">University Hub BD</p>
        </div>

        <div className="glass rounded-3xl p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex gap-2 mb-6 p-1 bg-surface-800/50 rounded-xl">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === 'login' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === 'signup' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Role selector (sign up only) */}
            {tab === 'signup' && (
              <>
                <div className="flex gap-2 p-1 bg-surface-800/50 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                      role === 'student'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-surface-400 hover:text-surface-200'
                    }`}
                  >
                    <User2 className="w-4 h-4" /> Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                      role === 'admin'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-surface-400 hover:text-surface-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin / CR
                  </button>
                </div>

                {/* Name */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User2 className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-surface-100 placeholder-surface-500"
                    placeholder="Full Name"
                    required
                  />
                </div>

                {/* Admin: batch name  |  Student: batch code */}
                {role === 'admin' ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-surface-400" />
                    </div>
                    <input
                      type="text"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-surface-100 placeholder-surface-500"
                      placeholder="Batch Name (e.g. BUET CSE 20)"
                      required
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-surface-400" />
                    </div>
                    <input
                      type="text"
                      value={batchCode}
                      onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-surface-100 placeholder-surface-500 font-mono tracking-widest"
                      placeholder="Batch Code (e.g. BCH-XA91)"
                      required
                    />
                  </div>
                )}
              </>
            )}

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-surface-100 placeholder-surface-500"
                placeholder="Email"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-surface-100 placeholder-surface-500"
                placeholder="Password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface-800 text-surface-400">Or continue with</span>
            </div>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            type="button"
            className="mt-6 w-full bg-white hover:bg-surface-50 text-surface-900 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
