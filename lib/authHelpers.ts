/**
 * Utility functions untuk authentication
 */

import { createClient } from './supabase'

/**
 * Debounce helper untuk menghindari multiple rapid calls
 */
export function createDebounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number = 500
) {
    let timeoutId: NodeJS.Timeout

    return function (...args: Parameters<T>) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            func(...args)
        }, delay)
    } as T
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate password strength (minimal, reasonable rules)
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    // Only require minimum length
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters')
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Format auth errors untuk user-friendly messages
 */
export function formatAuthError(error: Error | string): string {
    const message = typeof error === 'string' ? error : error.message

    // Already registered
    if (
        message.includes('already registered') ||
        message.includes('already exist') ||
        message.includes('duplicate')
    ) {
        return '📧 This email is already registered. Please login instead.'
    }

    // Invalid email
    if (message.includes('invalid email')) {
        return '❌ Please enter a valid email address.'
    }

    // Password validation
    if (message.includes('password')) {
        return '🔑 Password must be at least 6 characters.'
    }
    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
        return '🌐 Network error. Please check your connection and try again.'
    }

    // Default
    return message || 'An error occurred. Please try again.'
}

/**
 * Check auth service health
 */
export async function checkAuthHealth(): Promise<{
    isHealthy: boolean
    message: string
}> {
    try {
        const supabase = createClient()

        // Try to get current user to verify connection
        const { error } = await supabase.auth.getUser()

        if (error && !error.message.includes('Auth session missing')) {
            return {
                isHealthy: false,
                message: `Auth service error: ${error.message}`,
            }
        }

        return {
            isHealthy: true,
            message: 'Auth service is healthy',
        }
    } catch (error) {
        return {
            isHealthy: false,
            message: `Connection error: ${(error as Error).message}`,
        }
    }
}
