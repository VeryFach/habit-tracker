'use client'

import Link from 'next/link'
import { Button } from './Button'

interface HeaderProps {
  userName?: string
  totalPoints?: number
  onLogout?: () => void
}

export function Header({ userName, totalPoints, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="font-bold text-xl text-gray-900">
              Habit Tracker
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {totalPoints !== undefined && (
              <div className="text-sm font-medium">
                <span className="text-gray-500">Points: </span>
                <span className="text-blue-600 font-bold">{totalPoints}</span>
              </div>
            )}

            {userName && (
              <div className="text-sm text-gray-600">
                Hello, <span className="font-medium">{userName}</span>
              </div>
            )}

            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
