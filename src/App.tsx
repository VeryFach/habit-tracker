import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { RealitaTab } from './components/RealitaTab';
import { KotaTab } from './components/KotaTab';
import { TokoTab } from './components/TokoTab';
import { MenuTab } from './components/MenuTab';
import { EvolutionTab } from './components/EvolutionTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { DailyReportOverlay } from './components/DailyReportOverlay';
import { LoginScreen } from './components/LoginScreen';
import { useCivStore } from './hooks/useCivStore';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { UserStats } from './types';
import { motion, AnimatePresence } from 'motion/react';

import { TrendingUp, ChevronRight } from 'lucide-react';

const applyExpReward = (currentStats: UserStats, expGain: number): UserStats => {
  let exp = currentStats.exp + expGain;
  let level = currentStats.level;
  let maxExp = currentStats.maxExp;

  while (exp >= maxExp) {
    exp -= maxExp;
    level += 1;
    maxExp = Math.floor(maxExp * 1.2);
  }

  return {
    ...currentStats,
    exp,
    level,
    maxExp
  };
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('realita');
  const { 
    currentUser,
    loading,
    stats, setStats, 
    habits, addHabit, completeHabit, updateHabit, deleteHabit,
    city, 
    logs, addLog,
    syncStatsAndCity,
    deployBuilding,
    upgradeBuilding,
    removeBuilding,
    unlockEvolution,
    endDay
  } = useCivStore();

  const isOnline = useOnlineStatus();

  const [sleepFlow, setSleepFlow] = useState<{ step: 'animating' | 'summary' | 'levelup' | null, data: any }>({ step: null, data: null });
  const [gachaReward, setGachaReward] = useState<{ type: string, amount: number, message: string } | null>(null);
  const [conversionStatus, setConversionStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    type: 'gold' | 'silver';
  } | null>(null);

  // Level Up Detection
  useEffect(() => {
    if (stats.level > stats.lastCelebratedLevel) {
       setStats(s => ({ ...s, lastCelebratedLevel: stats.level }));
       setSleepFlow({ step: 'levelup', data: { oldLevel: stats.level - 1, newLevel: stats.level } });
    }
  }, [stats.level, stats.lastCelebratedLevel, setStats]);

  const handleEndDay = async () => {
    setSleepFlow({ step: 'animating', data: null });
    const report = await endDay();
    
    // Auto advance from animation to summary after delay
    setTimeout(() => {
      setSleepFlow({ step: 'summary', data: report });
    }, 2500);
  };

  const handleCloseReport = async () => {
    const updatedStats = { ...stats, pendingReport: null };
    await syncStatsAndCity(updatedStats, city);
    setSleepFlow({ step: null, data: null });
  };

  const handlePurchase = async (type: 'hp' | 'silver' | 'gold' | 'skipTicket', amount: number, cost: number) => {
    if (type === 'hp') {
      if (stats.gold < cost) {
        setConversionStatus({ show: true, success: false, message: 'Gold habit tidak cukup!', type: 'silver' });
        return;
      }
      const updatedStats = { ...stats, hp: Math.min(stats.maxHp, stats.hp + amount), gold: stats.gold - cost };
      await syncStatsAndCity(updatedStats, city);
      addLog('economy', 'Bought recovery item', amount, 'hp');
    } else if (type === 'skipTicket') {
      if (stats.gold < cost) {
        setConversionStatus({ show: true, success: false, message: 'Gold habit tidak cukup!', type: 'silver' });
        return;
      }
      const updatedStats = { ...stats, skipTickets: stats.skipTickets + 1, gold: stats.gold - cost };
      await syncStatsAndCity(updatedStats, city);
      addLog('economy', 'Bought Skip Ticket', 1, 'system');
      setConversionStatus({ show: true, success: true, message: 'Skip Ticket purchased! Simulation protected.', type: 'gold' });
    } else if (type === 'silver') {
      if (stats.gold < cost) {
        setConversionStatus({ show: true, success: false, message: 'Gold habit tidak cukup!', type: 'silver' });
        return;
      }
      const updatedStats = { ...stats, silver: stats.silver + amount, gold: stats.gold - cost };
      await syncStatsAndCity(updatedStats, city);
      addLog('economy', 'Exchanged gold for silver', amount, 'silver');
      setConversionStatus({ show: true, success: true, message: `Konversi Berhasil! ${amount} Silver diterima.`, type: 'silver' });
    } else if (type === 'gold') {
      if (stats.silver < cost) {
        setConversionStatus({ show: true, success: false, message: 'Silver kota tidak cukup!', type: 'gold' });
        return;
      }
      const updatedStats = { ...stats, gold: stats.gold + amount, silver: stats.silver - cost };
      await syncStatsAndCity(updatedStats, city);
      addLog('economy', 'Exchanged silver for gold', amount, 'gold');
      setConversionStatus({ show: true, success: true, message: `Konversi Berhasil! ${amount} Gold diterima.`, type: 'gold' });
    }
  };

  const handleDeployBuilding = (buildingTypeId: string, silverCost: number, goldCost: number, x: number, y: number) => {
    deployBuilding(buildingTypeId, silverCost, goldCost, x, y);
  };

  const handleGacha = async () => {
    if (stats.gold < 100) return;
    
    const rand = Math.random();
    let reward: { type: 'gold' | 'silver' | 'exp' | 'hp', amount: number, message: string };

    if (rand > 0.95) {
      reward = { type: 'gold', amount: 500, message: 'JACKPOT! Dewa memberkatimu.' };
    } else if (rand > 0.7) {
      reward = { type: 'silver', amount: 1000, message: 'Kekayaan kota meningkat.' };
    } else if (rand > 0.4) {
      reward = { type: 'exp', amount: 200, message: 'Hikmat dan ilmu pengetahuan.' };
    } else {
      reward = { type: 'hp', amount: 20, message: 'Berkat kesehatan.' };
    }

    let updatedStats: UserStats = { ...stats, gold: stats.gold - 100 };
    if (reward.type === 'gold') updatedStats = { ...updatedStats, gold: updatedStats.gold + reward.amount };
    if (reward.type === 'silver') updatedStats = { ...updatedStats, silver: updatedStats.silver + reward.amount };
    if (reward.type === 'exp') updatedStats = applyExpReward(updatedStats, reward.amount);
    if (reward.type === 'hp') updatedStats = { ...updatedStats, hp: Math.min(updatedStats.maxHp, updatedStats.hp + reward.amount) };

    await syncStatsAndCity(updatedStats, city);

    addLog('economy', `Gacha: ${reward.message}`, reward.amount, reward.type);
    setGachaReward(reward);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-4xl"
        >
          🏰
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center">
      <Header stats={stats} />
      
      {!isOnline && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-24 z-50 bg-brand-red text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-border neo-shadow-sm flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Offline Mode: Limited Sync
        </motion.div>
      )}
      
      <main className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-32 pt-20 relative min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {currentTab === 'realita' && (
            <motion.div
              key="realita"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <RealitaTab 
                habits={habits} 
                hp={stats.hp} 
                momentum={stats.momentum}
                onAdd={addHabit} 
                onComplete={completeHabit} 
                onUpdate={updateHabit}
                onDelete={deleteHabit}
                onEndDay={handleEndDay} 
              />
            </motion.div>
          )}

          {currentTab === 'kota' && (
            <motion.div
              key="kota"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <KotaTab 
                city={city} 
                stats={stats} 
                onDeploy={handleDeployBuilding} 
                onUpgrade={upgradeBuilding}
                onRemove={removeBuilding}
                onSwitchTab={setCurrentTab}
              />
            </motion.div>
          )}

          {currentTab === 'evolution' && (
            <motion.div
              key="evolution"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EvolutionTab 
                stats={stats}
                city={city}
                onUnlock={unlockEvolution}
                onBack={() => setCurrentTab('kota')}
              />
            </motion.div>
          )}

          {currentTab === 'toko' && (
            <motion.div
              key="toko"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TokoTab 
                stats={stats} 
                onPurchase={handlePurchase} 
                onGacha={handleGacha} 
              />
            </motion.div>
          )}

          {currentTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MenuTab stats={stats} logs={logs} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {sleepFlow.step === 'animating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-dark z-[300] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Minimalist stars */}
            <div className="absolute inset-0 overflow-hidden">
               {Array.from({ length: 40 }).map((_, i) => (
                 <motion.div
                   key={i}
                   className="absolute bg-white rounded-full w-0.5 h-0.5"
                   style={{
                     left: `${Math.random() * 100}%`,
                     top: `${Math.random() * 100}%`,
                   }}
                   animate={{ opacity: [0.2, 1, 0.2] }}
                   transition={{ duration: 1 + Math.random() * 2, repeat: Infinity }}
                 />
               ))}
            </div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="relative z-10 flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 bg-brand-yellow rounded-full shadow-[0_0_80px_#FDCC0D]" />
              <p className="text-white font-black italic uppercase tracking-[0.4em] text-xl animate-pulse">Menuju Pagi...</p>
            </motion.div>
          </motion.div>
        )}

        {sleepFlow.step === 'summary' && (
          <DailyReportOverlay 
            report={sleepFlow.data} 
            stats={stats} 
            onClose={handleCloseReport} 
          />
        )}

        {sleepFlow.step === 'levelup' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center p-8 overflow-hidden bg-brand-teal"
          >
             {/* Sparkles or Konfetti placeholder */}
             <div className="absolute inset-0 opacity-20 pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-6xl"
                    initial={{ top: '120%', left: `${Math.random() * 100}%` }}
                    animate={{ top: '-20%' }}
                    transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                  >
                    ✨
                  </motion.div>
                ))}
             </div>

             <motion.div
               initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
               animate={{ scale: 1, rotate: 0, opacity: 1 }}
               className="bg-brand-surface border-2 border-brand-border p-10 rounded-[3rem] neo-shadow-lg text-center max-w-sm relative z-10"
             >
                <div className="mb-6 inline-block bg-brand-yellow p-4 rounded-3xl border-2 border-brand-border neo-shadow">
                   <TrendingUp className="w-12 h-12 text-brand-dark" />
                </div>
                <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">LEVEL UP!</h2>
                <p className="text-brand-muted font-black uppercase text-xs tracking-widest mb-8">Evolusimu Berlanjut</p>
                
                <div className="flex items-center justify-center gap-6 mb-10">
                   <div className="flex flex-col items-center">
                      <span className="text-4xl font-mono grayscale opacity-40">LVL {sleepFlow.data.oldLevel}</span>
                   </div>
                   <ChevronRight className="w-8 h-8 text-brand-dark opacity-20" />
                   <div className="flex flex-col items-center">
                      <span className="text-6xl font-mono font-black italic bg-brand-teal px-4 rounded-2xl border-2 border-brand-border">LVL {sleepFlow.data.newLevel}</span>
                   </div>
                </div>

                <button
                  onClick={() => setSleepFlow({ step: null, data: null })}
                  className="w-full bg-brand-dark text-white font-black py-5 rounded-2xl neo-shadow-lg hover:bg-brand-dark/90 active:scale-95 transition-all uppercase italic tracking-tighter text-xl"
                >
                  TERIMA KEKUATAN BARU
                </button>
             </motion.div>
          </motion.div>
        )}

        {gachaReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-8 bg-brand-dark/20 backdrop-blur-md"
            onClick={() => setGachaReward(null)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, rotate: 10 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-brand-surface border-2 border-brand-border p-10 rounded-[3rem] neo-shadow-lg text-center max-w-sm relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-brand-yellow rounded-full border-2 border-brand-border flex items-center justify-center text-5xl neo-shadow animate-bounce">
                {gachaReward.type === 'gold' ? '💰' : gachaReward.type === 'silver' ? '🪙' : gachaReward.type === 'exp' ? '✨' : '❤️'}
              </div>

              <div className="mt-8">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-brand-dark">Kuil Nasib</h3>
                <p className="text-brand-muted font-extrabold uppercase text-[10px] tracking-[0.3em] mb-6">Berkat yang Diterima</p>
                
                <div className="bg-brand-bg border-2 border-brand-border rounded-3xl p-6 mb-8">
                  <span className="text-6xl font-black font-mono text-brand-teal">+{gachaReward.amount}</span>
                  <p className="text-xs font-black uppercase text-brand-subtle mt-1">{gachaReward.type}</p>
                </div>

                <p className="font-bold text-sm text-brand-dark mb-10 italic">"{gachaReward.message}"</p>

                <button
                  onClick={() => setGachaReward(null)}
                  className="w-full bg-brand-teal text-brand-dark font-black py-5 rounded-2xl neo-shadow-lg hover:bg-brand-teal/90 active:scale-95 transition-all uppercase italic tracking-tighter text-xl"
                >
                  SYUKUR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {conversionStatus?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-brand-dark/40 backdrop-blur-sm"
            onClick={() => setConversionStatus(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-xs p-8 rounded-[2.5rem] border-2 border-brand-border neo-shadow-lg text-center ${
                conversionStatus.success ? 'bg-white' : 'bg-brand-red text-white'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl ${
                conversionStatus.success ? 'bg-brand-bg' : 'bg-white/20'
              }`}>
                {conversionStatus.success ? (conversionStatus.type === 'gold' ? '💰' : '🪙') : '❌'}
              </div>
              <h4 className={`text-2xl font-black italic uppercase tracking-tighter mb-2 ${
                conversionStatus.success ? 'text-brand-dark' : 'text-white'
              }`}>
                {conversionStatus.success ? 'Berhasil!' : 'Gagal!'}
              </h4>
              <p className={`font-bold mb-6 ${
                conversionStatus.success ? 'text-brand-muted' : 'text-white/80'
              }`}>
                {conversionStatus.message}
              </p>
              <button
                onClick={() => setConversionStatus(null)}
                className={`w-full py-4 rounded-2xl font-black uppercase italic tracking-tighter neo-shadow-lg transition-all active:scale-95 ${
                  conversionStatus.success ? 'bg-brand-teal text-brand-dark' : 'bg-white text-brand-red'
                }`}
              >
                MENGERTI
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
}
