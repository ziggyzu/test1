import { useState } from 'react';
import { UserPlus, Plus, MessageCircle, Users, Code, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTeamPosts, useCreateTeamPost, useBatchUsers } from '../hooks/useApi';

const typeConfig = {
  hackathon: { icon: Code, label: 'Hackathon', color: 'from-violet-500 to-purple-600', badge: 'bg-violet-500/20 text-violet-400' },
  'study-group': { icon: BookOpen, label: 'Study Group', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/20 text-emerald-400' },
  project: { icon: Users, label: 'Project', color: 'from-blue-500 to-indigo-600', badge: 'bg-blue-500/20 text-blue-400' },
};

export default function TeammateFinder() {
  const { user } = useAuth();
  const { data: posts } = useTeamPosts();
  const { data: usersData } = useBatchUsers();
  const createPost = useCreateTeamPost();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'project' as 'project' | 'hackathon' | 'study-group', maxMembers: 4, whatsappLink: '' });
  const [filter, setFilter] = useState<string>('all');

  const handleCreate = () => {
    if (!user || !form.title) return;
    createPost.mutate({
      title: form.title,
      description: form.description,
      type: form.type,
      createdBy: user.id,
      maxMembers: form.maxMembers,
      whatsappLink: form.whatsappLink || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setForm({ title: '', description: '', type: 'project', maxMembers: 4, whatsappLink: '' });
    setShowForm(false);
  };

  const filtered = filter === 'all' ? posts : posts?.filter((p) => p.type === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Teammate Finder</h1>
            <p className="text-xs text-surface-500">Find partners for projects & hackathons</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Post
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'project', 'hackathon', 'study-group'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === t ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'
            }`}
          >
            {t === 'all' ? 'All' : t === 'study-group' ? 'Study Group' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass rounded-2xl p-5 space-y-3 animate-fade-in-up">
          <h3 className="font-semibold text-sm">Post a Request</h3>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none resize-none" />
          <div className="flex gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'project' | 'hackathon' | 'study-group' })} className="flex-1 bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none">
              <option value="project">Project</option>
              <option value="hackathon">Hackathon</option>
              <option value="study-group">Study Group</option>
            </select>
            <input type="number" value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: +e.target.value })} placeholder="Max members" className="w-28 bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          </div>
          <input value={form.whatsappLink} onChange={(e) => setForm({ ...form, whatsappLink: e.target.value })} placeholder="WhatsApp link (https://wa.me/...)" className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          <button onClick={handleCreate} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer">Post</button>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-3 stagger">
        {filtered?.map((post) => {
          const author = usersData?.find((u) => u.id === post.createdBy);
          const config = typeConfig[post.type];
          const TypeIcon = config.icon;
          return (
            <div key={post.id} className="glass rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shrink-0`}>
                  <TypeIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{post.title}</p>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${config.badge}`}>{config.label}</span>
                  </div>
                  <p className="text-xs text-surface-400 mt-1">{post.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-surface-500">by {author?.name} · Max {post.maxMembers} members</span>
                  </div>
                </div>
              </div>
              {post.whatsappLink && (
                <div className="mt-3 pt-3 border-t border-surface-800">
                  <a
                    href={post.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 text-sm font-medium hover:bg-emerald-600/30 transition-colors w-fit"
                  >
                    <MessageCircle className="w-4 h-4" /> Contact on WhatsApp
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
