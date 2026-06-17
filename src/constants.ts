import { Era, BuildingType, EvolutionBranch } from './types';

export interface EraConfig {
  id: import('./types').Era;
  minLevel: number;
  name: string;
  displayName: string;
  description?: string;
  unlocks?: string[];
}

export const ERAS_CONFIG: EraConfig[] = [
  { 
    id: Era.STONE_AGE, 
    minLevel: 1, 
    name: 'Stone Age',
    displayName: 'Stone Age',
    description: 'Awal mula kemanusiaan. Fokus pada bertahan hidup dan pengumpulan dasar.',
    unlocks: ['nomadic', 'agrarian']
  },
  { 
    id: Era.MEDIEVAL, 
    minLevel: 5, 
    name: 'Medieval',
    displayName: 'Medieval',
    description: 'Zaman keemasan kerajaan dan ksatria.',
    unlocks: ['feudal', 'mercantile']
  },
  { id: Era.INDUSTRIAL, minLevel: 15, name: 'Industrial', displayName: 'Industrial' },
  { id: Era.MODERN, minLevel: 30, name: 'Modern', displayName: 'Modern' },
  { id: Era.DIGITAL, minLevel: 50, name: 'Digital Era', displayName: 'Digital Era' },
];

export const EVOLUTION_BRANCHES: EvolutionBranch[] = [
  {
    id: 'nomadic',
    name: 'Suku Nomadik',
    description: 'Berpindah-pindah mengikuti sumber daya. Fokus pada mobilitas.',
    era: Era.STONE_AGE,
    requirements: [
      { type: 'level', target: 2, description: 'Mencapai Level 2' },
      { type: 'buildings', target: 'house', count: 2, description: 'Memiliki 2 Simple House' }
    ],
    benefits: ['Bonus Silver dari eksplorasi', 'Biaya bangunan -10%'],
    iconName: 'Tent'
  },
  {
    id: 'agrarian',
    name: 'Masyarakat Agraris',
    description: 'Menetap dan bercocok tanam. Fokus pada pertumbuhan populasi.',
    era: Era.STONE_AGE,
    requirements: [
      { type: 'level', target: 3, description: 'Mencapai Level 3' },
      { type: 'buildings', target: 'farm', count: 3, description: 'Memiliki 3 Communal Farm' }
    ],
    benefits: ['Bonus Food Production +20%', 'Kesehatan penduduk +5%'],
    iconName: 'Wheat'
  },
  {
    id: 'feudal',
    name: 'Sistem Feodal',
    description: 'Hierarki ketaatan dan perlindungan.',
    era: Era.MEDIEVAL,
    requirements: [
      { type: 'level', target: 8, description: 'Mencapai Level 8' }
    ],
    benefits: ['Pajak harian +15%', 'Pertahanan kota meningkat'],
    iconName: 'Shield'
  },
  {
    id: 'mercantile',
    name: 'Serikat Pedagang',
    description: 'Berfokus pada perdagangan dan akumulasi kekayaan.',
    era: Era.MEDIEVAL,
    requirements: [
      { type: 'level', target: 12, description: 'Mencapai Level 12' }
    ],
    benefits: ['Diskon toko 10%', 'Silver dari gacha +50%'],
    iconName: 'Coins'
  },
  {
    id: 'industrialist',
    name: 'Revolusi Industri',
    description: 'Produksi massal dan efisiensi mekanis.',
    era: Era.INDUSTRIAL,
    requirements: [
      { type: 'level', target: 20, description: 'Mencapai Level 20' }
    ],
    benefits: ['Biaya upgrade -20%', 'Food Production +30%'],
    iconName: 'Factory'
  },
  {
    id: 'modernist',
    name: 'Visi Global',
    description: 'Konektivitas dan inovasi urban.',
    era: Era.MODERN,
    requirements: [
      { type: 'level', target: 35, description: 'Mencapai Level 35' }
    ],
    benefits: ['Kebahagiaan warga +15%', 'Momentum Bonus +25%'],
    iconName: 'Globe'
  },
  {
    id: 'cybernetic',
    name: 'Singularitas Digital',
    description: 'Integrasi penuh antara biologi dan teknologi.',
    era: Era.DIGITAL,
    requirements: [
      { type: 'level', target: 60, description: 'Mencapai Level 60' }
    ],
    benefits: ['Pertumbuhan populasi +50%', 'Imunitas terhadap penyakit'],
    iconName: 'Cpu'
  }
];

export const BUILDINGS: BuildingType[] = [
  // STONE AGE & EARLY
  {
    id: 'house',
    name: 'Simple House',
    era: Era.STONE_AGE,
    category: 'residential',
    costSilver: 100,
    costGold: 0,
    housing: 10,
    foodProduction: 0,
    silverIncome: 0,
    healthBonus: 0,
    happinessBonus: 2,
    description: 'Tempat tinggal dasar untuk penduduk baru.',
    iconName: 'Home'
  },
  {
    id: 'farm',
    name: 'Communal Farm',
    era: Era.STONE_AGE,
    category: 'food',
    costSilver: 80,
    costGold: 0,
    housing: 0,
    foodProduction: 25,
    silverIncome: 0,
    healthBonus: 1,
    happinessBonus: 0,
    description: 'Sumber makanan utama untuk koloni.',
    iconName: 'Wheat'
  },
  // MEDIEVAL / MID
  {
    id: 'restaurant',
    name: 'Village Restaurant',
    era: Era.MEDIEVAL,
    category: 'food',
    costSilver: 500,
    costGold: 0,
    housing: 0,
    foodProduction: 60,
    silverIncome: 10,
    healthBonus: 0,
    happinessBonus: 5,
    description: 'Menyediakan makanan berkualitas dan pemasukan kecil.',
    iconName: 'Utensils'
  },
  {
    id: 'taxOffice',
    name: 'Tax Office',
    era: Era.MEDIEVAL,
    category: 'economic',
    costSilver: 1200,
    costGold: 2,
    housing: -2,
    foodProduction: 0,
    silverIncome: 80,
    healthBonus: -2,
    happinessBonus: -5,
    description: 'Pusat penagihan pajak untuk kemakmuran kota.',
    iconName: 'Landmark'
  },
  // INDUSTRIAL & LATE
  {
    id: 'coffeeShop',
    name: 'Artisan Coffee Shop',
    era: Era.INDUSTRIAL,
    category: 'economic',
    costSilver: 3000,
    costGold: 10,
    housing: 0,
    foodProduction: 10,
    silverIncome: 150,
    healthBonus: 2,
    happinessBonus: 8,
    description: 'Tempat berkumpul elit dengan profit tinggi.',
    iconName: 'Coffee'
  },
  {
    id: 'medicalClinic',
    name: 'Medical Clinic',
    era: Era.MEDIEVAL,
    category: 'utility',
    costSilver: 800,
    costGold: 0,
    housing: 0,
    foodProduction: 0,
    silverIncome: -10,
    healthBonus: 15,
    happinessBonus: 5,
    description: 'Pusat pengobatan untuk menekan angka kematian.',
    iconName: 'Stethoscope'
  },
  {
    id: 'cloneCenter',
    name: 'Population Clone Center',
    era: Era.MODERN,
    category: 'special',
    costSilver: 10000,
    costGold: 100,
    housing: 200,
    foodProduction: -50,
    silverIncome: 0,
    healthBonus: -10,
    happinessBonus: -10,
    description: 'Teknologi masa depan untuk ledakan populasi.',
    iconName: 'Dna'
  }
];

export const RECOVERY_ITEMS = [
  { id: 'espresso', name: 'Espresso', costGold: 50, hpRestore: 10, icon: 'Coffee', description: 'Quick boost of energy.' },
  { id: 'potion', name: 'Divine Potion', costGold: 200, hpRestore: 50, icon: 'FlaskConical', description: 'Ancient brew for rapid healing.' },
  { id: 'ticket', name: 'Elysium Ticket', costGold: 500, hpRestore: 100, icon: 'Ticket', description: 'Total reality recalibration.' },
  { id: 'skipTicket', name: 'Skip Ticket', costGold: 1500, hpRestore: 0, icon: 'Clock', description: 'Protect your simulation from a missed day.' },
];

export const GRID_SIZE = 10;
export const EXP_PER_LEVEL = 1000;
export const DEFAULT_HP = 100;
export const PASSIVE_INTERVAL = 60000; // 1 minute

export const DISASTERS = [
  { id: 'plague', name: 'Mysterious Plague', description: 'Wabah misterius menyerang. Kesehatan warga terancam!', impactType: 'health', severity: 15 },
  { id: 'earthquake', name: 'Tremor of Gaia', description: 'Gempa bumi merusak infrastruktur kota.', impactType: 'building', severity: 5 },
  { id: 'famine', name: 'Great Drought', description: 'Kekeringan panjang. Stok makanan menipis drastis.', impactType: 'happiness', severity: 10 },
  { id: 'revolt', name: 'Citizen Unrest', description: 'Ketidakpuasan massal. Kebahagiaan menurun tajam.', impactType: 'happiness', severity: 20 },
];

export const ERA_MILESTONES = [
  { era: Era.STONE_AGE, populationTarget: 0, unlocks: ['Hunters Cabin', 'Fire Pit'] },
  { era: Era.MEDIEVAL, populationTarget: 100, unlocks: ['Grand Castle', 'Market Square'] },
  { era: Era.INDUSTRIAL, populationTarget: 500, unlocks: ['Steel Mill', 'Train Station'] },
  { era: Era.MODERN, populationTarget: 2000, unlocks: ['Skyscraper', 'Airport'] },
  { era: Era.DIGITAL, populationTarget: 10000, unlocks: ['Data Hive', 'Neural Interface'] },
];
