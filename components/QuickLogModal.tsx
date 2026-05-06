'use client'

import { useState } from 'react'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'

interface QuickLogModalProps {
  isOpen: boolean
  habitName: string
  isLoading: boolean
  onSubmit: (notes: string) => Promise<void>
  onClose: () => void
}

export function QuickLogModal({
  isOpen,
  habitName,
  isLoading,
  onSubmit,
  onClose,
}: QuickLogModalProps) {
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    try {
      setError('')
      await onSubmit(notes)
      setNotes('')
      onClose()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 p-3 sm:items-center sm:p-4">
      <Card className="max-h-[calc(100vh-1.5rem)] w-full max-w-md overflow-y-auto">
        <CardHeader className="px-4 py-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Log Habit: {habitName}</CardTitle>
        </CardHeader>

        <CardContent className="px-4 py-4 sm:px-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a note (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it go? Any notes?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                rows={4}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                Log Habit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
