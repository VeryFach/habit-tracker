'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'

interface BuildingMapProps {
    buildings: Record<string, number>
    population: number
    level: number
}

interface Building {
    key: string
    name: string
    icon: string
    color: string
    description: string
}

const BUILDING_TYPES: Building[] = [
    {
        key: 'house',
        name: 'Rumah Warga',
        icon: '🏠',
        color: 'bg-red-100 border-red-300',
        description: 'Tempat tinggal warga kota',
    },
    {
        key: 'farm',
        name: 'Kebun Pangan',
        icon: '🌾',
        color: 'bg-yellow-100 border-yellow-300',
        description: 'Sumber makanan utama',
    },
    {
        key: 'restaurant',
        name: 'Restoran',
        icon: '🍽️',
        color: 'bg-orange-100 border-orange-300',
        description: 'Pusat layanan makanan',
    },
    {
        key: 'taxOffice',
        name: 'Kantor Pajak',
        icon: '🏛️',
        color: 'bg-blue-100 border-blue-300',
        description: 'Pusat pemerintahan',
    },
    {
        key: 'cloneCenter',
        name: 'Pusat Kloning',
        icon: '🧬',
        color: 'bg-purple-100 border-purple-300',
        description: 'Teknologi canggih',
    },
    {
        key: 'coffeeShop',
        name: 'Kafe Kopi',
        icon: '☕',
        color: 'bg-amber-100 border-amber-300',
        description: 'Meningkatkan mood & produktivitas warga'
    },
]

interface GridCell {
    type: 'building' | 'empty'
    building?: Building
    count?: number
}

function generateCityLayout(
    buildings: Record<string, number>,
    level: number
): GridCell[] {
    const cells: GridCell[] = []

    // Jumlah sel tergantung level peradaban
    const totalCells = 16 + level * 2 // 16 untuk level 1, 18 untuk level 2, dst

    // Tempatkan bangunan berdasarkan jumlah yang dimiliki
    let cellIndex = 0

    for (const buildingType of BUILDING_TYPES) {
        const count = buildings[buildingType.key] || 0
        for (let i = 0; i < count && cellIndex < totalCells; i++) {
            cells.push({
                type: 'building',
                building: buildingType,
                count: i + 1,
            })
            cellIndex++
        }
    }

    // Isi sisa dengan empty cells
    while (cells.length < totalCells) {
        cells.push({ type: 'empty' })
    }

    return cells
}

export default function BuildingMap({
    buildings,
    population,
    level,
}: BuildingMapProps) {
    const cityLayout = generateCityLayout(buildings, level)
    const gridColumns = 6

    // Hitung statistik
    const totalBuildings = Object.values(buildings).reduce((a, b) => a + b, 0)
    const maxCapacity = Math.max(0, (buildings.house || 0) * 5 + (buildings.restaurant || 0) * 2)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Peta Tata Letak Kota</CardTitle>
                <p className="text-sm text-gray-500 mt-2">
                    {totalBuildings} bangunan | Kapasitas rumah: {maxCapacity} | Populasi: {population}
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* City Grid */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                            gap: '8px',
                        }}
                    >
                        {cityLayout.map((cell, idx) =>
                            cell.type === 'building' && cell.building ? (
                                <div
                                    key={idx}
                                    className={`aspect-square rounded-lg border-2 ${cell.building.color} flex flex-col items-center justify-center p-2 cursor-pointer transition hover:shadow-lg hover:scale-105 group`}
                                    title={`${cell.building.name} #${cell.count}`}
                                >
                                    <div className="text-2xl">{cell.building.icon}</div>
                                    <div className="text-xs font-bold text-gray-700 mt-1 group-hover:block hidden absolute bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap z-10">
                                        {cell.building.name}
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 absolute bottom-1 right-1">
                                        #{cell.count}
                                    </span>
                                </div>
                            ) : (
                                <div
                                    key={idx}
                                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-white bg-opacity-50 flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:bg-opacity-100 transition"
                                    title="Area kosong"
                                >
                                    +
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Building Legend */}
                <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Daftar Bangunan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {BUILDING_TYPES.map((building) => {
                            const count = buildings[building.key] || 0
                            return (
                                <div
                                    key={building.key}
                                    className={`rounded-lg border-2 p-3 ${building.color}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-2">
                                            <span className="text-2xl">{building.icon}</span>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {building.name}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {building.description}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="bg-white rounded-full px-3 py-1 font-bold text-gray-700">
                                            {count}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* City Statistics */}
                <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Statistik Kota</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{totalBuildings}</p>
                            <p className="text-xs text-gray-600 mt-1">Total Bangunan</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-green-50 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{maxCapacity}</p>
                            <p className="text-xs text-gray-600 mt-1">Kapasitas</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">
                                {Math.max(0, maxCapacity - population)}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">Ruang Kosong</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
