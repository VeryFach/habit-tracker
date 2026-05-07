'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'

interface CityVisualizationProps {
    population: number
    healthyPopulation: number
    sick: number
    food: number
    housing: number
    level: number
    buildings: Record<string, number>
}

interface CivEra {
    name: string
    minLevel: number
    color: string
    bgGradient: string
    icon: string
    description: string
}

const CIVILIZATIONS: CivEra[] = [
    {
        name: 'Zaman Batu',
        minLevel: 1,
        color: '#8B7355',
        bgGradient: 'from-amber-900 to-stone-800',
        icon: '🪨',
        description: 'Permulaan sederhana dengan batu dan kayu',
    },
    {
        name: 'Zaman Perunggu',
        minLevel: 2,
        color: '#CD7F32',
        bgGradient: 'from-orange-700 to-amber-800',
        icon: '🗿',
        description: 'Era logam pertama dengan perunggu',
    },
    {
        name: 'Zaman Besi',
        minLevel: 3,
        color: '#696969',
        bgGradient: 'from-slate-700 to-gray-800',
        icon: '⚔️',
        description: 'Zaman besi dengan teknologi canggih',
    },
    {
        name: 'Era Pertanian',
        minLevel: 4,
        color: '#228B22',
        bgGradient: 'from-green-700 to-emerald-800',
        icon: '🌾',
        description: 'Peradaban pertanian yang maju',
    },
    {
        name: 'Era Digital',
        minLevel: 5,
        color: '#00CED1',
        bgGradient: 'from-cyan-600 to-blue-700',
        icon: '🔮',
        description: 'Peradaban futuristik dengan teknologi canggih',
    },
]

function getCivilization(level: number): CivEra {
    for (let i = CIVILIZATIONS.length - 1; i >= 0; i--) {
        if (level >= CIVILIZATIONS[i].minLevel) {
            return CIVILIZATIONS[i]
        }
    }
    return CIVILIZATIONS[0]
}

function CityBuildings({ buildings }: { buildings: Record<string, number> }) {
    const buildingList = [
        { key: 'house', name: '🏠', count: buildings.house || 0 },
        { key: 'farm', name: '🌾', count: buildings.farm || 0 },
        { key: 'restaurant', name: '🍽️', count: buildings.restaurant || 0 },
        { key: 'taxOffice', name: '🏛️', count: buildings.taxOffice || 0 },
        { key: 'cloneCenter', name: '🧬', count: buildings.cloneCenter || 0 },
        { key : 'coffeeShop', name: '☕', count: buildings.coffeeShop || 0 },
    ]

  return (
    <div className="grid grid-cols-6 gap-2">
      {buildingList.map((building) => (
        <div key={building.key} className="flex flex-col items-center">
          <span className="text-3xl">{building.name}</span>
          <span className="text-xs font-bold text-gray-600 mt-1">
            {building.count}x
          </span>
        </div>
      ))}
    </div>
  )
}

function PopulationVisualization({
    population,
    healthyPopulation,
    sick,
}: {
    population: number
    healthyPopulation: number
    sick: number
}) {
    // Tampilkan maksimal 20 orang, tapi perlihatkan jumlah sebenarnya
    const displayCount = Math.min(population, 20)
    const people = Array.from({ length: displayCount }, (_, i) => {
        const isSick = i >= healthyPopulation
        return (
            <div
                key={i}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition transform hover:scale-125 ${isSick
                        ? 'bg-red-400 text-red-900'
                        : 'bg-green-400 text-green-900'
                    }`}
                title={isSick ? 'Warga sakit' : 'Warga sehat'}
            >
                👤
            </div>
        )
    })

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Populasi Kota</h3>
                <span className="text-lg font-bold text-gray-900">{population} jiwa</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {people}
                {population > 20 && (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                        +{population - 20}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-green-50 p-2 rounded">
                    <p className="text-green-700 font-semibold">Sehat: {healthyPopulation}</p>
                </div>
                <div className="bg-red-50 p-2 rounded">
                    <p className="text-red-700 font-semibold">Sakit: {sick}</p>
                </div>
            </div>
        </div>
    )
}

function ResourceStatus({
    food,
    housing,
    population,
}: {
    food: number
    housing: number
    population: number
}) {
    const foodSituation =
        food > population ? 'Surplus' : food === population ? 'Pas' : 'Kekurangan'
    const housingSituation =
        housing >= population ? 'Cukup' : 'Kurang'

    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-3">
                <div className="text-2xl mb-1">🍞</div>
                <p className="text-sm font-semibold text-gray-900">{food} Makanan</p>
                <p className={`text-xs font-bold ${foodSituation === 'Surplus'
                        ? 'text-green-600'
                        : foodSituation === 'Pas'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                    }`}>
                    {foodSituation}
                </p>
            </div>
            <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-3">
                <div className="text-2xl mb-1">🏘️</div>
                <p className="text-sm font-semibold text-gray-900">{housing} Rumah</p>
                <p className={`text-xs font-bold ${housingSituation === 'Cukup' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {housingSituation}
                </p>
            </div>
        </div>
    )
}

export default function CityVisualization({
    population,
    healthyPopulation,
    sick,
    food,
    housing,
    level,
    buildings,
}: CityVisualizationProps) {
    const civ = getCivilization(level)

    return (
        <div className="space-y-5">
            {/* Civilization Level */}
            <div
                className={`rounded-lg bg-gradient-to-r ${civ.bgGradient} p-6 text-white shadow-lg`}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-90">Level Peradaban</p>
                        <h2 className="text-3xl font-bold mt-1">{civ.icon} {civ.name}</h2>
                        <p className="text-sm opacity-80 mt-2 max-w-md">{civ.description}</p>
                    </div>
                    <div className="text-6xl opacity-50">{civ.icon}</div>
                </div>
            </div>

            {/* Main City View */}
            <Card>
                <CardHeader>
                    <CardTitle>Panorama Kota</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Population visualization */}
                    <PopulationVisualization
                        population={population}
                        healthyPopulation={healthyPopulation}
                        sick={sick}
                    />

                    {/* Resource status */}
                    <ResourceStatus food={food} housing={housing} population={population} />

                    {/* Buildings section */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Bangunan di Kota</h3>
                        <CityBuildings buildings={buildings} />
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                    ['Populasi', population, '👥'],
                    ['Sehat', healthyPopulation, '💚'],
                    ['Sakit', sick, '🤒'],
                    ['Makanan', food, '🍞'],
                    ['Rumah', housing, '🏠'],
                ].map(([label, value, emoji]) => (
                    <Card key={label}>
                        <CardContent className="p-3 text-center">
                            <div className="text-2xl mb-1">{emoji}</div>
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
