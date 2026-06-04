import { signOut } from 'firebase/auth';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Award,
    Bell,
    CheckCircle,
    ChevronRight,
    Clock,
    Globe,
    HelpCircle,
    History,
    LogOut,
    MapPin,
    Moon,
    Settings,
    ShieldCheck,
    Sun,
    Trophy,
    User,
    X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { themeColors, useThemeStore } from '../hooks/useThemeStore';
import { auth } from '../lib/firebase';
import { ActivityLog, UserStats } from '../types';
import { LeaderboardTab } from './LeaderboardTab';

interface MenuTabProps {
  stats: UserStats;
  logs: ActivityLog[];
}

const FAQ_DATA = [
  {
    question: 'Apa itu CivFit?',
    answer: 'CivFit adalah permainan simulasi peradaban yang menggabungkan kebugaran dengan pembangunan kota. Aktivitas dunia nyatamu menghasilkan sumber daya untuk kotamu.',
  },
  {
    question: 'Bagaimana cara mendapatkan Silver?',
    answer: 'Silver didapatkan dari pajak warga, menyelesaikan misi harian, dan dari bangunan ekonomi seperti Pasar atau Bank.',
  },
  {
    question: 'Mengapa populasiku tidak sehat?',
    answer: 'Kesehatan kota turun jika layanan kesehatan tidak cukup atau polusi tinggi. Bangun Rumah Sakit dan jaga kebersihan kota.',
  },
  {
    question: 'Bagaimana cara maju era?',
    answer: 'Kumpulkan poin evolusi dengan meningkatkan populasi, kebahagiaan, dan produktivitas. Ketika memenuhi persyaratan, gunakan aksi "Evolve" di tab Kota.',
  },
  {
    question: 'Apa fungsi notifikasi?',
    answer: 'Notifikasi mengingatkan tentang acara penting, misi selesai, atau krisis kota. Anda dapat mengaktifkan atau menonaktifkannya di Pengaturan.',
  },
];

export function MenuTab({ stats, logs }: MenuTabProps) {
  const [activeSection, setActiveSection] = useState<'profile' | 'logs' | 'rank' | 'settings'>('profile');
  const user = auth.currentUser;
  const { isDark, toggleTheme } = useThemeStore();
  const colors = isDark ? themeColors.dark : themeColors.light;
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [selectedTimezone, setSelectedTimezone] = useState('WIB');
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);


  const badgeGallery = [
    { title: 'Pionir Batu', icon: 'Mountain', unlocked: stats.level >= 1 },
    { title: 'Ksatria Besi', icon: 'Shield', unlocked: stats.level >= 5 },
    { title: 'Insinyur Uap', icon: 'Zap', unlocked: stats.level >= 15 },
    { title: 'Warga Modern', icon: 'Smartphone', unlocked: stats.level >= 30 },
    { title: 'Avatar Digital', icon: 'Cpu', unlocked: stats.level >= 50 },
  ];

  const handleLogout = () => {
    if (window.confirm('Keluar dari peradaban Fitnismu?')) {
      signOut(auth);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-32" style={{ backgroundColor: colors.bg }}>
      {/* Menu Header / Switcher */}
      <div className="flex p-1.5 rounded-[2rem] neo-border shadow-[4px_4px_0_0_#2D3436]" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        {[
          { id: 'profile', label: 'Profil', icon: User },
          { id: 'logs', label: 'Log', icon: History },
          { id: 'rank', label: 'Rank', icon: Trophy },
          { id: 'settings', label: 'Opsi', icon: Settings }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all ${
                isActive ? 'text-white' : 'hover:opacity-75'
              }`}
              style={{
                backgroundColor: isActive ? '#2D3436' : 'transparent',
                color: isActive ? '#FFFFFF' : colors.textMuted
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Profile Card */}
            <div className="rounded-[2.5rem] p-8 neo-border-lg neo-shadow-lg flex flex-col items-center" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <div className="w-24 h-24 rounded-full neo-border flex items-center justify-center mb-6 shadow-[4px_4px_0_0_#2D3436] overflow-hidden" style={{ backgroundColor: colors.surfaceAlt, borderColor: colors.border }}>
                {user?.photoURL ? (
                   <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-12 h-12" style={{ color: colors.text }} />
                )}
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-1 leading-none text-center" style={{ color: colors.text }}>
                {user?.displayName || 'Citizen #9923'}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-8" style={{ color: colors.textMuted }}>Level {stats.level} Survivor</p>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="neo-border p-4 rounded-3xl flex flex-col items-center neo-shadow shadow-[2px_2px_0_0_#2D3436]" style={{ backgroundColor: colors.surfaceAlt, borderColor: colors.border }}>
                  <span className="text-xl font-black font-mono" style={{ color: colors.text }}>{stats.dayCount}</span>
                  <span className="text-[8px] font-black uppercase" style={{ color: colors.textMuted }}>Hari Aktif</span>
                </div>
                <div className="neo-border p-4 rounded-3xl flex flex-col items-center neo-shadow shadow-[2px_2px_0_0_#2D3436]" style={{ backgroundColor: colors.surfaceAlt, borderColor: colors.border }}>
                   <span className="text-xl font-black font-mono tracking-tighter italic" style={{ color: colors.text }}>S{stats.level}</span>
                   <span className="text-[8px] font-black uppercase" style={{ color: colors.textMuted }}>Tier Kota</span>
                </div>
              </div>
            </div>

            {/* Badge Gallery */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Award className="w-4 h-4" style={{ color: colors.textMuted }} />
                <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>Galeri Lencana</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {badgeGallery.map((badge, i) => (
                  <div 
                    key={i}
                    className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-2 border-2 transition-all p-3`}
                    style={{
                      backgroundColor: badge.unlocked ? colors.surface : colors.surfaceAlt,
                      borderColor: badge.unlocked ? colors.border : colors.borderMuted,
                      opacity: badge.unlocked ? 1 : 0.4,
                      filter: badge.unlocked ? 'none' : 'grayscale(100%)'
                    }}
                  >
                    <div className={`p-2 rounded-xl border border-brand-dark shadow-[1px_1px_0_0_#2D3436]`} style={{ backgroundColor: badge.unlocked ? '#FFE66D' : colors.surfaceAlt }}>
                      <Globe className={`w-6 h-6`} style={{ color: badge.unlocked ? '#2D3436' : colors.textMuted }} />
                    </div>
                    <span className="text-[8px] font-black uppercase text-center leading-tight tracking-tight" style={{ color: colors.text }}>{badge.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="rounded-[2.5rem] p-6 neo-border-lg neo-shadow-lg" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6" style={{ color: colors.text }} />
                <h3 className="text-xl font-black italic tracking-tighter uppercase" style={{ color: colors.text }}>Riwayat Aktivitas</h3>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                {(logs?.length || 0) > 0 ? (
                  logs.map((log) => (
                    <div 
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-2xl border-2 shadow-[2px_2px_0_0_#000]"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        borderColor: colors.border
                      }}
                    >
                      <div className={`mt-1 p-2 rounded-xl neo-border shadow-[1px_1px_0_0_#000]`} style={{
                        backgroundColor: log.change > 0 ? '#4ECDC4' : '#FF6B6B',
                        color: 'white'
                      }}>
                        {log.change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-tight leading-snug" style={{ color: colors.text }}>{log.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <span className={`text-[8px] font-black underline decoration-2 underline-offset-4 uppercase tracking-widest`} style={{
                            color: log.change > 0 ? '#4ECDC4' : '#FF6B6B'
                          }}>
                            {log.change > 0 ? '+' : ''}{log.change} {log.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-[10px] font-black uppercase italic tracking-widest" style={{ color: colors.textMuted }}>Belum ada catatan aktivitas...</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'rank' && (
          <motion.div
            key="rank"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <LeaderboardTab isEmbedded />
          </motion.div>
        )}

        {activeSection === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Preferences */}
            <div className="rounded-[2.5rem] p-8 space-y-4 neo-shadow-lg neoborder-lg" style={{ backgroundColor: isDark ? '#1E293B' : '#2D3436', borderColor: isDark ? '#334155' : '#2D3436' }}>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-brand-teal">Layanan Sektor</h3>
                  <ShieldCheck className="w-6 h-6 text-brand-teal" />
               </div>
               
               <div className="space-y-3">
                  <button 
                    onClick={() => setShowTimezoneModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl neo-border hover:opacity-80 transition-all active:translate-y-0.5"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: isDark ? '#475569' : '#4B5563' }}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-brand-teal" />
                      <span className="text-sm font-black uppercase tracking-tight text-white">Zona Waktu</span>
                    </div>
                    <span className="text-[10px] font-black text-brand-yellow">{selectedTimezone}</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-4 rounded-2xl neo-border hover:opacity-80 transition-all active:translate-y-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: isDark ? '#475569' : '#4B5563' }}>
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-brand-teal" />
                      <span className="text-sm font-black uppercase tracking-tight text-white">Notifikasi</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationEnabled}
                      onChange={(e) => setNotificationEnabled(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </button>
                  <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 rounded-2xl neo-border hover:opacity-80 transition-all active:translate-y-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: isDark ? '#475569' : '#4B5563' }}>
                    <div className="flex items-center gap-3">
                      {isDark ? <Moon className="w-4 h-4 text-brand-teal" /> : <Sun className="w-4 h-4 text-brand-teal" />}
                      <span className="text-sm font-black uppercase tracking-tight text-white">Mode Gelap</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isDark}
                      onChange={toggleTheme}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </button>
                  <button 
                    onClick={() => setShowFaqModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl neo-border hover:opacity-80 transition-all active:translate-y-0.5"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: isDark ? '#475569' : '#4B5563' }}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-brand-teal" />
                      <span className="text-sm font-black uppercase tracking-tight text-white">Bantuan & FAQ</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </button>
               </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full text-white py-5 rounded-[2rem] neo-border shadow-[4px_4px_0_0_#2D3436] flex items-center justify-center gap-3 hover:opacity-90 active:translate-y-1 active:shadow-none transition-all"
              style={{ backgroundColor: '#FF6B6B', borderColor: '#2D3436' }}
            >
               <LogOut className="w-5 h-5" />
               <span className="font-black uppercase italic tracking-widest text-lg">Keluar Sesi</span>
            </button>

            {/* Timezone Modal */}
            <AnimatePresence>
              {showTimezoneModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="neo-border-lg p-6 rounded-3xl w-full max-w-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black uppercase" style={{ color: colors.text }}>Pilih Zona Waktu</h3>
                      <button onClick={() => setShowTimezoneModal(false)}>
                        <X className="w-6 h-6" style={{ color: colors.text }} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {['WIB', 'WITA', 'WIT'].map((tz) => (
                        <button
                          key={tz}
                          onClick={() => {
                            setSelectedTimezone(tz);
                            setShowTimezoneModal(false);
                          }}
                          className="w-full p-3 text-left neo-border rounded-lg flex justify-between items-center transition-all hover:opacity-80"
                          style={{ backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.text }}
                        >
                          <span className="font-bold">{tz}</span>
                          {selectedTimezone === tz && (
                            <CheckCircle className="w-5 h-5 text-brand-teal" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAQ Modal */}
            <AnimatePresence>
              {showFaqModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="neo-border-lg p-6 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  >
                    <div className="flex justify-between items-center mb-6 sticky top-0 pb-4" style={{ backgroundColor: colors.surface }}>
                      <h3 className="text-lg font-black uppercase" style={{ color: colors.text }}>Bantuan & FAQ</h3>
                      <button onClick={() => setShowFaqModal(false)}>
                        <X className="w-6 h-6" style={{ color: colors.text }} />
                      </button>
                    </div>
                    <div className="space-y-6">
                      {FAQ_DATA.map((item, idx) => (
                        <div key={idx} className="pb-4" style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
                          <h4 className="text-sm font-black uppercase mb-2" style={{ color: colors.text }}>❓ {item.question}</h4>
                          <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="text-center py-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 leading-none" style={{ color: colors.textMuted }}>CivFit v1.7.0 Cloud Sync</p>
        <p className="text-[8px] font-bold uppercase italic tracking-widest" style={{ color: colors.textMuted }}>Build peradabanmu, bangun dirimu.</p>
      </div>
    </div>
  );
}
