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
        <div className="flex min-h-14 items-center justify-between gap-3 py-2 sm:min-h-16 sm:py-0">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="truncate text-lg font-bold text-gray-900 sm:text-xl">
              Habit Tracker
            </span>
          </Link>

          <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-6">
            {totalPoints !== undefined && (
              <div className="hidden text-sm font-medium sm:block">
                <span className="text-gray-500">Points: </span>
                <span className="text-blue-600 font-bold">{totalPoints}</span>
              </div>
            )}

            {userName && (
              <div className="hidden max-w-40 truncate text-sm text-gray-600 sm:block">
                Hello, <span className="font-medium">{userName}</span>
              </div>
            )}

            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
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
