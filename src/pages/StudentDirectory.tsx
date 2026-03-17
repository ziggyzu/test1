import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getBatchUsers } from '../lib/firestore';
import { Users, Search } from 'lucide-react';
import { useState } from 'react';
import type { User } from '../types';

function EmptyDirectory() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Users className="w-16 h-16 text-surface-700 mb-4" />
      <h3 className="text-lg font-semibold text-surface-400 mb-2">No Students Yet</h3>
      <p className="text-surface-500 text-sm max-w-xs">
        No students have joined your batch yet.
      </p>
    </div>
  );
}

export default function StudentDirectory() {
  const { user } = useAuth();
  const batchId = user?.batchId ?? '';
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['batchUsers', batchId],
    queryFn: () => getBatchUsers(batchId),
    enabled: !!batchId,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-32"><div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" /></div>;
  }

  const filtered = users.filter((u: User) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.skills || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Student Directory</h1>
        <p className="text-surface-400 text-sm mt-1">{users.length} members in your batch</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or skill…"
          className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl text-sm text-surface-100 placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        />
      </div>

      {filtered.length === 0 && users.length === 0 ? (
        <EmptyDirectory />
      ) : filtered.length === 0 ? (
        <p className="text-center text-surface-500 py-10">No students match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((u: User) => (
            <div key={u.id} className="glass rounded-2xl p-4 flex items-start gap-4">
              <img src={u.avatarUrl} alt={u.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white truncate">{u.name}</p>
                  {u.role === 'admin' && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2 py-0.5">CR</span>
                  )}
                </div>
                <p className="text-xs text-surface-400 truncate">{u.email}</p>
                {u.skills && u.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {u.skills.slice(0, 3).map(s => (
                      <span key={s} className="text-xs bg-surface-800 border border-surface-700 rounded-full px-2 py-0.5 text-surface-300">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
