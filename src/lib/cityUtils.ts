import { CityState, PlacedBuilding } from '../types';
import { BUILDINGS, GRID_SIZE } from '../constants';

export interface CitySummary {
  totalHousing: number;
  totalFoodProduction: number;
  totalSilverIncome: number;
  totalHealthBonus: number;
  totalHappinessBonus: number;
  foodRequired: number;
  foodDeficit: number;
  homelessCount: number;
  isHungry: boolean;
  isHomeless: boolean;
  taxMultiplier: number;
  healthImpact: number;
  happinessImpact: number;
  constructionCostMultiplier: number;
}

export const getConstructionCostMultiplier = (unlockedEvolutions: string[] = []): number => {
  let multiplier = 1.0;
  if (unlockedEvolutions.includes('nomadic')) multiplier *= 0.9;
  if (unlockedEvolutions.includes('industrialist')) multiplier *= 0.8;
  return multiplier;
};

export const getScaledConstructionCost = (
  baseCost: number,
  totalBuildings: number,
  unlockedEvolutions: string[] = []
): number => {
  const scalar = 1 + totalBuildings * 0.05;
  return Math.floor(baseCost * scalar * getConstructionCostMultiplier(unlockedEvolutions));
};

export const sanitizeBuildings = (buildings: PlacedBuilding[]): PlacedBuilding[] =>
  (buildings || []).filter(b =>
    typeof b.gridX === 'number' &&
    typeof b.gridY === 'number' &&
    Number.isInteger(b.gridX) &&
    Number.isInteger(b.gridY) &&
    b.gridX >= 0 && b.gridX < GRID_SIZE &&
    b.gridY >= 0 && b.gridY < GRID_SIZE
  );

export const isValidGridCoord = (x: unknown, y: unknown): boolean => {
  const nx = Number(x);
  const ny = Number(y);
  return (
    Number.isInteger(nx) &&
    Number.isInteger(ny) &&
    nx >= 0 && nx < GRID_SIZE &&
    ny >= 0 && ny < GRID_SIZE
  );
};

export const calculateCitySummary = (city: CityState): CitySummary => {
  let totalHousing = 0;
  let totalFoodProduction = 0;
  let totalSilverIncome = 0;
  let totalHealthBonus = 0;
  let totalHappinessBonus = 0;
  // Apply Evolution Bonuses
  const evolutions = city.unlockedEvolutions || [];
  const constructionCostMultiplier = getConstructionCostMultiplier(evolutions);
  if (evolutions.includes('agrarian')) {
    totalHealthBonus += 5;
  }
  if (evolutions.includes('feudal')) {
    totalSilverIncome += 50; // Base feudal tax
  }
  if (evolutions.includes('mercantile')) {
    totalSilverIncome += 100;
  }

  sanitizeBuildings(city.buildings || []).forEach(pb => {
    const type = BUILDINGS.find(t => t.id === pb.buildingTypeId);
    if (type) {
      const levelMult = 1 + (pb.level - 1) * 0.2; // 20% bonus per level
      totalHousing += (type.housing || 0) * levelMult;
      totalFoodProduction += (type.foodProduction || 0) * levelMult;
      totalSilverIncome += (type.silverIncome || 0) * levelMult;
      totalHealthBonus += (type.healthBonus || 0);
      totalHappinessBonus += (type.happinessBonus || 0);
    }
  });

  if (evolutions.includes('agrarian')) {
    totalFoodProduction *= 1.2;
  }
  if (evolutions.includes('industrialist')) {
    totalFoodProduction *= 1.3;
  }

  const foodRequired = city.population * 2;
  const foodDeficit = Math.max(0, foodRequired - totalFoodProduction);
  const homelessCount = Math.max(0, city.population - totalHousing);
  
  const isHungry = foodDeficit > 0;
  const isHomeless = homelessCount > 0;

  // Sick population logic (up to 20% of population can be sick if conditions are bad)
  const sickRatio = city.population > 0 ? (city.populationSick || 0) / city.population : 0;

  // Modifiers
  let taxMultiplier = 1.0;
  let healthImpact = totalHealthBonus;
  let happinessImpact = totalHappinessBonus;

  if (evolutions.includes('feudal')) {
    taxMultiplier *= 1.15;
  }
  if (evolutions.includes('modernist')) {
    happinessImpact += 15;
  }
  if (evolutions.includes('cybernetic')) {
    healthImpact += 50;
  }

  // Sick citizens don't produce tax
  taxMultiplier *= (1 - sickRatio);

  if (isHungry) {
    taxMultiplier *= 0.6;
    healthImpact -= 10;
    happinessImpact -= 20;
  }

  if (isHomeless) {
    taxMultiplier *= 0.7;
    healthImpact -= 15;
    happinessImpact -= 25;
  }

  // Health state based multipliers
  if (city.health < 40) taxMultiplier *= 0.8;
  if (city.health < 20) taxMultiplier *= 0.5;

  return {
    totalHousing: Math.floor(totalHousing),
    totalFoodProduction: Math.floor(totalFoodProduction),
    totalSilverIncome: Math.floor(totalSilverIncome * taxMultiplier),
    totalHealthBonus,
    totalHappinessBonus,
    foodRequired,
    foodDeficit,
    homelessCount,
    isHungry,
    isHomeless,
    taxMultiplier,
    healthImpact,
    happinessImpact,
    constructionCostMultiplier
  };
};

export const getHealthStatus = (health: number) => {
  if (health >= 80) return { label: 'Optimal', color: 'text-brand-teal', description: 'Warga sangat sehat dan produktif.' };
  if (health >= 60) return { label: 'Baik', color: 'text-brand-teal/80', description: 'Kondisi kesehatan stabil.' };
  if (health >= 40) return { label: 'Fair', color: 'text-brand-yellow', description: 'Beberapa warga mulai merasa tidak enak badan.' };
  if (health >= 20) return { label: 'Krisis', color: 'text-brand-red', description: 'Wabah penyakit mulai menyerang!' };
  return { label: 'Epidemi', color: 'text-brand-red font-black animate-pulse', description: 'Epidemi parah melanda kota!' };
};

export const getProductivityStatus = (multiplier: number) => {
  if (multiplier >= 1.0) return { label: 'Optimal', color: 'text-brand-teal' };
  if (multiplier >= 0.8) return { label: 'Reduced', color: 'text-brand-teal/70' };
  if (multiplier >= 0.5) return { label: 'Suppressed', color: 'text-brand-yellow' };
  return { label: 'Collapse', color: 'text-brand-red' };
};

export const getBuildingOccupancy = (population: number, totalHousing: number, buildingCapacity: number) => {
  if (totalHousing === 0) return 0;
  const ratio = population / totalHousing;
  return Math.min(buildingCapacity, Math.floor(buildingCapacity * ratio));
};

export const getOccupancyStatus = (occupancy: number, capacity: number) => {
  if (capacity === 0) return { label: 'N/A', color: 'text-brand-muted' };
  const ratio = occupancy / capacity;
  if (ratio >= 1.0) return { label: 'Full Capacity', color: 'text-brand-red' };
  if (ratio >= 0.8) return { label: 'Overcrowded', color: 'text-brand-yellow' };
  if (ratio >= 0.4) return { label: 'Optimal', color: 'text-brand-teal' };
  return { label: 'Low Occupancy', color: 'text-brand-teal/60' };
};

export const getHappinessStatus = (happiness: number) => {
  if (happiness >= 80) return { label: 'Sangat Bahagia', color: 'text-brand-teal' };
  if (happiness >= 60) return { label: 'Senang', color: 'text-brand-teal/80' };
  if (happiness >= 40) return { label: 'Netral', color: 'text-brand-yellow' };
  return { label: 'Resah', color: 'text-brand-red' };
};
