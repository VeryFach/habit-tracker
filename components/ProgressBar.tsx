'use client'

import { calculateCompletion } from '@/lib/utils'
import { Card, CardContent } from './Card'

interface ProgressBarProps {
  completed: number
  target: number
  label: string
  icon?: string
}

export function ProgressBar({ completed, target, label, icon = '📊' }: ProgressBarProps) {
  const percentage = calculateCompletion(completed, target)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <span>{icon}</span>
              <span className="truncate">{label}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {completed} / {target} completed
            </p>
          </div>
          <p className="shrink-0 text-lg font-bold text-gray-900">{percentage}%</p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
