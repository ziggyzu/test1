import { useState } from 'react';
import { PartyPopper, Plus, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents, useEventPayments, useTogglePayment, useCreateEvent, useBatchUsers } from '../hooks/useApi';

export default function Events() {
  const { user, isAdmin } = useAuth();
  const { data: events } = useEvents();
  const { data: allPayments } = useEventPayments();
  const togglePayment = useTogglePayment();
  const createEvent = useCreateEvent();
  const { data: usersData } = useBatchUsers();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', feeAmount: 0 });
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const handleCreate = () => {
    if (!user || !form.title || !form.date) return;
    createEvent.mutate({
      title: form.title,
      description: form.description,
      date: form.date,
      feeAmount: form.feeAmount,
      createdBy: user.id,
    });
    setForm({ title: '', description: '', date: '', feeAmount: 0 });
    setShowForm(false);
  };

  const handleTogglePayment = (eventId: string, userId: string) => {
    if (!isAdmin) return;
    togglePayment.mutate({ eventId, userId });
  };

  const students = usersData?.filter((u) => u.role === 'student') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <PartyPopper className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Events & Fees</h1>
            <p className="text-xs text-surface-500">Manage batch events</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> New Event
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && isAdmin && (
        <div className="glass rounded-2xl p-5 space-y-3 animate-fade-in-up">
          <h3 className="font-semibold text-sm">Create Event</h3>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none resize-none" />
          <div className="flex gap-3">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="flex-1 bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
            <input type="number" value={form.feeAmount} onChange={(e) => setForm({ ...form, feeAmount: +e.target.value })} placeholder="Fee (৳)" className="w-32 bg-surface-800 rounded-xl px-4 py-2.5 text-sm text-surface-200 border border-surface-700 focus:border-primary-500 outline-none" />
          </div>
          <button onClick={handleCreate} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer">Create</button>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4 stagger">
        {events?.map((event) => {
          const payments = allPayments?.filter((p) => p.eventId === event.id) ?? [];
          const paidCount = payments.filter((p) => p.paid).length;
          const isExpanded = selectedEvent === event.id;

          return (
            <div key={event.id} className="glass rounded-2xl overflow-hidden">
              {/* Event Header */}
              <button
                onClick={() => setSelectedEvent(isExpanded ? null : event.id)}
                className="w-full p-4 text-left hover:bg-surface-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{event.description}</p>
                    <p className="text-xs text-primary-400 mt-1">
                      {new Date(event.date).toLocaleDateString('en-BD', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-amber-400">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold">৳{event.feeAmount}</span>
                    </div>
                    <p className="text-[10px] text-surface-500 mt-0.5">{paidCount}/{students.length} paid</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${students.length > 0 ? (paidCount / students.length) * 100 : 0}%` }} />
                </div>
              </button>

              {/* Payment Roster */}
              {isExpanded && (
                <div className="border-t border-surface-800 animate-fade-in-up">
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-2">Payment Roster</p>
                    {students.map((student) => {
                      const payment = payments.find((p) => p.userId === student.id);
                      const isPaid = payment?.paid ?? false;
                      return (
                        <div key={student.id} className="flex items-center gap-3 bg-surface-800/40 rounded-xl px-3 py-2.5">
                          <img src={student.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-surface-700 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{student.name}</p>
                            <p className="text-[10px] text-surface-500">{student.studentId}</p>
                          </div>
                          {isAdmin ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTogglePayment(event.id, student.id); }}
                              className="shrink-0 cursor-pointer"
                            >
                              {isPaid ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 hover:text-emerald-400 transition-colors" />
                              ) : (
                                <XCircle className="w-6 h-6 text-rose-500 hover:text-rose-400 transition-colors" />
                              )}
                            </button>
                          ) : (
                            <span>
                              {isPaid ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-rose-500" />
                              )}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
