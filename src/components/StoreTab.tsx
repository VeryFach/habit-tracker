import {
    ArrowRightLeft,
    CheckCircle,
    Coffee,
    Coins,
    Info,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { themeColors, useThemeStore } from '../hooks/useThemeStore';
import { UserStats } from '../types';

interface GachaReward {
  type: 'gold' | 'silver' | 'exp' | 'hp';
  amount: number;
}

interface StoreTabProps {
  stats: UserStats;
  onPurchase: (type: 'hp' | 'silver' | 'gold' | 'skipTicket', amount: number, cost: number) => void;
  onGacha: () => Promise<GachaReward | void>;
}

const RECOVERY_ITEMS = [
  {
    id: 'coffee',
    name: 'COFFEE',
    description: 'Quick energy boost',
    hpRestore: 30,
    costGold: 50,
    icon: Coffee,
  },
  {
    id: 'skipTicket',
    name: 'SKIP TICKET',
    description: 'Protection Active',
    hpRestore: 0,
    costGold: 100,
    icon: ShieldCheck,
  },
];

export function StoreTab({ stats, onPurchase, onGacha }: StoreTabProps) {
  const { isDark } = useThemeStore();
  const colors = isDark ? themeColors.dark : themeColors.light;
  
  const [silverInput, setSilverInput] = useState(100);
  const [goldInput, setGoldInput] = useState(10);
  const [showGachaInfo, setShowGachaInfo] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupResult, setPopupResult] = useState<any>(null);
  const [isOpeningGacha, setIsOpeningGacha] = useState(false);

  const silverPerGoldRate = useMemo(() => Math.round(12 + Math.sin(stats.dayCount) * 2), [stats.dayCount]);
  const goldToSilverRate = useMemo(() => Math.round(8 + Math.cos(stats.dayCount) * 1.5), [stats.dayCount]);
  const networkFee = 0.05;

  const silverToGoldResult = useMemo(() => {
    const amount = Math.floor(silverInput / silverPerGoldRate);
    const fee = Math.ceil(amount * networkFee);
    return Math.max(0, amount - fee);
  }, [silverInput, silverPerGoldRate]);

  const goldToSilverResult = useMemo(() => {
    const rawResult = goldInput * goldToSilverRate;
    const fee = Math.ceil(rawResult * networkFee);
    return Math.max(0, rawResult - fee);
  }, [goldInput, goldToSilverRate]);

  const handleRecoveryPurchase = (item: typeof RECOVERY_ITEMS[0]) => {
    if (item.id === 'skipTicket') {
      onPurchase('skipTicket', 1, item.costGold);
      showPopupMessage({
        title: 'Skip Ticket',
        subtitle: 'Protection Active',
        icon: 'shield',
        color: 'brand-teal',
        details: [
          { label: 'Item', value: item.name },
          { label: 'Effect', value: 'PROTECTION' },
          { label: 'Gold Spent', value: `-${item.costGold} G` },
        ],
      });
    } else {
      onPurchase('hp', item.hpRestore, item.costGold);
      showPopupMessage({
        title: item.name,
        subtitle: 'Recovery Successful',
        icon: 'check',
        color: 'brand-red',
        details: [
          { label: 'Item', value: item.name },
          { label: 'HP Restored', value: `+${item.hpRestore} HP` },
          { label: 'Gold Spent', value: `-${item.costGold} G` },
        ],
      });
    }
  };

  const handleSilverToGold = () => {
    const fee = Math.ceil((silverInput / silverPerGoldRate) * networkFee);
    onPurchase('gold', silverToGoldResult, silverInput);
    showPopupMessage({
      title: 'Conversion Successful',
      subtitle: 'Silver → Gold',
      icon: 'zap',
      color: 'brand-yellow',
      details: [
        { label: 'Silver Spent', value: `-${silverInput} S` },
        { label: 'Gold Received', value: `+${silverToGoldResult} G` },
        { label: 'Network Fee (5%)', value: `-${fee} G` },
        { label: 'Rate', value: `${silverPerGoldRate}S : 1G` },
      ],
    });
  };

  const handleGoldToSilver = () => {
    const fee = Math.ceil(goldInput * goldToSilverRate * networkFee);
    onPurchase('silver', goldToSilverResult, goldInput);
    showPopupMessage({
      title: 'Liquidation Successful',
      subtitle: 'Gold → Silver',
      icon: 'zap',
      color: 'brand-teal',
      details: [
        { label: 'Gold Spent', value: `-${goldInput} G` },
        { label: 'Silver Received', value: `+${goldToSilverResult} S` },
        { label: 'Stability Fee (5%)', value: `-${fee} S` },
        { label: 'Rate', value: `1G : ${goldToSilverRate}S` },
      ],
    });
  };

  const handleGacha = async () => {
    if (stats.gold < 100) return;
    setIsOpeningGacha(true);
    const reward = await onGacha();
    setIsOpeningGacha(false);

    if (reward) {
      showPopupMessage({
        title: 'Shrine Gift',
        subtitle: 'Divine Blessing Received',
        icon: 'sparkles',
        color: 'brand-purple',
        details: [
          { label: 'Reward Type', value: reward.type.toUpperCase() },
          { label: 'Amount', value: `+${reward.amount}` },
        ],
      });
    }
  };

  const showPopupMessage = (msg: any) => {
    setPopupResult(msg);
    setPopupVisible(true);
    setTimeout(() => setPopupVisible(false), 3000);
  };

  return (
    <div className="space-y-6" style={{ backgroundColor: colors.bg }}>
      {/* Recovery Items */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-2">
          <Coffee className="w-4 h-4" style={{ color: colors.textMuted }} />
          <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>Survival Supplies</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {RECOVERY_ITEMS.map((item) => {
            const canAfford = stats.gold >= item.costGold;
            return (
              <button
                key={item.id}
                disabled={!canAfford}
                onClick={() => handleRecoveryPurchase(item)}
                className={`neo-border p-4 rounded-2xl transition-all ${
                  canAfford
                    ? 'hover:neo-shadow hover:scale-105 active:scale-95'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: canAfford ? colors.surface : colors.surfaceAlt,
                  borderColor: colors.border,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <item.icon className="w-6 h-6" style={{ color: colors.text }} />
                  <div className="bg-brand-yellow neo-border px-2 py-1 rounded-lg flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    <span className="text-xs font-black">{item.costGold}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase mb-1" style={{ color: colors.text }}>{item.name}</p>
                  <p className="text-xs font-bold text-brand-teal mb-2">{item.hpRestore > 0 ? `+${item.hpRestore} HP` : 'PROTECTION'}</p>
                  <p className="text-[10px] font-bold" style={{ color: colors.textMuted }}>{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Exchange Section */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-2">
          <ArrowRightLeft className="w-4 h-4" style={{ color: colors.textMuted }} />
          <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>Resource Conversion</h2>
        </div>

        {/* Silver → Gold */}
        <div className="neo-border-lg p-6 rounded-3xl mb-4 neo-shadow" style={{ backgroundColor: isDark ? '#1E293B' : '#2D3436', borderColor: isDark ? '#334155' : '#2D3436' }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-black italic uppercase text-brand-yellow">Liquid Asset</h3>
              <p className="text-xs font-black uppercase mt-1" style={{ color: isDark ? 'rgb(148, 163, 184)' : 'rgb(107, 114, 128)' }}>City Silver → Habit Gold</p>
            </div>
            <div className="neo-border rounded-2xl px-3 py-2" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)', borderColor: '#FBBF24' }}>
              <p className="text-[10px] font-black" style={{ color: isDark ? 'rgb(148, 163, 184)' : 'rgb(107, 114, 128)' }}>Market Rate</p>
              <p className="text-xs font-black text-brand-yellow">{silverPerGoldRate}S : 1G</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-black uppercase block mb-2" style={{ color: isDark ? 'rgb(148, 163, 184)' : 'rgb(107, 114, 128)' }}>Conversion Amount</label>
            <input
              type="range"
              min="10"
              max={Math.max(stats.silver, 2000)}
              step="10"
              value={silverInput}
              onChange={(e) => setSilverInput(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            />
            <div className="text-center mt-2">
              <span className="text-2xl font-black font-mono" style={{ color: isDark ? '#F1F5F9' : '#2D3436' }}>{silverInput}</span>
              <span className="text-xs font-black ml-1" style={{ color: isDark ? 'rgb(148, 163, 184)' : 'rgb(107, 114, 128)' }}>S</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl mb-4 flex justify-between items-center" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)' }}>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-brand-yellow" />
              <div>
                <p className="text-xs font-black" style={{ color: isDark ? 'rgb(148, 163, 184)' : 'rgb(107, 114, 128)' }}>Est. Gold Received</p>
                <p className="text-lg font-black text-brand-yellow font-mono">{silverToGoldResult} G</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black" style={{ color: isDark ? 'rgb(148, 163, 184)' : 'rgb(107, 114, 128)' }}>Net Fee (5%)</p>
              <p className="text-sm font-black" style={{ color: isDark ? '#F1F5F9' : '#2D3436' }}>-{Math.ceil((silverInput / silverPerGoldRate) * networkFee)} G</p>
            </div>
          </div>

          <button
            onClick={handleSilverToGold}
            disabled={stats.silver < silverInput || silverToGoldResult <= 0}
            className="w-full neo-border-lg p-4 rounded-2xl font-black italic uppercase text-brand-dark neo-shadow hover:neo-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: '#FBBF24', borderColor: '#2D3436' }}
          >
            Confirm Conversion
          </button>
        </div>

        {/* Gold → Silver */}
        <div className="neo-border p-6 rounded-3xl neo-shadow" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-black italic uppercase text-brand-teal">Treasury Exchange</h3>
              <p className="text-xs font-black uppercase mt-1" style={{ color: colors.textMuted }}>Habit Gold → City Silver</p>
            </div>
            <div className="neo-border rounded-2xl px-3 py-2" style={{ backgroundColor: isDark ? 'rgba(20, 184, 166, 0.1)' : 'rgb(241, 245, 249)', borderColor: '#14B8A6' }}>
              <p className="text-[10px] font-black" style={{ color: colors.textMuted }}>Market Rate</p>
              <p className="text-xs font-black text-brand-teal">1G : {goldToSilverRate}S</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-black uppercase block mb-2" style={{ color: colors.textMuted }}>Collateral Amount</label>
            <input
              type="range"
              min="5"
              max={Math.max(stats.gold, 500)}
              step="5"
              value={goldInput}
              onChange={(e) => setGoldInput(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-brand-teal"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            />
            <div className="text-center mt-2">
              <span className="text-2xl font-black font-mono" style={{ color: colors.text }}>{goldInput}</span>
              <span className="text-xs font-black ml-1" style={{ color: colors.textMuted }}>G</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl mb-4 flex justify-between items-center neo-border" style={{ backgroundColor: isDark ? 'rgba(20, 184, 166, 0.05)' : 'rgb(248, 250, 252)', borderColor: colors.border }}>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-brand-teal" />
              <div>
                <p className="text-xs font-black" style={{ color: colors.textMuted }}>Est. Silver Liquidity</p>
                <p className="text-lg font-black text-brand-teal font-mono">{goldToSilverResult} S</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black" style={{ color: colors.textMuted }}>Stability Fee (5%)</p>
              <p className="text-sm font-black" style={{ color: colors.text }}>-{Math.ceil(goldInput * goldToSilverRate * networkFee)} S</p>
            </div>
          </div>

          <button
            onClick={handleGoldToSilver}
            disabled={stats.gold < goldInput || goldToSilverResult <= 0}
            className="w-full neo-border-lg p-4 rounded-2xl font-black italic uppercase neo-shadow hover:neo-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: '#14B8A6', color: '#2D3436', borderColor: '#2D3436' }}
          >
            Liquidate to Silver
          </button>
        </div>
      </section>

      {/* Gacha Section */}
      <section className="neo-border-lg p-6 rounded-3xl neo-shadow" style={{ backgroundColor: '#A29BFE', borderColor: '#7C3AED' }}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-white fill-white" />
            <h2 className="text-2xl font-black italic uppercase text-white">Shrine of Fate</h2>
          </div>
          <button
            onClick={() => setShowGachaInfo(!showGachaInfo)}
            className="p-2 rounded-2xl hover:bg-white/30 transition-all"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Info className="w-5 h-5 text-white" />
          </button>
        </div>
        <p className="text-xs font-black uppercase text-white/70 mb-4">Sacrifice Gold for Civilization Blessing</p>

        {showGachaInfo && (
          <div className="p-4 rounded-2xl mb-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-xs font-black text-brand-yellow uppercase mb-3">Divine Drop Rates</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/75">Ultimate Jackpot (Gold)</span>
                <span className="font-black text-brand-yellow">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/75">Treasury Overflow (Silver)</span>
                <span className="font-black text-brand-teal">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/75">Ancient Wisdom (EXP)</span>
                <span className="font-black text-purple-300">30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/75">Life Blessing (HP)</span>
                <span className="font-black text-brand-red">40%</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleGacha}
          disabled={stats.gold < 100 || isOpeningGacha}
          className="w-full neo-border-lg p-5 rounded-2xl font-black italic uppercase neo-shadow hover:neo-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4"
          style={{ backgroundColor: '#FFFFFF', color: '#2D3436', borderColor: '#2D3436' }}
        >
          {isOpeningGacha ? 'Opening...' : 'Invoke the Shrine (100 G)'}
        </button>

        <div className="flex items-center justify-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: '#A29BFE' }}>
                <span className="text-xs">👤</span>
              </div>
            ))}
          </div>
          <span className="text-[10px] font-black text-white/45 uppercase">128 Players recently won</span>
        </div>
      </section>

      {/* Popup */}
      {popupVisible && popupResult && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce neo-border-lg p-6 rounded-3xl neo-shadow max-w-xs" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <div className={`text-center`}>
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mx-auto mb-3`} style={{ borderColor: popupResult.color === 'brand-red' ? '#FF6B6B' : popupResult.color === 'brand-teal' ? '#4ECDC4' : popupResult.color === 'brand-yellow' ? '#FFE66D' : '#A29BFE', backgroundColor: popupResult.color === 'brand-red' ? 'rgba(255, 107, 107, 0.1)' : popupResult.color === 'brand-teal' ? 'rgba(78, 205, 196, 0.1)' : popupResult.color === 'brand-yellow' ? 'rgba(255, 230, 109, 0.1)' : 'rgba(162, 155, 254, 0.1)' }}>
                {popupResult.icon === 'check' && <CheckCircle className="w-8 h-8 text-brand-red" />}
                {popupResult.icon === 'shield' && <ShieldCheck className="w-8 h-8 text-brand-teal" />}
                {popupResult.icon === 'zap' && <Zap className="w-8 h-8 text-brand-yellow" />}
                {popupResult.icon === 'sparkles' && <Sparkles className="w-8 h-8 text-brand-purple fill-brand-purple" />}
              </div>
              <h3 className="text-lg font-black italic uppercase mb-1" style={{ color: colors.text }}>{popupResult.title}</h3>
              <p className="text-xs font-bold mb-3" style={{ color: colors.textMuted }}>{popupResult.subtitle}</p>
              <div className="space-y-2 text-left">
                {popupResult.details.map((detail: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs font-bold">
                    <span style={{ color: colors.textMuted }}>{detail.label}</span>
                    <span className="font-mono" style={{ color: colors.text }}>{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
