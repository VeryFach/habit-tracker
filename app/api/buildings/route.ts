import { getServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

type TransformedBuildingConfig = {
    key: string
    name: string
    description: string
    baseCost: number
}

export async function GET() {
    try {
        const supabase = await getServerClient()

        const { data: buildings, error } = await supabase
            .from('building_configs')
            .select('*')
            .order('created_at', { ascending: true })

        if (error) {
            // If the config tables haven't been created/migrated yet, avoid failing the whole app.
            // PostgREST uses PGRST205 when a table/view isn't present in the schema cache.
            const code =
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                typeof (error as { code?: unknown }).code === 'string'
                    ? (error as { code: string }).code
                    : null

            if (code === 'PGRST205') {
                console.warn(
                    "building_configs table missing (PGRST205). Returning empty buildings list."
                )
                return NextResponse.json({ buildings: [] }, { status: 200 })
            }

            throw error
        }

        // Transform to frontend format
        const transformedBuildings: TransformedBuildingConfig[] = (buildings || []).map(
            (building) => ({
                key: building.building_key,
                name: building.name,
                description: building.description ?? '',
                baseCost: building.base_cost,
            })
        )

        return NextResponse.json({ buildings: transformedBuildings })
    } catch (error) {
        console.error('Error fetching building configs:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
