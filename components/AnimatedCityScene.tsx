'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { useEffect, useState } from 'react'

interface AnimatedCitySceneProps {
    population: number
    healthyPopulation: number
    sick: number
    buildings: Record<string, number>
    level: number
}

export default function AnimatedCityScene({
    population,
    healthyPopulation,
    sick,
    buildings,
    level,
}: AnimatedCitySceneProps) {
    const [floatingEmojis, setFloatingEmojis] = useState<
        Array<{ id: number; emoji: string; x: number; y: number }>
    >([])

    // Generate random floating emojis untuk animasi kehidupan kota
    useEffect(() => {
        const emojis = ['👤', '🐕', '🦋', '☀️', '🌙', '⭐']

        // Buat floating emojis berdasarkan populasi dan bangunan
        const newEmojis = Array.from({ length: Math.min(population, 8) }, (_, i) => ({
            id: i,
            emoji: emojis[i % emojis.length],
            x: Math.random() * 100,
            y: Math.random() * 100,
        }))

        setFloatingEmojis(newEmojis)
    }, [population])

    const totalBuildings = Object.values(buildings).reduce((a, b) => a + b, 0)
    const housesPercentage = ((buildings.house || 0) / Math.max(1, totalBuildings)) * 100
    const farmsPercentage = ((buildings.farm || 0) / Math.max(1, totalBuildings)) * 100
    const otherPercentage =
        ((totalBuildings - (buildings.house || 0) - (buildings.farm || 0)) /
            Math.max(1, totalBuildings)) *
        100

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pemandangan Kota (Level {level})</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Animated scene container */}
                <div className="relative w-full h-64 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden border-2 border-green-300 mb-6">
                    {/* Sky with animated clouds */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-sky-200 to-transparent">
                        <div className="absolute animate-pulse top-4 left-1/4 text-2xl">☁️</div>
                        <div className="absolute animate-pulse top-6 right-1/4 text-2xl delay-1000">☁️</div>
                    </div>

                    {/* Ground */}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-b from-green-200 to-green-300" />

                    {/* Sun/Moon based on level */}
                    <div className="absolute top-4 right-8 text-3xl animate-bounce">
                        {level % 2 === 0 ? '☀️' : '🌙'}
                    </div>

                    {/* Floating population elements */}
                    {floatingEmojis.map((item) => (
                        <div
                            key={item.id}
                            className="absolute text-xl animate-pulse"
                            style={{
                                left: `${item.x}%`,
                                top: `${item.y}%`,
                                animation: `float 6s ease-in-out infinite`,
                                animationDelay: `${item.id * 0.5}s`,
                            }}
                        >
                            {item.emoji}
                        </div>
                    ))}

                    {/* Buildings silhouette */}
                    <div className="absolute bottom-8 left-8 flex gap-2">
                        {[...Array(Math.min(totalBuildings, 5))].map((_, i) => (
                            <div
                                key={i}
                                className="text-3xl animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                🏢
                            </div>
                        ))}
                    </div>

                    {/* Population indicator */}
                    <div className="absolute bottom-8 right-8 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-sm font-bold">
                        👥 {population}
                    </div>
                </div>

                {/* Stats breakdown */}
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">Komposisi Populasi</span>
                            <span className="text-sm text-gray-500">
                                Sehat: {healthyPopulation}, Sakit: {sick}
                            </span>
                        </div>
                        <div className="flex h-6 rounded-full overflow-hidden bg-gray-200">
                            <div
                                className="bg-green-500 transition-all duration-300"
                                style={{
                                    width: `${(healthyPopulation / Math.max(1, population)) * 100}%`,
                                }}
                                title={`Sehat: ${healthyPopulation}`}
                            />
                            <div
                                className="bg-red-500 transition-all duration-300"
                                style={{
                                    width: `${(sick / Math.max(1, population)) * 100}%`,
                                }}
                                title={`Sakit: ${sick}`}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">Komposisi Bangunan</span>
                            <span className="text-sm text-gray-500">Total: {totalBuildings}</span>
                        </div>
                        <div className="flex h-6 rounded-full overflow-hidden bg-gray-200">
                            <div
                                className="bg-red-400 transition-all duration-300"
                                style={{ width: `${housesPercentage}%` }}
                                title={`Rumah: ${buildings.house || 0}`}
                            />
                            <div
                                className="bg-yellow-400 transition-all duration-300"
                                style={{ width: `${farmsPercentage}%` }}
                                title={`Kebun: ${buildings.farm || 0}`}
                            />
                            <div
                                className="bg-blue-400 transition-all duration-300"
                                style={{ width: `${otherPercentage}%` }}
                                title={`Lainnya: ${totalBuildings - (buildings.house || 0) - (buildings.farm || 0)
                                    }`}
                            />
                        </div>
                        <div className="flex gap-4 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-red-400" />
                                <span>Rumah</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-yellow-400" />
                                <span>Kebun</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-blue-400" />
                                <span>Lainnya</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-3 gap-2 mt-6">
                    <div className="bg-gradient-to-br from-green-100 to-green-50 p-3 rounded-lg text-center">
                        <p className="text-2xl">🏗️</p>
                        <p className="text-xs text-gray-600 mt-1">Total</p>
                        <p className="font-bold text-gray-900">{totalBuildings}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 rounded-lg text-center">
                        <p className="text-2xl">💚</p>
                        <p className="text-xs text-gray-600 mt-1">Kesehatan</p>
                        <p className="font-bold text-green-600">
                            {Math.round(
                                ((healthyPopulation / Math.max(1, population)) * 100)
                            )}%
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-3 rounded-lg text-center">
                        <p className="text-2xl">📈</p>
                        <p className="text-xs text-gray-600 mt-1">Pertumbuhan</p>
                        <p className="font-bold text-purple-600">Lv.{level}</p>
                    </div>
                </div>
            </CardContent>

            <style jsx>{`
            @keyframes float {
            0%,
            100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-20px);
            }
            }

            @keyframes bounce {
            0%,
            100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
            }

            .delay-1000 {
            animation-delay: 1000ms;
            }
        `}</style>
        </Card>
    )
}
