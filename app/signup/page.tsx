'use client'

import { Button } from '@/components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { signUp } from '@/lib/auth'
import { formatAuthError, isValidEmail } from '@/lib/authHelpers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

export default function SignupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    // Prevent double submit with 1 second cooldown
    const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleEmailChange = (email: string) => {
        setFormData({ ...formData, email })
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Prevent double submit
        if (loading || submitTimeoutRef.current) {
            return
        }

        // Basic validation
        if (!formData.username.trim()) {
            setError('Username is required')
            return
        }

        if (!isValidEmail(formData.email)) {
            setError('Please enter a valid email')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        try {
            setLoading(true)
            setError('')

            // Prevent rapid re-submissions
            submitTimeoutRef.current = setTimeout(() => {
                submitTimeoutRef.current = null
            }, 2000)

            await signUp(formData.email, formData.password, formData.username)

            // Redirect on success
            router.push('/dashboard')
        } catch (err) {
            const errorMsg = (err as Error).message
            setError(formatAuthError(errorMsg))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center border-0">
                    <div className="text-4xl mb-4">🎯</div>
                    <CardTitle className="text-2xl">Get Started</CardTitle>
                    <p className="text-sm text-gray-500 mt-2">
                        Create your Habit Tracker account
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                                placeholder="johndoe"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                placeholder="••••••••"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                }
                                placeholder="••••••••"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                                <div className="font-medium">❌ {error}</div>
                            </div>
                        )}

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-full"
                            isLoading={loading}
                        >
                            Create Account
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                            Sign in here
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
