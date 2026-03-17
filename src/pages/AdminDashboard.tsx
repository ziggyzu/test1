import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Link2, ClipboardList,
  Plus, Trash2, LogOut, Copy, CheckCheck, Shield,
} from 'lucide-react';
import {
  getSchedule, addScheduleSlot, deleteScheduleSlot,
  getCourses, addCourse, deleteCourse,
  getResources, addResource, deleteResource,
  getDeadlines, addDeadline, deleteDeadline,
  getBatch,
} from '../lib/firestore';
import type { ScheduleSlot, Course, Resource, Deadline } from '../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Reusable empty state ───
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-surface-500 text-sm">
      {message}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'overview' | 'routine' | 'resources' | 'deadlines'>('overview');
  const [copied, setCopied] = useState(false);

  // Form states
  const [slotForm, setSlotForm] = useState({ day: 'Sunday', startTime: '09:00', endTime: '10:20', room: '', courseId: '' });
  const [courseForm, setCourseForm] = useState({ code: '', name: '', instructor: '', totalClasses: 40, creditHours: 3 });
  const [resourceForm, setResourceForm] = useState({ title: '', link: '', category: 'telegram' as Resource['category'] });
  const [deadlineForm, setDeadlineForm] = useState({ title: '', description: '', courseId: '', dueDate: '', submissionLink: '' });

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const batchId = user.batchId;

  // ── Queries ──
  const { data: batch } = useQuery({ queryKey: ['batch', batchId], queryFn: () => getBatch(batchId) });
  const { data: schedule = [] } = useQuery({ queryKey: ['schedule', batchId], queryFn: () => getSchedule(batchId) });
  const { data: courses = [] } = useQuery({ queryKey: ['courses', batchId], queryFn: () => getCourses(batchId) });
  const { data: resources = [] } = useQuery({ queryKey: ['resources', batchId], queryFn: () => getResources(batchId) });
  const { data: deadlines = [] } = useQuery({ queryKey: ['deadlines', batchId], queryFn: () => getDeadlines(batchId) });

  // ── Mutations ──
  const addSlot = useMutation({
    mutationFn: () => addScheduleSlot({ ...slotForm, batchId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedule', batchId] }),
  });
  const deleteSlot = useMutation({
    mutationFn: (id: string) => deleteScheduleSlot(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedule', batchId] }),
  });
  const addCourseM = useMutation({
    mutationFn: () => addCourse({ ...courseForm, batchId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', batchId] }),
  });
  const deleteCourseM = useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', batchId] }),
  });
  const addResourceM = useMutation({
    mutationFn: () => addResource({ ...resourceForm, batchId, createdAt: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources', batchId] }),
  });
  const deleteResourceM = useMutation({
    mutationFn: (id: string) => deleteResource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources', batchId] }),
  });
  const addDeadlineM = useMutation({
    mutationFn: () => addDeadline({ ...deadlineForm, batchId, createdBy: user.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deadlines', batchId] }),
  });
  const deleteDeadlineM = useMutation({
    mutationFn: (id: string) => deleteDeadline(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deadlines', batchId] }),
  });

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const copyCode = () => {
    if (batch?.code) { navigator.clipboard.writeText(batch.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'routine', label: 'Routine', icon: CalendarDays },
    { id: 'resources', label: 'Resources', icon: Link2 },
    { id: 'deadlines', label: 'Deadlines', icon: ClipboardList },
  ] as const;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* Sidebar */}
      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 hidden md:flex flex-col glass border-r border-surface-800 p-6 shrink-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-surface-500">Admin Panel</p>
              <p className="font-bold text-white text-sm truncate">{batch?.name || 'Loading…'}</p>
            </div>
          </div>

          {batch?.code && (
            <div className="mb-6 p-3 rounded-xl bg-surface-900 border border-surface-700">
              <p className="text-xs text-surface-500 mb-1">Batch Code</p>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold tracking-widest text-primary-400">{batch.code}</span>
                <button onClick={copyCode} className="text-surface-400 hover:text-white transition-colors">
                  {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  tab === id ? 'bg-primary-600 text-white' : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                }`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>

          <button onClick={handleLogout}
            className="flex items-center gap-2 text-surface-400 hover:text-red-400 transition-colors text-sm mt-4">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Mobile top bar */}
          <div className="flex md:hidden items-center gap-3 mb-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === id ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400'
                }`}>
                <Icon className="w-3 h-3" /> {label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Courses', value: courses.length, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Schedule Slots', value: schedule.length, color: 'from-primary-500 to-purple-500' },
                  { label: 'Deadlines', value: deadlines.length, color: 'from-orange-500 to-red-500' },
                  { label: 'Resources', value: resources.length, color: 'from-green-500 to-emerald-500' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass rounded-2xl p-4">
                    <p className="text-surface-400 text-xs mb-1">{label}</p>
                    <p className={`text-3xl font-extrabold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="glass rounded-2xl p-5">
                <p className="text-surface-400 text-sm">
                  Welcome back, <strong className="text-white">{user.name}</strong>! Use the sidebar to manage your batch.
                  Share the batch code <strong className="text-primary-400 font-mono">{batch?.code}</strong> with students to let them join.
                </p>
              </div>
            </div>
          )}

          {/* ── ROUTINE ── */}
          {tab === 'routine' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Class Routine</h2>

              {/* Add Course */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-surface-200 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Course</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { ph: 'Course Code (e.g. CSE 3101)', key: 'code', val: courseForm.code },
                    { ph: 'Course Name', key: 'name', val: courseForm.name },
                    { ph: 'Instructor Name', key: 'instructor', val: courseForm.instructor },
                  ].map(({ ph, key, val }) => (
                    <input key={key} placeholder={ph} value={val}
                      onChange={(e) => setCourseForm(f => ({ ...f, [key]: e.target.value }))}
                      className="col-span-2 sm:col-span-1 bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder-surface-500 outline-none focus:ring-2 focus:ring-primary-500" />
                  ))}
                  <input type="number" placeholder="Total Classes" value={courseForm.totalClasses}
                    onChange={(e) => setCourseForm(f => ({ ...f, totalClasses: +e.target.value }))}
                    className="bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
                  <input type="number" placeholder="Credit Hours" value={courseForm.creditHours}
                    onChange={(e) => setCourseForm(f => ({ ...f, creditHours: +e.target.value }))}
                    className="bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <button onClick={() => addCourseM.mutate()} disabled={addCourseM.isPending || !courseForm.code || !courseForm.name}
                  className="mt-3 px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-xl disabled:opacity-50 transition-colors">
                  {addCourseM.isPending ? 'Adding…' : 'Add Course'}
                </button>
              </div>

              {/* Courses list */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-surface-200 mb-4">Courses ({courses.length})</h3>
                {courses.length === 0 ? <EmptyState message="No courses added yet." /> : (
                  <div className="space-y-2">
                    {courses.map((c: Course) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-surface-900/50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-white">{c.code} — {c.name}</p>
                          <p className="text-xs text-surface-400">{c.instructor} · {c.creditHours} credits</p>
                        </div>
                        <button onClick={() => deleteCourseM.mutate(c.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Schedule Slot */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-surface-200 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Schedule Slot</h3>
                <div className="grid grid-cols-2 gap-3">
                  <select value={slotForm.day} onChange={(e) => setSlotForm(f => ({ ...f, day: e.target.value }))}
                    className="bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500">
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <select value={slotForm.courseId} onChange={(e) => setSlotForm(f => ({ ...f, courseId: e.target.value }))}
                    className="bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Select Course</option>
                    {courses.map((c: Course) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                  </select>
                  <input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm(f => ({ ...f, startTime: e.target.value }))}
                    className="bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
                  <input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm(f => ({ ...f, endTime: e.target.value }))}
                    className="bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
                  <input placeholder="Room (e.g. Room 301)" value={slotForm.room} onChange={(e) => setSlotForm(f => ({ ...f, room: e.target.value }))}
                    className="col-span-2 bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <button onClick={() => addSlot.mutate()} disabled={addSlot.isPending || !slotForm.courseId || !slotForm.room}
                  className="mt-3 px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-xl disabled:opacity-50 transition-colors">
                  {addSlot.isPending ? 'Adding…' : 'Add Slot'}
                </button>
              </div>

              {/* Schedule list */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-surface-200 mb-4">Schedule ({schedule.length} slots)</h3>
                {schedule.length === 0 ? <EmptyState message="No schedule slots added yet." /> : (
                  <div className="space-y-2">
                    {schedule.map((s: ScheduleSlot) => {
                      const course = courses.find((c: Course) => c.id === s.courseId);
                      return (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-surface-900/50 rounded-xl">
                          <div>
                            <p className="text-sm font-medium text-white">{s.day} · {s.startTime}–{s.endTime}</p>
                            <p className="text-xs text-surface-400">{course?.name || s.courseId} · {s.room}</p>
                          </div>
                          <button onClick={() => deleteSlot.mutate(s.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── RESOURCES ── */}
          {tab === 'resources' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Resources / Links</h2>
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-surface-200 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Resource</h3>
                <div className="space-y-3">
                  <input placeholder="Title (e.g. Lecture Notes Drive)" value={resourceForm.title}
                    onChange={(e) => setResourceForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
                  <input placeholder="URL (https://...)" value={resourceForm.link}
                    onChange={(e) => setResourceForm(f => ({ ...f, link: e.target.value }))}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
                  <select value={resourceForm.category} onChange={(e) => setResourceForm(f => ({ ...f, category: e.target.value as Resource['category'] }))}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="telegram">Telegram</option>
                    <option value="drive">Google Drive</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button onClick={() => addResourceM.mutate()} disabled={addResourceM.isPending || !resourceForm.title || !resourceForm.link}
                  className="mt-3 px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-xl disabled:opacity-50 transition-colors">
                  {addResourceM.isPending ? 'Saving…' : 'Add Resource'}
                </button>
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-surface-200 mb-4">All Resources ({resources.length})</h3>
                {resources.length === 0 ? <EmptyState message="No resources added yet." /> : (
                  <div className="space-y-2">
                    {resources.map((r: Resource) => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-surface-900/50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-white">{r.title}</p>
                          <p className="text-xs text-surface-500 truncate max-w-[220px]">{r.link}</p>
                          <span className="text-xs bg-surface-700 rounded-full px-2 py-0.5 text-surface-300 capitalize">{r.category}</span>
                        </div>
                        <button onClick={() => deleteResourceM.mutate(r.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DEADLINES ── */}
          {tab === 'deadlines' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Deadlines / Assignments</h2>
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-surface-200 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Post Deadline</h3>
                <div className="space-y-3">
                  <input placeholder="Assignment Title" value={deadlineForm.title}
                    onChange={(e) => setDeadlineForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
                  <textarea placeholder="Description" value={deadlineForm.description} rows={2}
                    onChange={(e) => setDeadlineForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                  <select value={deadlineForm.courseId} onChange={(e) => setDeadlineForm(f => ({ ...f, courseId: e.target.value }))}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Select Course</option>
                    {courses.map((c: Course) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                  </select>
                  <input type="datetime-local" value={deadlineForm.dueDate}
                    onChange={(e) => setDeadlineForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
                  <input placeholder="Submission Link (optional)" value={deadlineForm.submissionLink}
                    onChange={(e) => setDeadlineForm(f => ({ ...f, submissionLink: e.target.value }))}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2.5 text-sm text-surface-100 outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <button onClick={() => addDeadlineM.mutate()} disabled={addDeadlineM.isPending || !deadlineForm.title || !deadlineForm.dueDate}
                  className="mt-3 px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-xl disabled:opacity-50 transition-colors">
                  {addDeadlineM.isPending ? 'Posting…' : 'Post Deadline'}
                </button>
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-surface-200 mb-4">Posted Deadlines ({deadlines.length})</h3>
                {deadlines.length === 0 ? <EmptyState message="No deadlines posted yet." /> : (
                  <div className="space-y-2">
                    {deadlines.map((d: Deadline) => {
                      const course = courses.find((c: Course) => c.id === d.courseId);
                      const due = new Date(d.dueDate);
                      return (
                        <div key={d.id} className="flex items-start justify-between p-3 bg-surface-900/50 rounded-xl gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{d.title}</p>
                            <p className="text-xs text-surface-400">{course?.name || d.courseId} · Due: {due.toLocaleDateString()}</p>
                          </div>
                          <button onClick={() => deleteDeadlineM.mutate(d.id)} className="text-red-400 hover:text-red-300 p-1 shrink-0"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
