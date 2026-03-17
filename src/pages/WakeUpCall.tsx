import { useState } from 'react';
import { AlarmClock, Phone, GripVertical, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWakeUpPriorities, useUpdateWakeUpPriorities, useBatchUsers } from '../hooks/useApi';
import type { User } from '../types';

export default function WakeUpCall() {
  const { user } = useAuth();
  const { data: priorities } = useWakeUpPriorities(user?.id);
  const updatePriorities = useUpdateWakeUpPriorities();  const { data: usersData = [] } = useBatchUsers();

  const friends = usersData.filter((u: User) => u.id !== user?.id);
  const [selected, setSelected] = useState<string[]>(() => {
    const sorted = [...(priorities ?? [])].sort((a, b) => a.priority - b.priority);
    return sorted.map((p) => p.friendId);
  });
  const [checkedIn, setCheckedIn] = useState(false);

  const toggleFriend = (friendId: string) => {
    setSelected((prev) => {
      if (prev.includes(friendId)) return prev.filter((id) => id !== friendId);
      if (prev.length >= 5) return prev;
      return [...prev, friendId];
    });
  };

  const handleSave = () => {
    if (!user) return;
    updatePriorities.mutate({
      userId: user.id,
      priorities: selected.map((friendId, i) => ({ friendId, priority: i + 1 })),
    });
  };

  const handleCheckIn = () => setCheckedIn(true);

  return (
    <div className="space-y-6 stagger">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
          <AlarmClock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Wake-Up Call</h1>
          <p className="text-xs text-surface-500">Morning check-in priority system</p>
        </div>
      </div>

      {/* Morning Check-in */}
      <div className={`glass rounded-2xl p-5 text-center border ${checkedIn ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
        {checkedIn ? (
          <div className="animate-fade-in-up">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-emerald-400">You're checked in! ✅</p>
            <p className="text-xs text-surface-500 mt-1">Your friends know you're awake. Have a great day!</p>
          </div>
        ) : (
          <div>
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
            <p className="font-semibold text-amber-400">Morning Check-in</p>
            <p className="text-xs text-surface-500 mt-1 mb-4">Tap the button to let your friends know you're up!</p>
            <button
              onClick={handleCheckIn}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer"
            >
              I'm Awake! ☀️
            </button>
          </div>
        )}
      </div>

      {/* Priority Queue */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-1">Priority Queue</h2>
        <p className="text-xs text-surface-500 mb-4">Select up to 5 friends who should be contacted if you miss check-in.</p>

        {/* Selected order */}
        {selected.length > 0 && (
          <div className="space-y-2 mb-4">
            {selected.map((friendId, i) => {
              const friend = usersData.find((u: User) => u.id === friendId);
              if (!friend) return null;
              return (
                <div key={friendId} className="flex items-center gap-3 bg-primary-600/10 border border-primary-600/20 rounded-xl px-3 py-2.5">
                  <GripVertical className="w-4 h-4 text-surface-600 shrink-0" />
                  <span className="w-6 h-6 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <img src={friend.avatarUrl} alt="" className="w-7 h-7 rounded-full bg-surface-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{friend.name}</p>
                  </div>
                  {friend.whatsapp && (
                    <a href={`https://wa.me/${friend.whatsapp}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <Phone className="w-4 h-4 text-emerald-400 hover:text-emerald-300 transition-colors" />
                    </a>
                  )}
                  <button onClick={() => toggleFriend(friendId)} className="text-rose-400 text-xs hover:text-rose-300 cursor-pointer shrink-0">Remove</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Available friends */}
        <div className="space-y-1.5">
          {friends.filter((f: User) => !selected.includes(f.id)).map((friend: User) => (
            <button
              key={friend.id}
              onClick={() => toggleFriend(friend.id)}
              disabled={selected.length >= 5}
              className="w-full flex items-center gap-3 bg-surface-800/40 rounded-xl px-3 py-2.5 hover:bg-surface-800/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-left"
            >
              <img src={friend.avatarUrl} alt="" className="w-7 h-7 rounded-full bg-surface-700 shrink-0" />
              <p className="text-sm font-medium flex-1 truncate">{friend.name}</p>
              <span className="text-xs text-primary-400">+ Add</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-4 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer"
        >
          Save Priority Queue
        </button>
      </div>
    </div>
  );
}
