import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getResources, addResource } from '../lib/firestore';
import { Link2, MessageCircle, HardDrive, Globe, ExternalLink, Plus } from 'lucide-react';
import type { Resource } from '../types';

const categoryIcon = {
  telegram: MessageCircle,
  drive: HardDrive,
  other: Globe,
};

const categoryColor = {
  telegram: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  drive: 'text-green-400 bg-green-500/10 border-green-500/20',
  other: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

function EmptyResources() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Link2 className="w-16 h-16 text-surface-700 mb-4" />
      <h3 className="text-lg font-semibold text-surface-400 mb-2">No Resources Yet</h3>
      <p className="text-surface-500 text-sm max-w-xs">
        Your CR hasn't added any resources yet. Check back later!
      </p>
    </div>
  );
}

export default function Resources() {
  const { user } = useAuth();
  const batchId = user?.batchId ?? '';
  const qc = useQueryClient();

  const [form, setForm] = useState({ title: '', link: '', category: 'telegram' as Resource['category'] });
  const [showForm, setShowForm] = useState(false);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources', batchId],
    queryFn: () => getResources(batchId),
    enabled: !!batchId,
  });

  const addM = useMutation({
    mutationFn: () => addResource({ ...form, batchId, createdAt: new Date().toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources', batchId] });
      setForm({ title: '', link: '', category: 'telegram' });
      setShowForm(false);
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-32"><div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" /></div>;
  }

  if (resources.length === 0) return <EmptyResources />;

  const grouped = resources.reduce((acc: Record<string, Resource[]>, r: Resource) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-8 stagger">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Resources</h1>
          <p className="text-surface-400 text-sm mt-1">Study materials & batch links</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-surface-800 text-surface-200 text-sm font-medium rounded-xl hover:bg-surface-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-5 animate-fade-in-up">
          <h3 className="font-semibold text-surface-200 mb-4">Contribute a Resource</h3>
          <div className="space-y-3">
            <input placeholder="Title (e.g. Lecture Notes Drive)" value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
            <input placeholder="URL (https://...)" value={form.link}
              onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
              className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
            <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value as Resource['category'] }))}
              className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500">
              <option value="telegram">Telegram</option>
              <option value="drive">Google Drive</option>
              <option value="other">Other</option>
            </select>
            <div className="flex gap-2 pt-2">
              <button onClick={() => addM.mutate()} disabled={addM.isPending || !form.title || !form.link}
                className="flex-1 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
                {addM.isPending ? 'Saving…' : 'Add Resource'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-200 text-sm font-medium rounded-xl transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([category, items]) => {
        const Icon = categoryIcon[category as Resource['category']] ?? Globe;
        const colorClass = categoryColor[category as Resource['category']] ?? categoryColor.other;
        return (
          <div key={category} className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-surface-200 mb-4 capitalize flex items-center gap-2">
              <Icon className="w-4 h-4" /> {category === 'drive' ? 'Google Drive' : category.charAt(0).toUpperCase() + category.slice(1)}
              <span className="ml-auto text-xs text-surface-500">{items.length} link{items.length !== 1 ? 's' : ''}</span>
            </h2>
            <div className="space-y-2">
              {items.map((r: Resource) => (
                <a key={r.id} href={r.link} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.01] ${colorClass}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 font-medium text-sm text-white">{r.title}</span>
                  <ExternalLink className="w-4 h-4 opacity-60 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
