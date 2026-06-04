'use client'

import { useEffect, useState } from 'react'

export interface GachaReward {
  name: string
  silverReward: number
  prob: number
  type: string
}

export interface BuildingDefinition {
  key: 'house' | 'farm' | 'taxOffice' | 'restaurant' | 'cloneCenter' | 'coffeeShop'
  name: string
  description: string
  baseCost: number
}

export interface Badge {
  id: string
  name: string
  requirement: number
}

export function useCivFitConfig() {
  const [buildings, setBuildings] = useState<BuildingDefinition[]>([])
  const [gacha, setGacha] = useState<GachaReward[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true)

        // Fetch buildings
        const buildingsRes = await fetch('/api/buildings')
        if (!buildingsRes.ok) throw new Error('Failed to fetch buildings')
        const buildingsData = await buildingsRes.json()
        setBuildings(buildingsData.buildings || [])

        // Fetch gacha rewards
        const gachaRes = await fetch('/api/gacha')
        if (!gachaRes.ok) throw new Error('Failed to fetch gacha rewards')
        const gachaData = await gachaRes.json()
        setGacha(gachaData.gacha_rewards || [])

        // Fetch badges
        const badgesRes = await fetch('/api/badges-config')
        if (!badgesRes.ok) throw new Error('Failed to fetch badges')
        const badgesData = await badgesRes.json()
        setBadges(badgesData.badges || [])

        setError(null)
      } catch (err) {
        console.error('Error fetching CivFit config:', err)
        setError(err as Error)

        // Fallback to defaults if fetch fails
        setBuildings([
          {
            key: 'house',
            name: 'Rumah Warga',
            description: '+5 kapasitas rumah.',
            baseCost: 30,
          },
          {
            key: 'farm',
            name: 'Kebun Pangan',
            description: '+8 makanan setiap evaluasi hari.',
            baseCost: 35,
          },
          {
            key: 'taxOffice',
            name: 'Kantor Pajak',
            description: 'Pajak dari maksimal 10 warga sehat per kantor.',
            baseCost: 50,
          },
          {
            key: 'restaurant',
            name: 'Restoran',
            description: '+2 populasi dan +6 makanan.',
            baseCost: 75,
          },
          {
            key: 'cloneCenter',
            name: 'Pusat Kloning',
            description: 'Menggandakan 1 warga per kelipatan 3 populasi.',
            baseCost: 140,
          },
          {
            key: 'coffeeShop',
            name: 'Kafe Kopi',
            description: 'Meningkatkan mood & produktivitas warga.',
            baseCost: 60,
          },
        ])

        setGacha([
          { name: 'Zonk Murni', silverReward: 0, prob: 0.1, type: 'loss' },
          { name: 'Receh Kembali', silverReward: 8, prob: 0.45, type: 'small' },
          { name: 'Hadiah Sedang', silverReward: 28, prob: 0.35, type: 'medium' },
          { name: 'Jackpot Kota', silverReward: 70, prob: 0.1, type: 'jackpot' },
        ])

        setBadges([
          { id: 'steady-start', name: 'Langkah Awal', requirement: 100 },
          { id: 'city-founder', name: 'Pendiri Kota', requirement: 250 },
          { id: 'iron-discipline', name: 'Disiplin Besi', requirement: 450 },
          { id: 'gold-rhythm', name: 'Ritme Emas', requirement: 700 },
          { id: 'civilization-core', name: 'Inti Peradaban', requirement: 1000 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { buildings, gacha, badges, loading, error }
}
