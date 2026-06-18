import React, { useState, useMemo } from 'react';
import { UserStats } from '../types';
import { RECOVERY_ITEMS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  Info,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import * as Icons from 'lucide-react';

interface TokoTabProps {
  stats: UserStats;
  onPurchase: (type: 'hp' | 'silver' | 'gold' | 'skipTicket', amount: number, cost: number) => void;
  onGacha: () => void;
}

export function TokoTab({ stats, onPurchase, onGacha }: TokoTabProps) {
  const [silverToGoldInput, setSilverToGoldInput] = useState(10);
  const [goldToSilverInput, setGoldToSilverInput] = useState(10);
  const [showGachaInfo, setShowGachaInfo] = useState(false);

  // Dynamic Economic Rates
  const silverPerGoldRate = useMemo(() => Math.round(12 + Math.sin(stats.dayCount) * 2), [stats.dayCount]);
  const goldToSilverRate = useMemo(() => Math.round(8 + Math.cos(stats.dayCount) * 1.5), [stats.dayCount]);
  const networkFee = 0.05; // 5% fee for each transaction

  const silverToGoldResult = useMemo(() => {
    const amount = Math.floor(silverToGoldInput / silverPerGoldRate);
    const fee = Math.ceil(amount * networkFee);
    return Math.max(0, amount - fee);
  }, [silverToGoldInput]);

  const goldToSilverResult = useMemo(() => {
    const rawResult = goldToSilverInput * goldToSilverRate;
    const fee = Math.ceil(rawResult * networkFee);
    return Math.max(0, rawResult - fee);
  }, [goldToSilverInput]);

  const handleSetMaxSilver = () => {
    const maxAffordable = Math.floor(stats.silver / 10) * 10;
    setSilverToGoldInput(Math.max(10, Math.min(maxAffordable, 2000)));
  };

  const handleSetMaxGold = () => {
    const maxAffordable = Math.floor(stats.gold / 10) * 10;
    setGoldToSilverInput(Math.max(10, Math.min(maxAffordable, 500)));
  };

  return (
    <div className="flex flex-col gap-8 p-4 pb-32">
      {/* Recovery Section (Refined) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-brand-dark opacity-40" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Survival Supplies</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RECOVERY_ITEMS.map((item) => {
            const Icon = (Icons as any)[item.icon] || Coffee;
            const canAfford = stats.gold >= item.costGold;
            return (
              <button
                key={item.id}
                disabled={!canAfford}
                onClick={() => {
                  if (item.id === 'skipTicket') {
                    onPurchase('skipTicket', 1, item.costGold);
                  } else {
                    onPurchase('hp', item.hpRestore, item.costGold);
                  }
                }}
                className={`group flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden ${
                  canAfford 
                    ? 'border-gray-200 bg-brand-surface neo-shadow active:scale-95 hover:scale-[1.02] border-brand-border bg-brand-surface'
                    : 'border-gray-100 bg-gray-50 opacity-50 grayscale cursor-not-allowed border-brand-border bg-brand-surface/50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl border border-gray-200 border-brand-border flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-6 ${canAfford ? 'bg-brand-bg' : 'bg-gray-200'}`}>
                  <Icon className="w-7 h-7 text-brand-dark" />
                </div>
                <div className="flex-1 min-w-0 pr-12">
                  <p className="font-black uppercase tracking-tighter text-brand-dark leading-none truncate italic mb-1">{item.name}</p>
                  <p className="text-[10px] font-bold text-brand-teal uppercase tracking-widest leading-none mb-1">
                    {item.id === 'skipTicket' ? 'PROTECTION' : `+${item.hpRestore} HP`}
                  </p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase leading-none">{item.description}</p>
                </div>
                <div className="absolute right-4 bottom-4 flex items-center gap-1 bg-brand-yellow px-3 py-1.5 rounded-xl border border-gray-200 neo-shadow-sm">
                  <Coins className="w-3.5 h-3.5 text-brand-dark" />
                  <span className="font-mono font-black text-xs text-brand-dark">{item.costGold}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exchange Protocol (Unified & Balanced) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <ArrowRightLeft className="w-4 h-4 text-brand-dark opacity-40" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Resource Conversion</h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Silver TO Gold */}
          <div className="bg-brand-dark rounded-[2.5rem] p-8 neo-shadow-lg relative overflow-hidden">
             <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-brand-yellow">Liquid Asset</h3>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">Silver Kota → Gold Habit</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Market Rate</p>
                  <div className="bg-white/10 px-3 py-1 rounded-full border border-white/10 text-[10px] font-black text-brand-yellow">
                    {silverPerGoldRate}S : 1G
                  </div>
                </div>
             </div>

             <div className="flex flex-col gap-6 mb-8 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] font-black text-white/40 uppercase">Conversion Amount</span>
                        <div className="flex gap-1">
                           {[100, 500, 1000].map(val => (
                             <button 
                               key={val}
                               onClick={() => setSilverToGoldInput(val)}
                               className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md text-[8px] font-black text-white/60 transition-colors"
                             >
                               {val}
                             </button>
                           ))}
                           <button 
                             onClick={handleSetMaxSilver}
                             className="px-2 py-1 bg-brand-yellow/20 hover:bg-brand-yellow/30 rounded-md text-[8px] font-black text-brand-yellow transition-colors"
                           >
                             MAX
                           </button>
                        </div>
                      </div>
                      <input 
                        type="range"
                        min="10"
                        max={Math.max(stats.silver, 2000)}
                        step="10"
                        value={silverToGoldInput}
                        onChange={(e) => setSilverToGoldInput(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-yellow"
                      />
                   </div>
                   <div className="w-20 text-center">
                      <span className="text-2xl font-black font-mono text-white leading-none">{silverToGoldInput}</span>
                      <p className="text-[8px] font-black text-white/40 uppercase">S</p>
                   </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-yellow/20 rounded-xl">
                        <RefreshCw className="w-4 h-4 text-brand-yellow animate-spin-slow" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-white/40 uppercase">Est. Gold Received</p>
                        <p className="text-xl font-black font-mono text-brand-yellow leading-none">{silverToGoldResult} G</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-white/40 uppercase">Net Fee (5%)</p>
                      <p className="text-[10px] font-black text-white/80">-{Math.ceil(silverToGoldInput / silverPerGoldRate * networkFee)} G</p>
                   </div>
                </div>
             </div>

             <button 
               onClick={() => onPurchase('gold', silverToGoldResult, silverToGoldInput)}
               disabled={stats.silver < silverToGoldInput || silverToGoldResult <= 0}
               className="w-full bg-brand-yellow text-brand-dark font-black uppercase py-5 rounded-[2rem] neo-shadow-lg hover:scale-[1.02] active:scale-95 disabled:grayscale disabled:opacity-50 transition-all flex items-center justify-center gap-2 italic tracking-tighter text-xl"
             >
               Confirm Conversion
             </button>
          </div>

          {/* Gold TO Silver */}
          <div className="bg-brand-surface rounded-[2.5rem] p-8 border-2 border-gray-200 neo-shadow-lg border-brand-border bg-brand-surface">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-brand-teal">Treasury Exchange</h3>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Gold Habit → Silver Kota</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Market Rate</p>
                  <div className="bg-brand-bg px-3 py-1 rounded-full border border-gray-200 border-brand-border text-[10px] font-black text-brand-teal">
                    1G : {goldToSilverRate}S
                  </div>
                </div>
             </div>

             <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center gap-4">
                   <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] font-black text-gray-400 uppercase">Collateral Amount</span>
                        <div className="flex gap-1">
                           {[10, 50, 100].map(val => (
                             <button 
                               key={val}
                               onClick={() => setGoldToSilverInput(val)}
                               className="px-2 py-1 bg-brand-surface-alt hover:bg-brand-border rounded-md text-[8px] font-black text-gray-400 transition-colors bg-brand-surface-alt hover:bg-brand-surface-alt text-brand-muted"
                             >
                               {val}
                             </button>
                           ))}
                           <button 
                             onClick={handleSetMaxGold}
                             className="px-2 py-1 bg-brand-teal/10 hover:bg-brand-teal/20 rounded-md text-[8px] font-black text-brand-teal transition-colors"
                           >
                             MAX
                           </button>
                        </div>
                      </div>
                      <input 
                        type="range"
                        min="5"
                        max={Math.max(stats.gold, 500)}
                        step="5"
                        value={goldToSilverInput}
                        onChange={(e) => setGoldToSilverInput(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-brand-teal bg-brand-surface-alt"
                      />
                   </div>
                   <div className="w-20 text-center">
                      <span className="text-2xl font-black font-mono text-brand-dark leading-none">{goldToSilverInput}</span>
                      <p className="text-[8px] font-black text-gray-400 uppercase">G</p>
                   </div>
                </div>

                <div className="bg-brand-bg rounded-2xl p-4 flex items-center justify-between border border-gray-200 border-brand-border">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-teal/20 rounded-xl">
                        <RefreshCw className="w-4 h-4 text-brand-teal animate-spin-slow" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase">Est. Silver Liquidity</p>
                        <p className="text-xl font-black font-mono text-brand-teal leading-none">{goldToSilverResult} S</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-gray-400 uppercase">Stability Fee (5%)</p>
                      <p className="text-[10px] font-black text-gray-600">-{Math.ceil(goldToSilverInput * goldToSilverRate * networkFee)} S</p>
                   </div>
                </div>
             </div>

             <button 
               onClick={() => onPurchase('silver', goldToSilverResult, goldToSilverInput)}
               disabled={stats.gold < goldToSilverInput || goldToSilverResult <= 0}
               className="w-full bg-brand-teal text-brand-dark font-black uppercase py-5 rounded-[2rem] neo-shadow-lg hover:scale-[1.02] active:scale-95 disabled:grayscale disabled:opacity-50 transition-all flex items-center justify-center gap-2 italic tracking-tighter text-xl"
             >
               Liquidate to Silver
             </button>
          </div>
        </div>
      </div>

      {/* Gacha System (Enhanced) */}
      <div className="bg-brand-purple rounded-[2.5rem] p-8 text-white neo-shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 blur-sm group-hover:blur-0 transition-all duration-700 pointer-events-none">
          <Sparkles className="w-40 h-40" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-brand-yellow fill-brand-yellow" />
              <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Kuil Nasib</h3>
            </div>
            <button 
              onClick={() => setShowGachaInfo(!showGachaInfo)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              <Info className="w-5 h-5 text-brand-yellow" />
            </button>
          </div>
          <p className="text-white/60 text-[10px] mb-8 font-black uppercase tracking-[0.2em]">Sacrifice Gold for Civilization's Blessing</p>
          
          <AnimatePresence>
            {showGachaInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
              >
                <h4 className="text-[9px] font-black text-brand-yellow uppercase tracking-widest mb-3">Divine Drop Rates</h4>
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white/60 uppercase">Ultimate Jackpot (Gold)</span>
                      <span className="text-[10px] font-black text-brand-yellow">5%</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white/60 uppercase">Treasury Overflow (Silver)</span>
                      <span className="text-[10px] font-black text-brand-teal">25%</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white/60 uppercase">Ancient Wisdom (EXP)</span>
                      <span className="text-[10px] font-black text-brand-purple">30%</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white/60 uppercase">Life Blessing (HP)</span>
                      <span className="text-[10px] font-black text-brand-red">40%</span>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={onGacha}
            disabled={stats.gold < 100}
            className="w-full bg-white text-brand-dark font-black uppercase py-6 rounded-[2rem] neo-shadow-lg hover:bg-brand-yellow active:scale-95 disabled:grayscale disabled:opacity-50 transition-all text-xl flex items-center justify-center gap-2 mb-2 tracking-tighter italic"
          >
            Invoke the Shrine (100 G)
          </button>
          <div className="flex items-center justify-center gap-2 mt-4">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-white/10 border-2 border-brand-purple flex items-center justify-center text-[8px]">👤</div>
                ))}
             </div>
             <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">128 Players recently won</p>
          </div>
        </div>
      </div>
    </div>
  );
}
