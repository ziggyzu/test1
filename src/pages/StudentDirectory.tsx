import { useState } from 'react';
import { Users, Search, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StudentDirectory() {
  const { allUsers } = useAuth();
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  // Collect all unique skills
  const allSkills = [...new Set(allUsers.flatMap((u) => u.skills))].sort();

  const filtered = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.studentId.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesSkill = !skillFilter || u.skills.includes(skillFilter);
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Student Directory</h1>
          <p className="text-xs text-surface-500">{allUsers.length} students registered</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="w-full bg-surface-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none"
          />
        </div>
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none sm:w-48"
        >
          <option value="">All Skills</option>
          {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
        {filtered.map((student) => (
          <div key={student.id} className="glass rounded-2xl p-4 hover:bg-surface-800/80 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <img src={student.avatarUrl} alt={student.name} className="w-12 h-12 rounded-full bg-surface-700 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{student.name}</p>
                <p className="text-xs text-surface-500">ID: {student.studentId}</p>
                <p className="text-[10px] text-surface-600">{student.department} · Batch {student.batch} · Sec {student.section}</p>
              </div>
              {student.role === 'admin' && (
                <span className="ml-auto px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-semibold shrink-0">CR</span>
              )}
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {student.skills.map((skill) => (
                <span key={skill} className="px-2 py-0.5 rounded-md bg-primary-600/15 text-primary-400 text-[10px] font-medium">
                  {skill}
                </span>
              ))}
            </div>

            {/* Contact */}
            <div className="flex items-center gap-2 pt-2 border-t border-surface-800">
              <a href={`mailto:${student.email}`} className="flex items-center gap-1 text-xs text-surface-400 hover:text-primary-400 transition-colors">
                <Mail className="w-3.5 h-3.5" /> Email
              </a>
              {student.whatsapp && (
                <a href={`https://wa.me/${student.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-surface-400 hover:text-emerald-400 transition-colors ml-auto">
                  <Phone className="w-3.5 h-3.5" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-surface-400">No students match your search.</p>
        </div>
      )}
    </div>
  );
}
