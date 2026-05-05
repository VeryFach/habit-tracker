import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge classnames with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Get week start date
 */
export function getWeekStart(date: Date = new Date()): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
}

/**
 * Get week end date
 */
export function getWeekEnd(date: Date = new Date()): Date {
    const start = getWeekStart(date)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return end
}

/**
 * Calculate level based on points
 */
export function calculateLevel(points: number): string {
    if (points < 10) return 'Beginner'
    if (points < 50) return 'Novice'
    if (points < 100) return 'Intermediate'
    if (points < 300) return 'Advanced'
    return 'Master'
}

/**
 * Calculate points needed for next level
 */
export function getPointsToNextLevel(points: number): number {
    const levelThresholds = [0, 10, 50, 100, 300]
    for (const threshold of levelThresholds) {
        if (points < threshold) return threshold - points
    }
    return 0
}

/**
 * Get level color
 */
export function getLevelColor(level: string): string {
    const colors: Record<string, string> = {
        Beginner: '#98D8C8',
        Novice: '#45B7D1',
        Intermediate: '#FFA07A',
        Advanced: '#F7DC6F',
        Master: '#FF6B6B',
    }
    return colors[level] || '#4ECDC4'
}

/**
 * Calculate completion percentage
 */
export function calculateCompletion(
    completed: number,
    target: number
): number {
    if (target === 0) return 0
    return Math.round((completed / target) * 100)
}

/**
 * Format points with suffix
 */
export function formatPoints(points: number): string {
    if (points >= 1000) return `${(points / 1000).toFixed(1)}k`
    return `${points}`
}

/**
 * Get days until date
 */
export function daysUntil(date: string | Date): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
    const diff = target.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Check if logged today
 */
export function isLoggedToday(lastLogDate?: string): boolean {
    if (!lastLogDate) return false
    const lastLog = new Date(lastLogDate)
    const today = new Date()
    return (
        lastLog.getFullYear() === today.getFullYear() &&
        lastLog.getMonth() === today.getMonth() &&
        lastLog.getDate() === today.getDate()
    )
}

/**
 * Generate random color
 */
export function getRandomColor(): string {
    const colors = [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#FFA07A',
        '#98D8C8',
        '#F7DC6F',
        '#FF8B94',
        '#A8E6CF',
    ]
    return colors[Math.floor(Math.random() * colors.length)]
}
