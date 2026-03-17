import { useState } from 'react';
import { ShieldCheck, KeyRound, Building2, User2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { createBatch, getBatchByCode } from '../lib/firestore';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '../types';

/**
 * Shown to users who authenticated via Google but haven't set up their batch yet.
 */
export default function Setup() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [batchCode, setBatchCode] = useState('');
  const [batchName, setBatchName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  if (!user) return <Navigate to="/login" replace />;
  if (user.batchId && !done) return <Navigate to="/" replace />;

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let batchId = '';
      let code = '';

      if (role === 'admin') {
        const batch = await createBatch(batchName, user.id);
        batchId = batch.id;
        code = batch.code;
        setGeneratedCode(code);
      } else {
        const batch = await getBatchByCode(batchCode);
        if (!batch) throw new Error('Invalid batch code. Please check with your CR.');
        batchId = batch.id;
      }

      await updateDoc(doc(db, 'users', user.id), { role, batchId });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done && role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-surface-950 relative overflow-hidden">
        <div className="absolute top-[-30%] left-[-20%] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px]" />
        <div className="relative z-10 w-full max-w-sm text-center glass rounded-3xl p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Batch Created! 🎉</h2>
          <p className="text-surface-400 text-sm mb-6">Share this code with your students.</p>
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-5 mb-6">
            <p className="text-xs text-surface-500 uppercase tracking-widest mb-2">Batch Code</p>
            <p className="text-4xl font-mono font-extrabold tracking-widest gradient-text">{generatedCode}</p>
          </div>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  if (done) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-950 relative overflow-hidden">
      <div className="absolute top-[-30%] left-[-20%] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px]" />
      <div className="relative z-10 w-full max-w-sm animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-extrabold gradient-text">One last step!</h1>
          <p className="text-surface-400 text-sm mt-1 text-center">Set up your batch to continue.</p>
        </div>
        <div className="glass rounded-3xl p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="flex gap-2 p-1 bg-surface-800/50 rounded-xl">
              <button type="button" onClick={() => setRole('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${role === 'student' ? 'bg-primary-600 text-white' : 'text-surface-400 hover:text-surface-200'}`}>
                <User2 className="w-4 h-4" /> Student
              </button>
              <button type="button" onClick={() => setRole('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${role === 'admin' ? 'bg-purple-600 text-white' : 'text-surface-400 hover:text-surface-200'}`}>
                <ShieldCheck className="w-4 h-4" /> Admin / CR
              </button>
            </div>
            {role === 'admin' ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-surface-400" />
                </div>
                <input type="text" value={batchName} onChange={(e) => setBatchName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-surface-100 placeholder-surface-500"
                  placeholder="Batch Name (e.g. BUET CSE 20)" required />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-surface-400" />
                </div>
                <input type="text" value={batchCode} onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-surface-100 placeholder-surface-500 font-mono tracking-widest"
                  placeholder="Batch Code (e.g. BCH-XA91)" required />
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Continue</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
