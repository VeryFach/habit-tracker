import React, { useState } from 'react';
import { UserStats, CityState, Era, EvolutionBranch, EvolutionRequirement } from '../types';
import { ERAS_CONFIG, EVOLUTION_BRANCHES, BUILDINGS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import {
  ArrowLeft,
  Check,
  CheckSquare,
  ChevronRight,
  Coins,
  GitBranch,
  Hammer,
  Info,
  Lock,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

interface EvolutionTabProps {
  stats: UserStats;
  city: CityState;
  onBack: () => void;
  onUnlock: (branchId: string) => Promise<boolean>;
}

const palette = {
  card: '#FFFFFF',
  cardAlt: '#F1F5F9',
  border: '#E2E8F0',
  text: '#1E293B',
  textMuted: '#64748B',
  textFaint: 'rgba(30,41,59,0.4)',
  accent: '#14B8A6',
  accentGold: '#FBBF24',
  headerBg: '#0F172A',
};

const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (Icons as any)[name] || Icons.HelpCircle;
  return <Icon className={className} />;
};

export function EvolutionTab({ stats, city, onBack, onUnlock }: EvolutionTabProps) {
  const [selectedEra, setSelectedEra] = useState<Era | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<EvolutionBranch | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const currentEraIndex = ERAS_CONFIG.findIndex(era => era.id === city.currentEra);
  const selectedEraData = ERAS_CONFIG.find(era => era.id === selectedEra);

  const getBuildingCount = (target: string) => city.buildings.filter(building => building.buildingTypeId === target).length;

  const isRequirementMet = (req: EvolutionRequirement) => {
    if (req.type === 'level') return stats.level >= (req.target as number);
    if (req.type === 'buildings') return getBuildingCount(req.target as string) >= (req.count ?? 1);
    if (req.type === 'silver') return stats.silver >= (req.target as number);
    if (req.type === 'gold') return stats.gold >= (req.target as number);
    return true;
  };

  const handleUnlock = async () => {
    if (!selectedBranch) return;
    setIsUnlocking(true);
    const success = await onUnlock(selectedBranch.id);
    setIsUnlocking(false);
    if (success) {
      setSelectedBranch(null);
      setSelectedEra(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-32" style={{ backgroundColor: palette.bg }}>
      <button
        onClick={onBack}
        className="flex w-fit items-center gap-2 text-[10px] font-black uppercase italic transition hover:opacity-70"
        style={{ color: palette.text }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to City
      </button>

      <section className="relative overflow-hidden rounded-[2.5rem] border-2 p-6 text-white shadow-[4px_4px_12px_rgba(15,23,42,0.16)]" style={{ backgroundColor: palette.headerBg, borderColor: palette.headerBg }}>
        <GitBranch className="absolute right-5 top-5 h-32 w-32 opacity-10" />
        <h2 className="relative text-3xl font-black italic uppercase tracking-tight">Evolution Tree</h2>
        <p className="relative mb-6 mt-2 text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: palette.accentGold }}>
          Shape the future of your civilization
        </p>
        <div className="relative flex items-center gap-3 rounded-3xl border p-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)' }}>
          <Info className="h-5 w-5 shrink-0" style={{ color: palette.accent }} />
          <p className="text-[10px] font-bold uppercase leading-snug text-white">
            Select an era to view available technology paths and cultural branches.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        {ERAS_CONFIG.map((era, index) => {
          const isUnlocked = stats.level >= era.minLevel;
          const isCurrent = city.currentEra === era.id;
          const isPast = index < currentEraIndex;

          return (
            <div key={era.id} className="relative pl-4">
              {index !== ERAS_CONFIG.length - 1 && (
                <div
                  className="absolute left-8 top-16 h-12 w-1"
                  style={{ backgroundColor: isPast ? palette.accent : palette.border }}
                />
              )}
              <button
                onClick={() => {
                  setSelectedEra(era.id);
                  setSelectedBranch(null);
                }}
                className="relative z-10 flex w-full items-center gap-4 rounded-[2rem] border-2 p-5 text-left shadow-[2px_2px_8px_rgba(15,23,42,0.04)] transition hover:scale-[1.01]"
                style={{
                  backgroundColor: isUnlocked ? palette.card : palette.cardAlt,
                  borderColor: isCurrent ? palette.accent : palette.border,
                  opacity: isUnlocked ? 1 : 0.72,
                }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border" style={{ backgroundColor: isCurrent ? palette.accent : palette.cardAlt, borderColor: palette.border }}>
                  {isUnlocked ? (
                    isCurrent ? <Zap className="h-5 w-5 text-white" /> : <span className="text-lg font-black" style={{ color: palette.text }}>{index + 1}</span>
                  ) : (
                    <Lock className="h-5 w-5" style={{ color: palette.textMuted }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black uppercase italic" style={{ color: isUnlocked ? palette.text : palette.textMuted }}>{era.name}</h3>
                    {isCurrent && <span className="rounded-full px-2 py-0.5 text-[8px] font-black uppercase" style={{ backgroundColor: palette.accent, color: palette.text }}>Active</span>}
                  </div>
                  <p className="mt-0.5 text-[10px] font-bold uppercase" style={{ color: palette.textMuted }}>
                    {isUnlocked ? 'Unlocked' : `Requires Level ${era.minLevel}`}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5" style={{ color: isUnlocked ? palette.text : palette.textMuted }} />
              </button>
            </div>
          );
        })}
      </section>

      <AnimatePresence>
        {selectedEra && selectedEraData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => {
              setSelectedEra(null);
              setSelectedBranch(null);
            }}
          >
            <motion.div
              initial={{ y: 160 }}
              animate={{ y: 0 }}
              exit={{ y: 160 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[3rem] border-2 p-6 shadow-[0_-8px_24px_rgba(15,23,42,0.16)] sm:rounded-[3rem]"
              style={{ backgroundColor: palette.card, borderColor: palette.border }}
              onClick={event => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tight" style={{ color: palette.text }}>{selectedEraData.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: palette.textMuted }}>Cultural Branches</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedEra(null);
                    setSelectedBranch(null);
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-full border"
                  style={{ backgroundColor: palette.cardAlt, borderColor: palette.border }}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <p className="mb-6 text-sm font-bold italic" style={{ color: palette.textMuted }}>{selectedEraData.description}</p>

              <EraBuildingPreview era={selectedEra} statsLevel={stats.level} />

              <div className="mb-6">
                <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest" style={{ color: palette.textFaint }}>Available Branches</h4>
                <div className="grid grid-cols-2 gap-3">
                  {EVOLUTION_BRANCHES.filter(branch => branch.era === selectedEra).map(branch => {
                    const isBranchUnlocked = city.unlockedEvolutions?.includes(branch.id);
                    const canStartBranch = branch.requirements.every(isRequirementMet);
                    const requiredLevel = branch.requirements.find(req => req.type === 'level')?.target;

                    return (
                      <button
                        key={branch.id}
                        onClick={() => setSelectedBranch(branch)}
                        className="relative flex flex-col items-center rounded-[2rem] border-2 p-5 text-center transition hover:-translate-y-1"
                        style={{
                          backgroundColor: selectedBranch?.id === branch.id ? palette.accent : isBranchUnlocked ? 'rgba(20,184,166,0.14)' : palette.cardAlt,
                          borderColor: selectedBranch?.id === branch.id ? palette.accent : isBranchUnlocked ? palette.accent : palette.border,
                        }}
                      >
                        {isBranchUnlocked && (
                          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: palette.accent }}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border" style={{ backgroundColor: palette.card, borderColor: palette.border }}>
                          <IconRenderer name={branch.iconName} className="h-7 w-7" />
                        </div>
                        <span className="text-[10px] font-black uppercase italic" style={{ color: selectedBranch?.id === branch.id ? '#FFFFFF' : palette.text }}>{branch.name}</span>
                        <span className="mt-2 flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-black uppercase" style={{ backgroundColor: canStartBranch ? 'rgba(20,184,166,0.14)' : palette.card, borderColor: canStartBranch ? palette.accent : palette.border, color: canStartBranch ? palette.accent : palette.textMuted }}>
                          {canStartBranch ? <Check className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                          Level {requiredLevel as number || selectedEraData.minLevel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedBranch && (
                <BranchDetail
                  branch={selectedBranch}
                  city={city}
                  stats={stats}
                  isUnlocking={isUnlocking}
                  isRequirementMet={isRequirementMet}
                  getBuildingCount={getBuildingCount}
                  onUnlock={handleUnlock}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EraBuildingPreview({ era, statsLevel }: { era: Era; statsLevel: number }) {
  const eraBuildings = BUILDINGS.filter(building => building.era === era);
  if (eraBuildings.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Hammer className="h-4 w-4" style={{ color: palette.accent }} />
        <h4 className="text-[10px] font-black uppercase" style={{ color: palette.accent }}>Construction Unlocks</h4>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {eraBuildings.map(building => {
          const eraConfig = ERAS_CONFIG.find(item => item.id === building.era);
          const isAvailable = statsLevel >= (eraConfig?.minLevel || 0);
          return (
            <div
              key={building.id}
              className="w-36 shrink-0 rounded-[2rem] border-2 p-4 text-center"
              style={{ backgroundColor: palette.card, borderColor: isAvailable ? palette.accent : palette.border, opacity: isAvailable ? 1 : 0.65 }}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl border" style={{ backgroundColor: palette.cardAlt, borderColor: palette.border }}>
                <IconRenderer name={building.iconName} className="h-7 w-7" />
              </div>
              <p className="truncate text-[11px] font-black uppercase" style={{ color: palette.text }}>{building.name}</p>
              <p className="mb-2 text-[8px] font-bold uppercase" style={{ color: palette.textMuted }}>{building.category}</p>
              <div className="flex flex-wrap justify-center gap-1">
                {building.housing > 0 && <MiniStat label={`H ${building.housing}`} />}
                {building.foodProduction > 0 && <MiniStat label={`F ${building.foodProduction}`} />}
                {building.silverIncome > 0 && <MiniStat label={`S ${building.silverIncome}`} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BranchDetail({
  branch,
  city,
  stats,
  isUnlocking,
  isRequirementMet,
  getBuildingCount,
  onUnlock,
}: {
  branch: EvolutionBranch;
  city: CityState;
  stats: UserStats;
  isUnlocking: boolean;
  isRequirementMet: (req: EvolutionRequirement) => boolean;
  getBuildingCount: (target: string) => number;
  onUnlock: () => void;
}) {
  const isUnlocked = city.unlockedEvolutions?.includes(branch.id);
  const canUnlock = branch.requirements.every(isRequirementMet);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-[2rem] border-2 p-5 text-white"
      style={{ backgroundColor: '#1E293B', borderColor: '#334155' }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: palette.accent }}>
            <Target className="h-5 w-5" style={{ color: palette.text }} />
          </div>
          <div>
            <h5 className="font-black uppercase italic" style={{ color: palette.accent }}>{branch.name}</h5>
            <p className="text-[8px] font-bold uppercase text-white/40">Detail & Requirements</p>
          </div>
        </div>
        {isUnlocked && <span className="rounded-full px-3 py-1 text-[8px] font-black uppercase" style={{ backgroundColor: palette.accent, color: palette.text }}>Unlocked</span>}
      </div>

      <p className="mb-5 text-xs font-bold italic text-white/70">{branch.description}</p>

      <div className="mb-5">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase" style={{ color: palette.accentGold }}>
          <CheckSquare className="h-4 w-4" />
          Unlock Requirements
        </div>
        <div className="space-y-2">
          {branch.requirements.map((req, index) => (
            <React.Fragment key={index}>
              <RequirementCard
                req={req}
                stats={stats}
                isMet={isRequirementMet(req)}
                ownedCount={req.type === 'buildings' ? getBuildingCount(req.target as string) : 0}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase" style={{ color: palette.accent }}>
          <Zap className="h-4 w-4" />
          Cultural Benefits
        </div>
        <div className="space-y-2">
          {branch.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 rounded-xl bg-white/5 p-2 text-[9px] font-bold text-white/80">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: palette.accent }} />
              {benefit}
            </div>
          ))}
        </div>
      </div>

      {!isUnlocked && (
        <button
          onClick={onUnlock}
          disabled={isUnlocking || !canUnlock}
          className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-white px-4 py-4 text-sm font-black uppercase italic transition disabled:opacity-50"
          style={{ backgroundColor: palette.accent, color: palette.text }}
        >
          {isUnlocking ? <Icons.Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Start Evolution
        </button>
      )}
    </motion.div>
  );
}

function RequirementCard({ req, stats, isMet, ownedCount }: { req: EvolutionRequirement; stats: UserStats; isMet: boolean; ownedCount: number }) {
  if (req.type === 'buildings') {
    const buildingType = BUILDINGS.find(building => building.id === req.target);
    const requiredCount = req.count ?? 1;
    return (
      <div className="flex items-center gap-3 rounded-3xl border p-3" style={{ backgroundColor: isMet ? 'rgba(20,184,166,0.16)' : 'rgba(255,255,255,0.05)', borderColor: isMet ? palette.accent : 'rgba(255,255,255,0.1)' }}>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
          <IconRenderer name={buildingType?.iconName || 'Hammer'} className="h-7 w-7 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-black uppercase text-white">{buildingType?.name || req.description}</p>
            {isMet ? <Check className="h-4 w-4" style={{ color: palette.accent }} /> : <Lock className="h-3.5 w-3.5 text-white/30" />}
          </div>
          <p className="mb-2 text-[8px] font-bold uppercase text-white/40">{buildingType?.category || 'building'} requirement</p>
          <div className="mb-1 h-1 overflow-hidden rounded-full bg-black/20">
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (ownedCount / requiredCount) * 100)}%`, backgroundColor: isMet ? palette.accent : palette.accentGold }} />
          </div>
          <p className="text-[9px] font-extrabold uppercase" style={{ color: isMet ? palette.accent : 'rgba(255,255,255,0.45)' }}>
            Owned {Math.min(ownedCount, requiredCount)} / {requiredCount}
          </p>
        </div>
      </div>
    );
  }

  const currentValue = req.type === 'level' ? stats.level : req.type === 'silver' ? stats.silver : req.type === 'gold' ? stats.gold : 0;
  const targetValue = typeof req.target === 'number' ? req.target : 1;
  const Icon = req.type === 'level' ? Trophy : req.type === 'silver' || req.type === 'gold' ? Coins : Target;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border p-3" style={{ backgroundColor: isMet ? 'rgba(20,184,166,0.16)' : 'rgba(255,255,255,0.05)', borderColor: isMet ? palette.accent : 'rgba(255,255,255,0.1)' }}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white/5">
          <Icon className="h-4 w-4" style={{ color: isMet ? palette.accent : 'rgba(255,255,255,0.4)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-white/80">{req.description}</p>
          <p className="text-[9px] font-extrabold uppercase" style={{ color: isMet ? palette.accent : 'rgba(255,255,255,0.45)' }}>
            Current {Math.min(currentValue, targetValue)} / {targetValue}
          </p>
        </div>
      </div>
      {isMet ? <Check className="h-4 w-4" style={{ color: palette.accent }} /> : <Lock className="h-3.5 w-3.5 text-white/30" />}
    </div>
  );
}

function MiniStat({ label }: { label: string }) {
  return (
    <span className="rounded-full px-2 py-0.5 text-[8px] font-extrabold" style={{ backgroundColor: palette.cardAlt, color: palette.text }}>
      {label}
    </span>
  );
}
