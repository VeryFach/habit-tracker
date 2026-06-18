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
    Settings,
    ShieldCheck,
    Trophy,
    User,
    X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { DeleteAccountButton } from './DeleteAccountButton';
import { ThemeToggle } from './ThemeToggle';
import { auth } from '../lib/firebase';
import { ActivityLog, UserStats } from '../types';
import { LeaderboardTab } from './LeaderboardTab';

interface MenuTabProps {
  stats: UserStats;
  logs: ActivityLog[];
}

const FAQ_DATA = [
  {
    question: 'Apa itu Habitoria?',
    answer: 'Habitoria adalah permainan simulasi peradaban yang menggabungkan kebugaran dengan pembangunan kota. Aktivitas dunia nyatamu menghasilkan sumber daya untuk kotamu.',
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
    <div className="flex flex-col gap-6 p-4 pb-32 transition-colors duration-300">
      {/* Tab Switcher */}
      <div className="flex p-1 rounded-2xl border-2 border-brand-border bg-brand-surface transition-colors">
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
                isActive
                  ? 'bg-brand-surface-alt text-brand-dark neo-shadow-sm'
                  : 'text-brand-muted hover:opacity-75'
              }`}
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
            {/* Profile Section */}
            <div className="flex flex-col items-center rounded-2xl bg-brand-surface border-2 border-brand-border p-6 transition-colors sm:rounded-3xl sm:p-8">
              <div className="mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-brand-border bg-brand-surface-alt shadow-sm sm:h-24 sm:w-24">
                {user?.photoURL ? (
                   <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-12 h-12 text-brand-dark" />
                )}
              </div>
              <h3 className="mb-1 text-center text-2xl font-black italic uppercase leading-none tracking-tighter text-brand-dark sm:text-3xl">
                {user?.displayName || 'Citizen #9923'}
              </h3>
              <p className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Level {stats.level} Survivor</p>

              <div className="grid w-full grid-cols-2 gap-3">
                <div className="flex flex-col items-center rounded-2xl border border-brand-border bg-brand-surface-alt p-4">
                  <span className="font-mono text-xl font-black text-brand-dark">{stats.dayCount}</span>
                  <span className="text-[8px] font-black uppercase text-brand-muted">Hari Aktif</span>
                </div>
                <div className="flex flex-col items-center rounded-2xl border border-brand-border bg-brand-surface-alt p-4">
                  <span className="font-mono text-xl font-black italic tracking-tighter text-brand-dark">S{stats.level}</span>
                  <span className="text-[8px] font-black uppercase text-brand-muted">Tier Kota</span>
                </div>
              </div>
            </div>

            {/* Badge Gallery */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Award className="w-4 h-4 text-brand-muted" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Galeri Lencana</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {badgeGallery.map((badge, i) => (
                  <div
                    key={i}
                    className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border transition-all p-3 ${
                      badge.unlocked
                        ? 'border-brand-border bg-brand-surface'
                        : 'border-brand-border bg-brand-surface-alt opacity-40 grayscale'
                    }`}
                  >
                    <div className={`rounded-xl p-2 ${badge.unlocked ? 'bg-brand-yellow' : 'border border-brand-border bg-brand-surface-alt'}`}>
                      <Globe className={`h-6 w-6 ${badge.unlocked ? 'text-brand-dark' : 'text-brand-muted'}`} />
                    </div>
                    <span className="text-center text-[8px] font-black uppercase leading-tight tracking-tight text-brand-dark">{badge.title}</span>
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
            <div className="space-y-4 rounded-2xl bg-brand-surface border-2 border-brand-border p-5 transition-colors sm:rounded-3xl sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6 text-brand-dark" />
                <h3 className="text-xl font-black italic tracking-tighter uppercase text-brand-dark">Riwayat Aktivitas</h3>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                {(logs?.length || 0) > 0 ? (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-surface-alt p-4"
                    >
                      <div className={`mt-1 rounded-xl p-2 text-white ${log.change > 0 ? 'bg-brand-teal' : 'bg-brand-red'}`}>
                        {log.change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-tight leading-snug text-brand-dark">{log.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em] text-brand-muted">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <span className={`text-[8px] font-black underline decoration-2 underline-offset-4 uppercase tracking-widest ${log.change > 0 ? 'text-brand-teal' : 'text-brand-red'}`}>
                            {log.change > 0 ? '+' : ''}{log.change} {log.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-[10px] font-black uppercase italic tracking-widest text-brand-muted">Belum ada catatan aktivitas...</p>
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
            {/* Theme Settings */}
            <div className="space-y-5 rounded-2xl bg-brand-surface border-2 border-brand-border p-6 transition-colors sm:rounded-3xl sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tighter text-brand-teal">Theme</h3>
                  <p className="text-[10px] font-bold text-brand-muted mt-1">Choose your visual preference</p>
                </div>
              </div>
              <ThemeToggle variant="full" />
            </div>

            {/* Preferences */}
            <div className="space-y-4 rounded-2xl bg-brand-surface border-2 border-brand-border p-6 sm:rounded-3xl sm:p-8">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-brand-teal">Layanan Sektor</h3>
                  <ShieldCheck className="w-6 h-6 text-brand-teal" />
               </div>

               <div className="space-y-3">
                  <button
                    onClick={() => setShowTimezoneModal(true)}
                    className="flex w-full items-center justify-between rounded-2xl border border-brand-border bg-brand-surface-alt p-4 transition-all hover:opacity-80 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-brand-teal" />
                      <span className="text-sm font-black uppercase tracking-tight text-brand-dark">Zona Waktu</span>
                    </div>
                    <span className="text-[10px] font-black text-brand-yellow">{selectedTimezone}</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-2xl border border-brand-border bg-brand-surface-alt p-4 transition-all hover:opacity-80 active:scale-[0.98]">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-brand-teal" />
                      <span className="text-sm font-black uppercase tracking-tight text-brand-dark">Notifikasi</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationEnabled}
                      onChange={(e) => setNotificationEnabled(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </button>
                  <button
                    onClick={() => setShowFaqModal(true)}
                    className="flex w-full items-center justify-between rounded-2xl border border-brand-border bg-brand-surface-alt p-4 transition-all hover:opacity-80 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-brand-teal" />
                      <span className="text-sm font-black uppercase tracking-tight text-brand-dark">Bantuan & FAQ</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-muted" />
                  </button>
               </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-red py-5 text-white neo-shadow transition-all hover:opacity-90 active:scale-95"
            >
               <LogOut className="w-5 h-5" />
               <span className="font-black uppercase italic tracking-widest text-lg">Keluar Sesi</span>
            </button>

            <DeleteAccountButton />

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
                    className="border-2 border-brand-border p-6 rounded-3xl w-full max-w-sm bg-brand-surface neo-shadow-lg"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black uppercase text-brand-dark">Pilih Zona Waktu</h3>
                      <button onClick={() => setShowTimezoneModal(false)}>
                        <X className="w-6 h-6 text-brand-dark" />
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
                          className="w-full p-3 text-left border border-brand-border rounded-lg flex justify-between items-center transition-all hover:opacity-80 bg-brand-surface-alt text-brand-dark"
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
                    className="border-2 border-brand-border p-6 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-brand-surface neo-shadow-lg"
                  >
                    <div className="flex justify-between items-center mb-6 sticky top-0 pb-4 bg-brand-surface">
                      <h3 className="text-lg font-black uppercase text-brand-dark">Bantuan & FAQ</h3>
                      <button onClick={() => setShowFaqModal(false)}>
                        <X className="w-6 h-6 text-brand-dark" />
                      </button>
                    </div>
                    <div className="space-y-6">
                      {FAQ_DATA.map((item, idx) => (
                        <div key={idx} className="pb-4 border-b border-brand-border">
                          <h4 className="text-sm font-black uppercase mb-2 text-brand-dark">❓ {item.question}</h4>
                          <p className="text-sm leading-relaxed text-brand-muted">{item.answer}</p>
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
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.4em] mb-2 leading-none">Habitoria v1.7.0 Cloud Sync</p>
        <p className="text-[8px] font-bold uppercase italic tracking-widest text-brand-muted">Build peradabanmu, bangun dirimu.</p>
      </div>
    </div>
  );
}
