import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile(fileName) {
    const envPath = resolve(process.cwd(), fileName)
    if (!existsSync(envPath)) return

    const lines = readFileSync(envPath, 'utf8').split(/\r?\n/)
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        const separatorIndex = trimmed.indexOf('=')
        if (separatorIndex === -1) continue

        const key = trimmed.slice(0, separatorIndex).trim()
        const value = trimmed
            .slice(separatorIndex + 1)
            .trim()
            .replace(/^['"]|['"]$/g, '')

        if (!process.env[key]) {
            process.env[key] = value
        }
    }
}

function getArg(name, fallback) {
    const prefix = `--${name}=`
    const value = process.argv.find((arg) => arg.startsWith(prefix))
    return value ? value.slice(prefix.length) : fallback
}

loadEnvFile('.env')
loadEnvFile('.env.local')

const timestamp = Date.now()
const email = getArg('email', `test.user+${timestamp}@example.com`)
const password = getArg('password', 'Test123456!')
const username = getArg('username', `testuser${timestamp}`)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env/.env.local')
    process.exit(1)
}

if (!serviceRoleKey.startsWith('eyJ') && !serviceRoleKey.startsWith('sb_secret_')) {
    console.error('SUPABASE_SERVICE_ROLE_KEY does not look like a valid Supabase service role key.')
    console.error('Open Supabase Dashboard > Project Settings > API, then copy the service_role key.')
    process.exit(1)
}

async function supabaseRequest(path, options) {
    const response = await fetch(`${supabaseUrl}${path}`, {
        ...options,
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    const text = await response.text()
    const body = text ? JSON.parse(text) : null

    if (!response.ok) {
        const message = body?.message || body?.msg || body?.error || response.statusText
        throw new Error(`${response.status} ${message}`)
    }

    return body
}

let authUser
try {
    authUser = await supabaseRequest('/auth/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                username,
            },
        }),
    })
} catch (error) {
    console.error('Failed to create Supabase Auth user:', error.message)
    process.exit(1)
}

const profile = {
    id: authUser.id,
    email,
    username,
    password_hash: 'managed-by-supabase-auth',
    total_points: 0,
    current_level: 'Beginner',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}

try {
    await supabaseRequest('/rest/v1/users?on_conflict=id', {
        method: 'POST',
        headers: {
            Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(profile),
    })
} catch (error) {
    if (!error.message.includes('password_hash')) {
        console.error('Auth user was created, but profile insert failed:', error.message)
        console.error('Auth user id:', authUser.id)
        process.exit(1)
    }

    const { password_hash, ...profileWithoutPasswordHash } = profile
    try {
        await supabaseRequest('/rest/v1/users?on_conflict=id', {
            method: 'POST',
            headers: {
                Prefer: 'resolution=merge-duplicates',
            },
            body: JSON.stringify(profileWithoutPasswordHash),
        })
    } catch (retryError) {
        console.error('Auth user was created, but profile insert failed:', retryError.message)
        console.error('Auth user id:', authUser.id)
        process.exit(1)
    }
}

console.log('Test user created successfully.')
console.log(`Email: ${email}`)
console.log(`Password: ${password}`)
console.log(`Username: ${username}`)
