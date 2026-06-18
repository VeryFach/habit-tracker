import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, TrendingUp, Medal } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { ERAS_CONFIG } from '../constants';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string;
  level: number;
  population: number;
  currentEra: string;
}

interface LeaderboardTabProps {
  isEmbedded?: boolean;
}

export function LeaderboardTab({ isEmbedded }: LeaderboardTabProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('level', 'desc'),
      orderBy('population', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
      setEntries(data);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'leaderboard'));

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 ${isEmbedded ? '' : 'p-4 pb-32'}`}>
      {/* Header */}
      <div className="bg-brand-dark text-white rounded-[2.5rem] p-6 neo-shadow transform -rotate-1">
        <div className="flex items-center gap-4">
          <div className="bg-brand-yellow p-2.5 rounded-2xl border border-gray-200 neo-shadow-sm">
            <Trophy className="w-6 h-6 text-brand-dark" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Global Rankings</h2>
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-1">Simulated Leaders</p>
          </div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-4">
        {entries.map((entry, index) => {
          const isTop3 = index < 3;
          const medalColors = ['bg-brand-yellow', 'bg-gray-300', 'bg-orange-400'];
          
          return (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-[2rem] border-2 transition-all ${
                isTop3 ? 'bg-white border-gray-200 neo-shadow-lg' : 'bg-white/50 border-gray-200/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center font-black text-xl neo-shadow-sm flex-shrink-0 ${isTop3 ? medalColors[index] : 'bg-brand-bg'}`}>
                {index + 1}
              </div>

              <div className="w-12 h-12 rounded-full border-2 border-gray-200 overflow-hidden flex-shrink-0">
                 {entry.photoURL ? (
                    <img src={entry.photoURL} alt={entry.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 ) : (
                    <div className="w-full h-full bg-brand-teal flex items-center justify-center text-white font-black">
                       {entry.displayName.slice(0, 1)}
                    </div>
                 )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-black uppercase tracking-tighter truncate text-brand-dark leading-tight">
                  {entry.displayName}
                </p>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-brand-teal" />
                      <span className="text-[10px] font-black text-gray-500 uppercase">Lv.{entry.level}</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-brand-teal" />
                      <span className="text-[10px] font-black text-gray-500 uppercase">{entry.population.toLocaleString()} Pop</span>
                   </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                 <span className="text-[8px] font-black text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded whitespace-nowrap uppercase tracking-widest">
                   {ERAS_CONFIG.find(e => e.id === entry.currentEra)?.displayName ?? entry.currentEra}
                 </span>
                 {isTop3 && (
                   <Medal className={`w-5 h-5 mt-1 ${index === 0 ? 'text-brand-yellow' : 'text-gray-400'}`} />
                 )}
              </div>
            </motion.div>
          );
        })}

        {entries.length === 0 && (
          <div className="bg-white/50 p-12 rounded-[2rem] border-2 border-dashed border-gray-200 text-center">
             <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">No rankings yet</p>
          </div>
        )}
      </div>

      <div className="p-8 bg-brand-teal/5 border-2 border-brand-teal/15 rounded-[2.5rem] mt-4">
         <p className="text-[10px] font-black text-brand-teal uppercase tracking-[0.2em] mb-2 leading-tight">Expansion Note</p>
         <p className="text-xs font-bold text-gray-500 leading-relaxed italic">
           Rankings are updated every time you complete a daily report or build infrastructure. Only the top 20 survivors are shown.
         </p>
      </div>
    </div>
  );
}
