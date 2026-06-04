import React, { useMemo, useState } from 'react';
import { CityState, UserStats, BuildingType, PlacedBuilding } from '../types';
import { BUILDINGS, GRID_SIZE, ERAS_CONFIG } from '../constants';
import {
  calculateCitySummary,
  getBuildingOccupancy,
  getHappinessStatus,
  getHealthStatus,
  getOccupancyStatus,
  getProductivityStatus,
  getScaledConstructionCost,
  isValidGridCoord,
  sanitizeBuildings,
} from '../lib/cityUtils';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import {
  AlertTriangle,
  BadgeAlert,
  Coins,
  Dna,
  Gem,
  Hammer,
  Heart,
  Home,
  Landmark,
  Navigation,
  Search,
  SmilePlus,
  Trash2,
  TrendingUp,
  UsersRound,
  X,
} from 'lucide-react';

interface KotaTabProps {
  city: CityState;
  stats: UserStats;
  onDeploy: (buildingId: string, silverCost: number, goldCost: number, x: number, y: number) => void;
  onUpgrade: (buildingId: string, cost: number) => void;
  onRemove: (buildingId: string) => void;
  onSwitchTab: (tab: string) => void;
}

const palette = {
  //bg: '#F8FAFC',
  card: '#FFFFFF',
  cardAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderActive: '#0D9488',
  text: '#1E293B',
  textMuted: '#64748B',
  accentTeal: '#14B8A6',
  accentGold: '#FBBF24',
  accentRed: '#EF4444',
};

const statusTextColor = (className: string) => {
  if (className.includes('red')) return '#EF4444';
  if (className.includes('yellow')) return '#FBBF24';
  if (className.includes('teal')) return '#14B8A6';
  return '#64748B';
};

const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (Icons as any)[name] || Icons.HelpCircle;
  return <Icon className={className} />;
};

export function KotaTab({ city, stats, onDeploy, onUpgrade, onRemove, onSwitchTab }: KotaTabProps) {
  const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(null);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const validBuildings = useMemo(() => sanitizeBuildings(city.buildings || []), [city.buildings]);
  const cityForSummary = useMemo(() => ({ ...city, buildings: validBuildings }), [city, validBuildings]);

  const buildingMap = useMemo(() => {
    const map: Record<string, PlacedBuilding> = {};
    validBuildings.forEach(building => {
      map[`${building.gridX}_${building.gridY}`] = building;
    });
    return map;
  }, [validBuildings]);

  const summary = useMemo(() => calculateCitySummary(cityForSummary), [cityForSummary]);
  const healthStatus = getHealthStatus(city.health);
  const happinessStatus = getHappinessStatus(city.happiness ?? 100);
  const productivityStatus = getProductivityStatus(summary.taxMultiplier);
  const healthColor = statusTextColor(healthStatus.color);
  const happinessColor = statusTextColor(happinessStatus.color);
  const productivityColor = statusTextColor(productivityStatus.color);

  const filteredBuildings = useMemo(() => {
    const totalBuildings = validBuildings.length;
    return BUILDINGS.filter(building => {
      const era = ERAS_CONFIG.find(item => item.id === building.era);
      const isUnlocked = stats.level >= (era?.minLevel || 0);
      const matchesFilter = filter === 'all' || building.category === filter;
      const matchesSearch = building.name.toLowerCase().includes(searchQuery.toLowerCase());
      return isUnlocked && matchesFilter && matchesSearch;
    }).map(building => ({
      ...building,
      costSilver: getScaledConstructionCost(building.costSilver, totalBuildings, city.unlockedEvolutions),
      costGold: getScaledConstructionCost(building.costGold, totalBuildings, city.unlockedEvolutions),
    }));
  }, [city.unlockedEvolutions, filter, searchQuery, stats.level, validBuildings.length]);

  const handleTileClick = (x: number, y: number) => {
    if (!isValidGridCoord(x, y)) return;

    const key = `${x}_${y}`;
    const building = buildingMap[key];

    if (selectedBuildingType) {
      const canAfford = stats.silver >= selectedBuildingType.costSilver && stats.gold >= selectedBuildingType.costGold;
      if (!building && canAfford) {
        onDeploy(selectedBuildingType.id, selectedBuildingType.costSilver, selectedBuildingType.costGold, x, y);
        setSelectedBuildingType(null);
      }
      return;
    }

    setSelectedTile(building ? { x, y } : null);
  };

  const selectedBuilding = selectedTile ? buildingMap[`${selectedTile.x}_${selectedTile.y}`] : null;

  return (
    <div className="flex flex-col gap-6 p-4 pb-32" style={{ backgroundColor: palette.bg }}>
      <section className="rounded-[2.5rem] border-2 p-5 sm:p-6 shadow-[4px_4px_12px_rgba(15,23,42,0.06)]" style={{ backgroundColor: palette.card, borderColor: palette.border }}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tight leading-none" style={{ color: palette.accentTeal }}>
              {city.currentEra}
            </h2>
            <button
              onClick={() => onSwitchTab('evolution')}
              className="mt-3 flex items-center gap-2 rounded-2xl px-3 py-2 text-[10px] font-black uppercase transition hover:opacity-80"
              style={{ backgroundColor: palette.cardAlt, color: palette.accentTeal }}
            >
              <Dna className="h-3.5 w-3.5" />
              Era Progression
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-xl border px-2 py-1 text-[10px] font-extrabold uppercase" style={{ borderColor: palette.border, color: healthColor }}>
                <Heart className="h-3.5 w-3.5" />
                Health: {city.health}%
              </span>
              <span className="flex items-center gap-1.5 rounded-xl border px-2 py-1 text-[10px] font-extrabold uppercase" style={{ borderColor: palette.border, color: palette.accentTeal }}>
                <UsersRound className="h-3.5 w-3.5" />
                Pop: {city.population}
              </span>
              {(city.populationSick || 0) > 0 && (
                <span className="flex items-center gap-1.5 rounded-xl px-2 py-1 text-[10px] font-extrabold uppercase text-white" style={{ backgroundColor: palette.accentRed }}>
                  <BadgeAlert className="h-3.5 w-3.5" />
                  Sick: {city.populationSick}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ResourceCard
            icon={<Home className="h-4 w-4" />}
            label="Citizens / Housing"
            value={`${city.population} / ${summary.totalHousing}`}
            progress={Math.min(100, (city.population / (summary.totalHousing || 1)) * 100)}
            isWarning={summary.isHomeless}
            accent={palette.accentTeal}
          />
          <ResourceCard
            icon={<Icons.Ham className="h-4 w-4" />}
            label="Required / Food"
            value={`${summary.foodRequired} / ${summary.totalFoodProduction}`}
            progress={Math.min(100, (summary.foodRequired / (summary.totalFoodProduction || 1)) * 100)}
            isHunger={summary.isHungry}
            accent={palette.accentGold}
          />
          <ResourceCard
            icon={<Landmark className="h-4 w-4" />}
            label="Daily S / Prod"
            value={`+${summary.totalSilverIncome}`}
            subLabel={productivityStatus.label}
            progress={Math.min(100, summary.taxMultiplier * 100)}
            accent={productivityColor}
          />
          <ResourceCard
            icon={<SmilePlus className="h-4 w-4" />}
            label="Happiness"
            value={`${city.happiness ?? 100}%`}
            subLabel={happinessStatus.label}
            progress={city.happiness ?? 100}
            accent={happinessColor}
          />
        </div>

        <AnimatePresence>
          {(summary.isHungry || summary.isHomeless) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-center gap-3 overflow-hidden rounded-3xl p-4 text-white"
              style={{ backgroundColor: palette.accentRed }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white">
                <AlertTriangle className="h-6 w-6" style={{ color: palette.accentRed }} />
              </div>
              <div>
                <p className="text-xs font-black uppercase italic">Crisis Detected!</p>
                <p className="text-[10px] font-bold opacity-90">
                  {summary.isHungry && 'Food shortage. '}
                  {summary.isHomeless && 'Housing crisis. '}
                  Build additional infrastructure immediately!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="rounded-[2.5rem] border-2 p-4 shadow-[4px_4px_12px_rgba(15,23,42,0.06)]" style={{ backgroundColor: palette.card, borderColor: palette.border }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl p-2" style={{ backgroundColor: palette.cardAlt }}>
              <Navigation className="h-4 w-4" style={{ color: palette.accentTeal }} />
            </div>
            <h3 className="text-lg font-black uppercase" style={{ color: palette.text }}>City Map</h3>
          </div>
          <AnimatePresence>
            {selectedBuildingType && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                className="flex items-center gap-2 rounded-2xl px-3 py-2 text-white"
                style={{ backgroundColor: palette.accentTeal }}
              >
                <IconRenderer name={selectedBuildingType.iconName} className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase">{selectedBuildingType.name}</span>
                <button onClick={() => setSelectedBuildingType(null)}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid aspect-square grid-cols-10 grid-rows-10 gap-1 rounded-[2rem] border-2 p-3" style={{ backgroundColor: palette.bg, borderColor: '#CBD5E1' }}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const building = buildingMap[`${x}_${y}`];
            const type = building ? BUILDINGS.find(item => item.id === building.buildingTypeId) : null;
            const isSelected = selectedTile?.x === x && selectedTile?.y === y;
            const canPlace = selectedBuildingType && !building;

            return (
              <button
                key={index}
                onClick={() => handleTileClick(x, y)}
                className="relative flex min-h-0 min-w-0 items-center justify-center rounded-xl border transition active:scale-95"
                style={{
                  backgroundColor: building ? palette.card : canPlace ? 'rgba(20,184,166,0.2)' : palette.bg,
                  borderColor: isSelected ? palette.accentGold : canPlace ? palette.accentTeal : '#CBD5E1',
                  borderStyle: canPlace ? 'dashed' : 'solid',
                  borderWidth: isSelected ? 2 : 1,
                  transform: isSelected ? 'scale(1.05)' : undefined,
                }}
              >
                {type && building && (
                  <>
                    <IconRenderer name={type.iconName} className="h-4 w-4 sm:h-5 sm:w-5" />
                    {building.level > 1 && (
                      <span className="absolute -right-1 -top-1 rounded-full px-1 text-[8px] font-black text-white" style={{ backgroundColor: palette.accentTeal }}>
                        L{building.level}
                      </span>
                    )}
                  </>
                )}
                {!type && building && <AlertTriangle className="h-4 w-4" style={{ color: palette.accentRed }} />}
                {canPlace && !building && <Hammer className="h-3 w-3 opacity-40" style={{ color: palette.textMuted }} />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Hammer className="h-5 w-5" style={{ color: palette.text }} />
            <h3 className="text-xl font-black uppercase italic" style={{ color: palette.text }}>Construction Hub</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-40 flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: palette.textMuted }} />
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Search buildings..."
                className="w-full rounded-2xl border py-2 pl-9 pr-3 text-xs font-bold outline-none"
                style={{ backgroundColor: palette.card, borderColor: palette.border, color: palette.text }}
              />
            </div>
            <div className="flex rounded-2xl p-1" style={{ backgroundColor: palette.cardAlt }}>
              {['all', 'residential', 'economic', 'food'].map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className="rounded-xl px-3 py-1.5 text-[10px] font-extrabold uppercase transition"
                  style={{
                    backgroundColor: filter === category ? palette.text : 'transparent',
                    color: filter === category ? '#FFFFFF' : palette.text,
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto px-2 pb-4 no-scrollbar">
          {filteredBuildings.map(building => {
            const isSelected = selectedBuildingType?.id === building.id;
            const canAfford = stats.silver >= building.costSilver && stats.gold >= building.costGold;
            return (
              <button
                key={building.id}
                onClick={() => setSelectedBuildingType(isSelected ? null : building)}
                className="flex w-40 shrink-0 flex-col items-center rounded-[2rem] border-2 p-4 text-center transition hover:-translate-y-1"
                style={{
                  backgroundColor: isSelected ? palette.accentTeal : palette.card,
                  borderColor: isSelected ? palette.borderActive : palette.border,
                }}
              >
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-3xl border" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : palette.cardAlt, borderColor: isSelected ? 'transparent' : '#CBD5E1' }}>
                  <IconRenderer name={building.iconName} className="h-8 w-8" />
                </div>
                <h4 className="mb-1 w-full truncate text-xs font-black uppercase" style={{ color: isSelected ? '#FFFFFF' : palette.text }}>
                  {building.name}
                </h4>
                <p className="mb-3 text-[8px] font-bold uppercase" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : palette.textMuted }}>
                  {building.category}
                </p>
                <div className="mb-3 flex flex-wrap justify-center gap-1">
                  {building.housing > 0 && <StatBadge label={`H ${building.housing}`} selected={isSelected} />}
                  {building.foodProduction > 0 && <StatBadge label={`F ${building.foodProduction}`} selected={isSelected} />}
                  {building.silverIncome > 0 && <StatBadge label={`S ${building.silverIncome}`} selected={isSelected} />}
                </div>
                <div className="mt-auto flex w-full items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-[10px] font-black" style={{ backgroundColor: canAfford ? (isSelected ? 'rgba(255,255,255,0.2)' : palette.cardAlt) : '#FEE2E2', borderColor: canAfford ? 'transparent' : palette.accentRed, color: canAfford ? (isSelected ? '#FFFFFF' : palette.text) : palette.accentRed }}>
                  <Gem className="h-3 w-3" />
                  <span>{building.costSilver}</span>
                  {building.costGold > 0 && <span>+ {building.costGold}G</span>}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {selectedTile && selectedBuilding && (
          <BuildingDetailPanel
            building={selectedBuilding}
            city={cityForSummary}
            stats={stats}
            totalBuildings={validBuildings.length}
            summary={summary}
            onClose={() => setSelectedTile(null)}
            onUpgrade={(id, cost) => {
              onUpgrade(id, cost);
              setSelectedTile(null);
            }}
            onRemove={id => {
              onRemove(id);
              setSelectedTile(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ResourceCard({
  icon,
  label,
  value,
  subLabel,
  progress,
  accent,
  isWarning = false,
  isHunger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subLabel?: string;
  progress: number;
  accent: string;
  isWarning?: boolean;
  isHunger?: boolean;
}) {
  const warningBg = isWarning ? palette.accentRed : isHunger ? palette.accentGold : palette.cardAlt;
  const warningText = isWarning ? '#FFFFFF' : palette.text;
  return (
    <div className="rounded-3xl border p-4" style={{ backgroundColor: warningBg, borderColor: palette.border }}>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.5)', color: accent }}>
          {icon}
        </div>
        <span className="text-[10px] font-extrabold uppercase" style={{ color: isWarning ? 'rgba(255,255,255,0.85)' : palette.textMuted }}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-black" style={{ color: warningText }}>{value}</p>
        {subLabel && <span className="text-[10px] font-black uppercase" style={{ color: accent }}>{subLabel}</span>}
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/10">
        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: isWarning ? '#FFFFFF' : accent }} />
      </div>
    </div>
  );
}

function StatBadge({ label, selected }: { label: string; selected: boolean }) {
  return (
    <span className="rounded-full px-2 py-0.5 text-[8px] font-extrabold" style={{ backgroundColor: selected ? 'rgba(255,255,255,0.2)' : palette.cardAlt, color: selected ? '#FFFFFF' : palette.text }}>
      {label}
    </span>
  );
}

function BuildingDetailPanel({
  building,
  city,
  stats,
  totalBuildings,
  summary,
  onClose,
  onUpgrade,
  onRemove,
}: {
  building: PlacedBuilding;
  city: CityState;
  stats: UserStats;
  totalBuildings: number;
  summary: ReturnType<typeof calculateCitySummary>;
  onClose: () => void;
  onUpgrade: (id: string, cost: number) => void;
  onRemove: (id: string) => void;
}) {
  const rawType = BUILDINGS.find(item => item.id === building.buildingTypeId);
  if (!rawType) return null;

  const scaledSilverCost = getScaledConstructionCost(rawType.costSilver, totalBuildings, city.unlockedEvolutions);
  const upgradeCostBase = city.unlockedEvolutions.includes('industrialist') ? 0.64 : 0.8;
  const upgradeCost = Math.floor(scaledSilverCost * upgradeCostBase * building.level);
  const levelMult = 1 + (building.level - 1) * 0.2;
  const currentHousing = Math.floor((rawType.housing || 0) * levelMult);
  const currentProduction = Math.floor((rawType.foodProduction || 0) * levelMult);
  const currentIncome = Math.floor((rawType.silverIncome || 0) * levelMult);
  const occupancy = getBuildingOccupancy(city.population, summary.totalHousing, currentHousing);
  const occStatus = getOccupancyStatus(occupancy, currentHousing);
  const occColor = statusTextColor(occStatus.color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 120 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 120 }}
      className="fixed inset-x-4 bottom-24 z-[120] rounded-t-[2.5rem] border-2 p-5 shadow-[0_-8px_24px_rgba(15,23,42,0.16)] sm:relative sm:bottom-auto sm:inset-x-auto sm:rounded-[2.5rem]"
      style={{ backgroundColor: palette.card, borderColor: palette.border }}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl" style={{ backgroundColor: palette.cardAlt }}>
            <IconRenderer name={rawType.iconName} className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-xl font-black uppercase" style={{ color: palette.accentTeal }}>{rawType.name}</h4>
            <p className="text-xs font-bold" style={{ color: palette.textMuted }}>Level {building.level} - {building.health}% Condition</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-2xl p-2" style={{ backgroundColor: palette.cardAlt }}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rawType.housing > 0 && (
          <DetailMetric label="Housing Capacity" value={`${occupancy} / ${currentHousing}`} progress={(occupancy / (currentHousing || 1)) * 100} accent={occColor} />
        )}
        {rawType.foodProduction > 0 && <DetailMetric label="Food Production" value={`+${currentProduction}`} accent={palette.accentGold} />}
        {rawType.silverIncome > 0 && <DetailMetric label="Tax Revenue" value={`+${currentIncome} S`} accent={palette.accentTeal} />}
        <DetailMetric label="Structure Stability" value={`${building.health}%`} progress={building.health} accent={palette.accentTeal} />
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => onUpgrade(building.id, upgradeCost)}
          disabled={stats.silver < upgradeCost}
          className="flex flex-1 items-center justify-center gap-2 rounded-3xl px-4 py-4 font-black uppercase text-white transition disabled:opacity-50"
          style={{ backgroundColor: stats.silver >= upgradeCost ? palette.accentTeal : palette.border }}
        >
          <TrendingUp className="h-4 w-4" />
          Upgrade ({upgradeCost} S)
        </button>
        <button onClick={() => onRemove(building.id)} className="rounded-3xl px-5 text-white" style={{ backgroundColor: palette.accentRed }}>
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}

function DetailMetric({ label, value, progress, accent }: { label: string; value: string; progress?: number; accent: string }) {
  return (
    <div className="rounded-3xl p-4" style={{ backgroundColor: palette.cardAlt }}>
      <p className="mb-2 text-[10px] font-extrabold uppercase" style={{ color: palette.textMuted }}>{label}</p>
      <p className="text-2xl font-black" style={{ color: accent }}>{value}</p>
      {typeof progress === 'number' && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/10">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, progress)}%`, backgroundColor: accent }} />
        </div>
      )}
    </div>
  );
}
