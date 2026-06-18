import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyReport, UserStats } from '../types';
import { 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight, 
  Zap, 
  Skull, 
  Heart, 
  Users, 
  Coins, 
  Sparkles,
  ArrowUpRight,
  AlertTriangle
} from 'lucide-react';

interface DailyReportOverlayProps {
  report: DailyReport;
  stats: UserStats;
  onClose: () => void;
}

export function DailyReportOverlay({ report, stats, onClose }: DailyReportOverlayProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/98 backdrop-blur-3xl z-[500] flex items-center justify-center p-6 overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm sm:max-w-lg lg:max-w-2xl mx-auto py-8"
      >
        <div className="text-center mb-8">
           <motion.div 
             initial={{ scale: 0 }} 
             animate={{ scale: 1 }} 
             className="inline-block p-4 bg-brand-yellow rounded-full mb-4 shadow-[0_0_40px_rgba(253,204,13,0.3)]"
           >
              <TrendingUp className="w-8 h-8 text-brand-dark" />
           </motion.div>
           <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Morning Report</h2>
           <p className="text-brand-teal text-[10px] font-black uppercase tracking-[0.3em] mt-1">Day {stats.dayCount} Evaluation</p>
        </div>

        <div className="space-y-4">
          {/* Consistency Momentum Overlay */}
          <div className="bg-brand-surface-alt border border-brand-border rounded-[2rem] p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className={`w-20 h-20 ${report.momentumBonus >= 0 ? 'text-brand-teal' : 'text-brand-red'}`} />
             </div>
             
             <div className="relative z-10">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-black uppercase text-brand-subtle tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3 text-brand-yellow" /> Momentum Protocol
                  </h4>
                  <span className={`text-xs font-black font-mono ${report.momentumBonus >= 0 ? 'text-brand-teal' : 'text-brand-red'}`}>
                    {report.momentumBonus >= 0 ? '+' : ''}{report.momentumBonus}%
                  </span>
               </div>
               <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black font-mono text-brand-dark leading-none">{stats.momentum}%</p>
                  <p className="text-[8px] font-bold text-brand-muted uppercase tracking-widest">Active Momentum</p>
               </div>
               <p className="text-[10px] font-medium text-brand-muted italic mt-3">
                 "{report.message}"
               </p>
             </div>
          </div>

          {report.event && (
            <div className="bg-brand-red/10 border border-brand-red/30 rounded-[2rem] p-6 relative overflow-hidden">
               <div className="absolute -top-4 -right-4 opacity-10">
                  <Skull className="w-24 h-24 text-brand-red" />
               </div>
               <div className="relative z-10">
                 <h4 className="text-[10px] font-black uppercase text-brand-red tracking-widest mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> Incident Report
                 </h4>
                 <h5 className="text-lg font-black text-brand-dark italic leading-none mb-2">{report.event.name}</h5>
                 <p className="text-xs text-brand-muted font-medium leading-relaxed">
                    {report.event.description}
                 </p>
                 <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-brand-red">
                    <Zap className="w-3 h-3" /> Impact: -{report.event.severity}% {report.event.impactType}
                 </div>
               </div>
            </div>
          )}

          {/* Real World Performance */}
          <div className="bg-brand-surface-alt border border-brand-border rounded-[2.5rem] p-6">
             <h4 className="text-[10px] font-black uppercase text-brand-subtle tracking-widest mb-6 flex items-center justify-between">
                <span>Real World Impact</span>
                <span className="text-brand-muted bg-brand-surface-alt px-2 py-0.5 rounded-md">{report.habitsCompleted}/{report.habitsTotal} Completed</span>
             </h4>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-brand-subtle uppercase">Biometric Status</p>
                   <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl bg-brand-surface-alt border ${report.hpChange >= 0 ? 'border-brand-teal/30 text-brand-teal' : 'border-brand-red/30 text-brand-red'}`}>
                         {report.hpChange >= 0 ? <Heart className="w-4 h-4" /> : <Skull className="w-4 h-4" />}
                      </div>
                      <span className={`text-xl font-black font-mono ${report.hpChange >= 0 ? 'text-brand-teal' : 'text-brand-red'}`}>
                        {report.hpChange >= 0 ? '+' : ''}{report.hpChange} HP
                      </span>
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-brand-subtle uppercase">Daily Earnings</p>
                   <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-brand-surface-alt border border-brand-yellow/30 text-brand-yellow">
                         <Coins className="w-4 h-4" />
                      </div>
                      <span className="text-xl font-black font-mono text-brand-yellow">
                        +{report.goldGained} G
                      </span>
                   </div>
                </div>
             </div>
          </div>

          {/* City Simulation Report */}
          <div className="bg-brand-surface-alt border border-brand-border rounded-[2.5rem] p-6 relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-border">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.momentum}%` }}
                  className="h-full bg-brand-teal shadow-[0_0_10px_#2DCC71]" 
                />
             </div>
             
             <h4 className="text-[10px] font-black uppercase text-brand-subtle tracking-widest mb-6">Simulation Summary</h4>
             
             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center group">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-teal/20 flex items-center justify-center text-brand-teal border border-brand-teal/20">
                         <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-brand-subtle uppercase">Demographics</p>
                        <p className="text-sm font-black text-brand-dark italic">Population Growth</p>
                      </div>
                   </div>
                   <div className={`text-right ${report.populationGrowth >= 0 ? 'text-brand-teal' : 'text-brand-red'}`}>
                      <p className="font-mono font-black text-lg">{report.populationGrowth >= 0 ? '+' : ''}{report.populationGrowth}</p>
                      <p className="text-[8px] font-black uppercase">Citizens</p>
                   </div>
                </div>

                {(report.sickChange !== 0 || (report.deathCount || 0) > 0) && (
                   <div className="bg-brand-red/10 border border-brand-red/20 rounded-2xl p-3 flex flex-col gap-2">
                     <div className="flex justify-between items-center">
                        <p className="text-[8px] font-black text-brand-red uppercase">Sickness Delta</p>
                        <p className="text-[10px] font-black text-brand-red">
                          {report.sickChange! > 0 ? '+' : ''}{report.sickChange} citizens
                        </p>
                     </div>
                     {report.deathCount! > 0 && (
                       <div className="flex justify-between items-center">
                          <p className="text-[8px] font-black text-brand-red uppercase">Fatalities</p>
                          <p className="text-[10px] font-black text-brand-red">-{report.deathCount} citizens</p>
                       </div>
                     )}
                   </div>
                )}

                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-yellow/20 flex items-center justify-center text-brand-yellow border border-brand-yellow/20">
                         <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-brand-subtle uppercase">Economic Flow</p>
                        <p className="text-sm font-black text-brand-dark italic">Treasury Collection</p>
                      </div>
                   </div>
                   <div className="text-right text-brand-yellow">
                      <p className="font-mono font-black text-lg">+{report.silverTax} S</p>
                      <p className="text-[8px] font-black uppercase">Silver</p>
                   </div>
                </div>

                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-purple/20 flex items-center justify-center text-brand-purple border border-brand-purple/20">
                         <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-brand-subtle uppercase">Evolution Data</p>
                        <p className="text-sm font-black text-brand-dark italic">Intellectual Progress</p>
                      </div>
                   </div>
                   <div className="text-right text-brand-purple">
                      <p className="font-mono font-black text-lg">+{report.expGained} X</p>
                      <p className="text-[8px] font-black uppercase">Exp</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-brand-teal text-brand-dark font-black uppercase py-5 rounded-[2rem] mt-8 neo-shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-xl tracking-tighter italic"
        >
          Begin New Cycle
        </button>
      </motion.div>
    </motion.div>
  );
}
