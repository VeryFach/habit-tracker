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
    <div className="flex flex-col gap-6 p-4 pb-32">
      <button
        onClick={onBack}
        className="flex w-fit items-center gap-2 text-[10px] font-black uppercase italic text-brand-dark transition hover:opacity-70 text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to City
      </button>

      <section className="relative overflow-hidden rounded-[2.5rem] border-2 border-brand-border bg-brand-surface p-6 neo-shadow">
        <GitBranch className="absolute right-5 top-5 h-32 w-32 opacity-10" />
        <h2 className="relative text-3xl font-black italic uppercase tracking-tight">Evolution Tree</h2>
        <p className="relative mb-6 mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-yellow-400">
          Shape the future of your civilization
        </p>
        <div className="relative flex items-center gap-3 rounded-3xl border border-brand-border bg-brand-dark/10 p-4">
          <Info className="h-5 w-5 shrink-0 text-teal-400" />
          <p className="text-[10px] font-bold uppercase leading-snug text-brand-dark">
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
                  className={`absolute left-8 top-16 h-12 w-1 ${isPast ? 'bg-teal-500' : 'bg-brand-surface-alt'}`}
                />
              )}
              <button
                onClick={() => {
                  setSelectedEra(era.id);
                  setSelectedBranch(null);
                }}
                className={`relative z-10 flex w-full items-center gap-4 rounded-[2rem] border-2 p-5 text-left neo-shadow-sm transition hover:scale-[1.01] ${
                  isUnlocked
                    ? `bg-brand-surface ${isCurrent ? 'border-teal-500' : 'border-brand-border'}`
                    : 'border-brand-border bg-brand-surface/70'
                }`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand-border ${isCurrent ? 'bg-teal-500' : 'bg-brand-surface-alt'}`}>
                  {isUnlocked ? (
                    isCurrent ? <Zap className="h-5 w-5 text-white" /> : <span className="text-lg font-black text-brand-dark">{index + 1}</span>
                  ) : (
                    <Lock className="h-5 w-5 text-brand-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`font-black uppercase italic ${isUnlocked ? 'text-brand-dark' : 'text-brand-muted'}`}>{era.name}</h3>
                    {isCurrent && <span className="rounded-full bg-teal-500 px-2 py-0.5 text-[8px] font-black uppercase text-white">Active</span>}
                  </div>
                  <p className="mt-0.5 text-[10px] font-bold uppercase text-brand-muted">
                    {isUnlocked ? 'Unlocked' : `Requires Level ${era.minLevel}`}
                  </p>
                </div>
                <ChevronRight className={`h-5 w-5 ${isUnlocked ? 'text-brand-dark' : 'text-brand-muted'}`} />
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
              className="max-h-[90vh] w-full max-w-lg sm:max-w-2xl lg:max-w-3xl mx-auto overflow-y-auto rounded-t-[3rem] border-2 border-brand-border bg-brand-surface p-6 neo-shadow-lg sm:rounded-[3rem]"
              onClick={event => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tight text-brand-dark">{selectedEraData.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-muted">Cultural Branches</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedEra(null);
                    setSelectedBranch(null);
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-border bg-brand-surface-alt"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <p className="mb-6 text-sm font-bold italic text-brand-muted">{selectedEraData.description}</p>

              <EraBuildingPreview era={selectedEra} statsLevel={stats.level} />

              <div className="mb-6">
                <h4 className="mb-3 text-[10px] font-black uppercase tracking-widest text-brand-muted/60 text-brand-muted">Available Branches</h4>
                <div className="grid grid-cols-2 gap-3">
                  {EVOLUTION_BRANCHES.filter(branch => branch.era === selectedEra).map(branch => {
                    const isBranchUnlocked = city.unlockedEvolutions?.includes(branch.id);
                    const canStartBranch = branch.requirements.every(isRequirementMet);
                    const requiredLevel = branch.requirements.find(req => req.type === 'level')?.target;

                    return (
                      <button
                        key={branch.id}
                        onClick={() => setSelectedBranch(branch)}
                        className={`relative flex flex-col items-center rounded-[2rem] border-2 p-5 text-center transition hover:-translate-y-1 ${
                          selectedBranch?.id === branch.id
                            ? 'border-teal-500 bg-teal-500'
                            : isBranchUnlocked
                              ? 'border-teal-500 bg-teal-500/14'
                              : 'border-brand-border bg-brand-surface-alt'
                        }`}
                      >
                        {isBranchUnlocked && (
                          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-brand-border bg-brand-surface">
                          <IconRenderer name={branch.iconName} className="h-7 w-7" />
                        </div>
                        <span className={`text-[10px] font-black uppercase italic ${selectedBranch?.id === branch.id ? 'text-white' : 'text-brand-dark'}`}>{branch.name}</span>
                        <span className={`mt-2 flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-black uppercase ${
                          canStartBranch ? 'border-teal-500 bg-teal-500/14 text-teal-500' : 'border-brand-border bg-brand-surface text-brand-muted'
                        }`}>
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
        <Hammer className="h-4 w-4 text-brand-teal" />
        <h4 className="text-[10px] font-black uppercase text-brand-teal">Construction Unlocks</h4>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {eraBuildings.map(building => {
          const eraConfig = ERAS_CONFIG.find(item => item.id === building.era);
          const isAvailable = statsLevel >= (eraConfig?.minLevel || 0);
          return (
            <div
              key={building.id}
              className={`w-36 shrink-0 rounded-[2rem] border-2 p-4 text-center ${
                isAvailable ? 'border-teal-500 bg-brand-surface' : 'border-brand-border bg-brand-surface'
              }`}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl border border-brand-border bg-brand-surface-alt">
                <IconRenderer name={building.iconName} className="h-7 w-7" />
              </div>
              <p className="truncate text-[11px] font-black uppercase text-brand-dark">{building.name}</p>
              <p className="mb-2 text-[8px] font-bold uppercase text-brand-muted">{building.category}</p>
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
      className="rounded-[2rem] border-2 border-brand-border bg-brand-surface p-5 neo-shadow"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500">
            <Target className="h-5 w-5 text-brand-dark" />
          </div>
          <div>
            <h5 className="font-black uppercase italic text-brand-teal">{branch.name}</h5>
            <p className="text-[8px] font-bold uppercase text-brand-dark">Detail & Requirements</p>
          </div>
        </div>
        {isUnlocked && <span className="rounded-full bg-teal-500 px-3 py-1 text-[8px] font-black uppercase text-brand-dark">Unlocked</span>}
      </div>

      <p className="mb-5 text-xs font-bold italic text-brand-muted">{branch.description}</p>

      <div className="mb-5">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase text-yellow-400">
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
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase text-teal-400">
          <Zap className="h-4 w-4" />
          Cultural Benefits
        </div>
        <div className="space-y-2">
          {branch.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 rounded-xl bg-brand-dark/5 p-2 text-[9px] font-bold text-brand-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              {benefit}
            </div>
          ))}
        </div>
      </div>

      {!isUnlocked && (
        <button
          onClick={onUnlock}
          disabled={isUnlocking || !canUnlock}
          className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-brand-teal bg-brand-teal px-4 py-4 text-sm font-black uppercase italic text-brand-dark transition disabled:opacity-50"
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
      <div className={`flex items-center gap-3 rounded-3xl border p-3 ${
        isMet ? 'border-teal-500 bg-teal-500/16' : 'border-brand-border bg-teal-500/16'
      }`}>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-brand-border bg-teal-500/16">
          <IconRenderer name={buildingType?.iconName || 'Hammer'} className="h-7 w-7 text-brand-dark" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-black uppercase text-brand-dark">{buildingType?.name || req.description}</p>
            {isMet ? <Check className="h-4 w-4 text-teal-400" /> : <Lock className="h-3.5 w-3.5 text-brand-dark/30" />}
          </div>
          <p className="mb-2 text-[8px] font-bold uppercase text-brand-muted">{buildingType?.category || 'building'} requirement</p>
          <div className="mb-1 h-1 overflow-hidden rounded-full bg-black/20">
            <div className={`h-full rounded-full ${isMet ? 'bg-teal-400' : 'bg-yellow-400'}`} style={{ width: `${Math.min(100, (ownedCount / requiredCount) * 100)}%` }} />
          </div>
          <p className={`text-[9px] font-extrabold uppercase ${isMet ? 'text-teal-400' : 'text-brand-muted'}`}>
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
    <div className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${
      isMet ? 'border-teal-500 bg-teal-500/16' : 'border-brand-border bg-teal-500/16'
    }`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-brand-dark/5">
          <Icon className={`h-4 w-4 ${isMet ? 'text-teal-400' : 'text-brand-muted'}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-brand-dark">{req.description}</p>
          <p className={`text-[9px] font-extrabold uppercase ${isMet ? 'text-teal-400' : 'text-brand-muted'}`}>
            Current {Math.min(currentValue, targetValue)} / {targetValue}
          </p>
        </div>
      </div>
      {isMet ? <Check className="h-4 w-4 text-teal-400" /> : <Lock className="h-3.5 w-3.5 text-brand-dark/30" />}
    </div>
  );
}

function MiniStat({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-brand-surface-alt px-2 py-0.5 text-[8px] font-extrabold text-brand-dark">
      {label}
    </span>
  );
}
