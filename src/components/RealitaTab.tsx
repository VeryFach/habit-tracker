import React, { useState } from 'react';
import { Habit, HabitType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Plus, X, Trash2, Edit3, Calendar as CalendarIcon, Filter, Layers } from 'lucide-react';

interface RealitaTabProps {
  habits: Habit[];
  hp: number;
  momentum: number;
  onAdd: (title: string, type: HabitType) => void;
  onComplete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  onEndDay: () => void;
}

export function RealitaTab({ habits, hp, momentum, onAdd, onComplete, onUpdate, onDelete, onEndDay }: RealitaTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState('');
  const [habitType, setHabitType] = useState<HabitType>('daily');
  const [view, setView] = useState<'habits' | 'calendar'>('habits');
  const [categoryFilter, setCategoryFilter] = useState<'all' | HabitType>('all');

  const today = new Date().toISOString().split('T')[0];
  const activeHabits = habits.filter(h => h.type === 'daily');
  const filteredHabits = habits.filter(h => categoryFilter === 'all' || h.type === categoryFilter);

  const completionRate = activeHabits.length > 0 
    ? (activeHabits.filter(h => h.completedDates.includes(today)).length / activeHabits.length) 
    : 0;

  const momentumStatus = momentum >= 80 ? 'Unstoppable' : momentum >= 50 ? 'Steady' : momentum >= 20 ? 'Slow' : 'Stalled';
  const momentumColor = momentum >= 80 ? 'text-brand-yellow' : momentum >= 50 ? 'text-brand-teal' : momentum >= 20 ? 'text-brand-purple' : 'text-brand-red';

  const handleAdd = () => {
    if (newHabit.trim()) {
      onAdd(newHabit, habitType);
      setNewHabit('');
      setIsAdding(false);
    }
  };

  const handleUpdate = () => {
    if (editingHabit && newHabit.trim()) {
      onUpdate(editingHabit.id, { title: newHabit, type: habitType });
      setEditingHabit(null);
      setNewHabit('');
    }
  };

  const startEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setNewHabit(habit.title);
    setHabitType(habit.type);
  };

  const renderCalendar = () => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    
    // Grid calculation
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
      <div className="bg-brand-surface border-2 border-brand-border rounded-3xl p-6 neo-shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase italic tracking-tighter">History Dunia</h3>
          <div className="text-[10px] font-black uppercase bg-brand-bg px-3 py-1 border border-brand-border rounded-full italic">
            {now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
            <div key={d} className="text-center text-[8px] font-black text-brand-muted uppercase tracking-widest">{d}</div>
          ))}
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === today;
            const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
            const totalHabits = habits.length;
            const intensity = totalHabits > 0 ? (completedCount / totalHabits) : 0;

            return (
              <div 
                key={day}
                className={`aspect-square rounded-xl border border-brand-border flex flex-col items-center justify-center relative transition-all ${
                  isToday ? 'bg-brand-red text-white scale-110 z-10 neo-shadow-sm' : 'bg-brand-surface-alt'
                }`}
                style={{
                  backgroundColor: !isToday && intensity > 0 ? `rgba(45, 204, 113, ${0.1 + intensity * 0.9})` : undefined
                }}
              >
                <span className={`text-xs font-black ${isToday ? 'text-white' : intensity > 0.5 ? 'text-white' : 'text-brand-dark'}`}>{day}</span>
                {intensity > 0 && !isToday && (
                  <div className="w-1 h-1 bg-white rounded-full mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center gap-4 mt-6 pt-6 border-t-2 border-dashed border-brand-border">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-brand-surface-alt border border-brand-border rounded" />
             <span className="text-[8px] font-black uppercase text-brand-muted">Low</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-brand-teal border border-brand-border rounded" />
             <span className="text-[8px] font-black uppercase text-brand-muted">High Impact</span>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-32">
      {/* Daily Progress & Snowball Effect Visualizer */}
      <div className="bg-brand-surface border-2 border-brand-border rounded-3xl p-6 neo-shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
           <Layers className="w-32 h-32 rotate-12" />
        </div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-1 text-brand-dark">Realita Center</h2>
            <p className="text-brand-muted text-[10px] font-black uppercase tracking-widest leading-none">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setView('habits')}
              className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${view === 'habits' ? 'bg-brand-teal text-brand-dark neo-shadow-sm' : 'bg-brand-dark/10'}`}
            >
              HABITS
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${view === 'calendar' ? 'bg-brand-yellow text-brand-dark neo-shadow-sm' : 'bg-brand-dark/10'}`}
            >
              LOGS
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 relative z-10 mb-6">
           <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-brand-muted italic">Habit Execution</span>
                <span className="text-xs font-black font-mono text-brand-teal">{Math.round(completionRate * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-brand-dark/5 rounded-full border border-brand-border overflow-hidden">
                <motion.div 
                  className="h-full bg-brand-teal shadow-[0_0_15px_#2DCC71]"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate * 100}%` }}
                />
              </div>
           </div>
           <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-brand-muted italic">Momentum (Snowball)</span>
                <span className={`text-xs font-black font-mono ${momentumColor}`}>{momentum}%</span>
              </div>
              <div className="w-full h-2 bg-brand-dark/5 rounded-full border border-brand-border overflow-hidden">
                <motion.div 
                  className={`h-full ${momentumColor.replace('text-', 'bg-')} shadow-[0_0_15px_currentColor]`}
                  initial={{ width: 0 }}
                  animate={{ width: `${momentum}%` }}
                />
              </div>
           </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
           <div className={`p-2 rounded-xl bg-brand-dark/5 border border-brand-border ${momentumColor}`}>
              <Layers className="w-4 h-4 animate-bounce" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-brand-muted leading-none mb-1">Current State</p>
              <p className={`text-sm font-black uppercase italic tracking-tighter ${momentumColor}`}>System Status: {momentumStatus}</p>
           </div>
        </div>
      </div>

      {view === 'calendar' ? renderCalendar() : (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-teal" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-subtle">Inventory Habit</h3>
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="p-2 bg-brand-teal border border-brand-border rounded-xl hover:scale-105 transition-all active:scale-95 neo-shadow-sm"
              >
                <Plus className="w-5 h-5 text-brand-dark" />
              </button>
            </div>

            <div className="flex bg-brand-bg p-1 rounded-2xl border-2 border-brand-border overflow-x-auto no-scrollbar">
              {(['all', 'daily', 'weekly', 'monthly'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex-1 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${
                    categoryFilter === cat 
                      ? 'text-brand-dark neo-shadow-sm' 
                      : 'text-brand-muted hover:text-brand-dark'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {filteredHabits.length === 0 ? (
              <div className="py-12 px-8 bg-brand-surface/50 border-2 border-dashed border-brand-border rounded-3xl text-center neo-shadow-sm">
                <div className="w-16 h-16 bg-brand-bg rounded-3xl flex items-center justify-center mx-auto mb-4 border border-brand-border">
                  <CalendarIcon className="w-8 h-8 text-brand-muted" />
                </div>
                <h4 className="text-xl font-black uppercase italic tracking-tighter text-brand-dark mb-1">Dunia Hampa?</h4>
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest leading-relaxed">
                  Belum ada habit yang direncanakan. <br/>Mulai evolusi pertamamu!
                </p>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="mt-6 px-6 py-3 bg-brand-teal text-brand-dark border border-brand-border rounded-2xl font-black text-[10px] uppercase neo-shadow-sm active:scale-95 transition-all"
                >
                  Tambah Habit
                </button>
              </div>
            ) : filteredHabits.map((habit) => {
              const isCompleted = habit.completedDates.includes(today);
              const isEmergency = habit.title.startsWith('Mitigasi:');
              
              return (
                <motion.div
                  key={habit.id}
                  layout
                  className={`group flex items-center gap-3 p-4 rounded-3xl border-2 transition-all cursor-pointer select-none active:scale-[0.98] ${
                    isCompleted 
                      ? 'bg-brand-surface/60 border-brand-border' 
                      : isEmergency 
                        ? 'bg-brand-red/5 border-brand-red neo-shadow animate-pulse'
                        : 'bg-brand-surface border-brand-border neo-shadow'
                  }`}
                  onClick={() => !isCompleted && onComplete(habit.id)}
                >
                  <div 
                    className={`w-12 h-12 rounded-2xl border border-brand-border flex items-center justify-center text-2xl transition-all neo-shadow-sm flex-shrink-0 ${
                      isCompleted ? 'bg-green-100 border-green-200' : isEmergency ? 'bg-brand-red text-white' : 'bg-brand-surface group-hover:bg-brand-teal'
                    }`}
                  >
                    {isCompleted ? '🔥' : isEmergency ? '🚨' : '⏳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`font-black uppercase tracking-tighter truncate leading-tight ${isCompleted ? 'text-brand-muted line-through' : isEmergency ? 'text-brand-red' : 'text-brand-dark'}`}>
                        {habit.title}
                      </p>
                      {isEmergency && (
                         <span className="text-[7px] font-black bg-brand-red text-white px-1 py-0.5 rounded animate-bounce">URGENT</span>
                      )}
                      {habit.currentStreak > 0 && (
                        <span className="text-[8px] font-black bg-brand-yellow px-1 py-0.5 rounded italic whitespace-nowrap">
                          STREAK {habit.currentStreak}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[7px] font-black px-1.5 py-0.5 border rounded uppercase ${
                        isCompleted ? 'bg-brand-surface-alt text-brand-muted border-brand-border' : 'bg-brand-bg text-brand-dark border-brand-dark/10'
                      }`}>
                        {habit.type}
                      </span>
                      <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest whitespace-nowrap">
                        <span className="text-brand-teal">+ {habit.goldReward}G</span> • <span className="text-brand-purple">+ {habit.expReward}X</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                   <button 
                      onClick={(e) => { e.stopPropagation(); startEdit(habit); }}
                      className="p-3 bg-brand-surface border border-brand-border rounded-xl text-brand-muted hover:text-brand-dark hover:border-brand-dark transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t-2 border-dashed border-brand-border flex items-center justify-between">
        <div className="max-w-[120px]">
          <span className="text-[10px] font-black uppercase opacity-60">Status Survival</span>
          <div className="flex flex-wrap gap-2 mt-1">
            <div className={`px-2 py-1 border border-brand-border rounded text-[8px] font-black neo-shadow-sm ${hp < 50 ? 'bg-brand-red text-white font-mono' : 'bg-brand-teal'}`}>
              {hp < 50 ? 'LOW HP' : 'STABLE'}
            </div>
          </div>
        </div>
        <button 
          onClick={onEndDay}
          className="bg-brand-red px-10 py-4 rounded-2xl border-2 border-brand-border font-black text-white neo-shadow active:scale-95 transition-all uppercase italic tracking-tighter text-xl"
        >
          TIBA-TIBA TIDUR
        </button>
      </div>

      {/* Add/Edit Habit Bottom Sheet (Mobile-First) */}
      <AnimatePresence>
        {(isAdding || editingHabit) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-muted/20 backdrop-blur-sm z-[100]"
              onClick={() => { setIsAdding(false); setEditingHabit(null); setNewHabit(''); setDeletingHabitId(null); }}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-brand-surface z-[101] rounded-t-[2.5rem] p-8 border-t-2 border-brand-border neo-shadow-lg max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-brand-surface-alt rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-3xl font-black uppercase italic tracking-tighter">{editingHabit ? 'Modifikasi Evolusi' : 'Inisiasi Evolusi'}</h4>
                <button onClick={() => { setIsAdding(false); setEditingHabit(null); setNewHabit(''); setDeletingHabitId(null); }} className="p-3 border border-brand-border rounded-2xl bg-brand-surface">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-brand-muted tracking-[0.2em] px-1">Judul Habit</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Apa rencana besarmu?"
                    className="w-full text-2xl font-black uppercase border-b-2 border-brand-teal bg-transparent p-3 text-brand-dark focus:outline-none placeholder:text-brand-muted transition-colors"
                    value={newHabit}
                    onChange={e => setNewHabit(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (editingHabit ? handleUpdate() : handleAdd())}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-brand-muted tracking-[0.2em] px-1">Frekuensi Evolusi</label>
                  <div className="flex gap-2">
                    {(['daily', 'weekly', 'monthly'] as HabitType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setHabitType(type)}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${
                          habitType === type 
                            ? (type === 'daily' ? 'bg-brand-teal border-brand-border neo-shadow-sm' : type === 'weekly' ? 'bg-brand-yellow border-brand-border neo-shadow-sm' : 'bg-brand-purple text-white border-brand-border neo-shadow-sm')
                            : 'bg-brand-surface border-brand-border text-brand-muted'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <button 
                    onClick={editingHabit ? handleUpdate : handleAdd}
                    className="w-full bg-brand-teal text-brand-dark border-2 border-brand-border font-black uppercase py-5 rounded-3xl neo-shadow-lg hover:scale-[1.02] active:scale-95 transition-all italic tracking-tighter text-2xl"
                  >
                    {editingHabit ? 'SIMPAN PERUBAHAN' : 'MULAI EVOLUSI'}
                  </button>

                  {editingHabit && (
                    <div className="pt-4 mt-4 border-t border-brand-border">
                       {deletingHabitId === editingHabit.id ? (
                         <div className="flex gap-2 animate-in slide-in-from-bottom-4">
                           <button 
                             onClick={() => { onDelete(editingHabit.id); setEditingHabit(null); setNewHabit(''); setDeletingHabitId(null); }}
                             className="flex-1 bg-brand-red text-white py-4 rounded-2xl border border-brand-border font-black uppercase text-xs"
                           >
                             YA, HAPUS SEKARANG
                           </button>
                           <button 
                             onClick={() => setDeletingHabitId(null)}
                             className="px-6 bg-brand-surface py-4 rounded-2xl border border-brand-border font-black uppercase text-xs text-brand-dark"
                           >
                             BATAL
                           </button>
                         </div>
                       ) : (
                         <button 
                          onClick={() => setDeletingHabitId(editingHabit.id)}
                          className="w-full text-[10px] font-black uppercase text-brand-red/40 hover:text-brand-red transition-colors tracking-widest flex items-center justify-center gap-2"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                           HAPUS PERMANEN
                         </button>
                       )}
                    </div>
                  )}
                </div>
              </div>

              <div className="h-12" /> {/* Bottom safe area */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
