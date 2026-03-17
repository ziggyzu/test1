import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, ShieldAlert, BookOpen, Calendar as CalendarIcon, Link as LinkIcon } from 'lucide-react';
import type { Assignment, Resource } from '../types';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'resources'>('assignments');
  
  // Data State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State - Assignments
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Form State - Resources
  const [resTitle, setResTitle] = useState('');
  const [resLink, setResLink] = useState('');
  const [resCategory, setResCategory] = useState('');

  // Fetch live data
  useEffect(() => {
    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
      // Sort by due date roughly
      data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      setAssignments(data);
    });

    const unsubResources = onSnapshot(collection(db, 'resources'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
      // Sort by creation usually, or title
      data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setResources(data);
      setLoading(false);
    });

    return () => {
      unsubAssignments();
      unsubResources();
    };
  }, []);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !dueDate) return;

    try {
      await addDoc(collection(db, 'assignments'), {
        title,
        subject,
        dueDate,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setSubject('');
      setDueDate('');
    } catch (err) {
      console.error("Error adding assignment:", err);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await deleteDoc(doc(db, 'assignments', id));
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle || !resLink || !resCategory) return;

    try {
      await addDoc(collection(db, 'resources'), {
        title: resTitle,
        link: resLink,
        category: resCategory,
        createdAt: new Date().toISOString()
      });
      setResTitle('');
      setResLink('');
      setResCategory('');
    } catch (err) {
      console.error("Error adding resource:", err);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await deleteDoc(doc(db, 'resources', id));
    } catch (err) {
      console.error("Error deleting resource:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Admin Dashboard</h1>
          <p className="text-surface-400">Manage class assignments and resources</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-6 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'assignments' 
              ? 'bg-primary-600 text-white' 
              : 'glass text-surface-400 hover:text-surface-200'
          }`}
        >
          Assignments
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-2 rounded-xl font-medium transition-colors ${
            activeTab === 'resources' 
              ? 'bg-primary-600 text-white' 
              : 'glass text-surface-400 hover:text-surface-200'
          }`}
        >
          Resources
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-surface-50 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-500" />
              Add {activeTab === 'assignments' ? 'Assignment' : 'Resource'}
            </h2>

            {activeTab === 'assignments' ? (
              <form onSubmit={handleAddAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2 text-surface-50 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. BST Implementation"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2 text-surface-50 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. CSE 3101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2 text-surface-50 focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl transition-colors mt-2"
                >
                  Create Assignment
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddResource} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2 text-surface-50 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. React Docs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Link URL</label>
                  <input
                    type="url"
                    value={resLink}
                    onChange={(e) => setResLink(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2 text-surface-50 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="https://..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-2 text-surface-50 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. Documentation"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl transition-colors mt-2"
                >
                  Add Resource
                </button>
              </form>
            )}
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
          {activeTab === 'assignments' ? (
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="glass rounded-3xl p-12 text-center">
                  <CalendarIcon className="w-12 h-12 text-surface-600 mx-auto mb-4" />
                  <p className="text-surface-400">No assignments created yet.</p>
                </div>
              ) : (
                assignments.map((assignment) => (
                  <div key={assignment.id} className="glass rounded-2xl p-5 flex items-center justify-between group">
                    <div>
                      <h3 className="text-lg font-medium text-surface-50">{assignment.title}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-surface-400">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {assignment.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(assignment.dueDate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="p-2 rounded-xl text-surface-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title="Delete Assignment"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {resources.length === 0 ? (
                <div className="glass rounded-3xl p-12 text-center">
                  <LinkIcon className="w-12 h-12 text-surface-600 mx-auto mb-4" />
                  <p className="text-surface-400">No resources added yet.</p>
                </div>
              ) : (
                resources.map((resource) => (
                  <div key={resource.id} className="glass rounded-2xl p-5 flex items-center justify-between group">
                    <div>
                      <h3 className="text-lg font-medium text-surface-50">{resource.title}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-surface-400">
                        <span className="px-2.5 py-1 rounded-lg bg-surface-800 text-xs text-primary-400 font-medium">
                          {resource.category}
                        </span>
                        <a href={resource.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-400 transition-colors">
                          <LinkIcon className="w-4 h-4" />
                          {resource.link}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="p-2 rounded-xl text-surface-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
