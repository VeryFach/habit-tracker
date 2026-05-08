'use client'

import { Button } from '@/components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import type { Habit } from '@/types/database'
import { useState } from 'react'

interface HabitFormData {
  name: string
  description: string
  category: string
  frequency: 'daily' | 'weekly' | 'monthly'
  target_count: number
  points_per_completion: number
  color: string
  icon: string
}

interface CreateHabitFormProps {
  onSubmit: (data: HabitFormData) => Promise<void>
  onCancel: () => void
  initialData?: Habit | null
  title?: string
  submitLabel?: string
}

export function CreateHabitForm({
  onSubmit,
  onCancel,
  initialData,
  title = 'Create New Habit',
  submitLabel = 'Create Habit',
}: CreateHabitFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<HabitFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'fitness',
    frequency: initialData?.frequency || 'daily',
    target_count: initialData?.target_count || 1,
    points_per_completion: initialData?.points_per_completion || 10,
    color: initialData?.color || '#FF6B6B',
    icon: initialData?.icon || 'OK',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')
      await onSubmit(formData)
      onCancel()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'fitness',
    'health',
    'learning',
    'productivity',
    'mental wellness',
    'social',
  ]

  return (
    <Card>
      <CardHeader className="px-4 py-4 sm:px-6">
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Habit Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Morning Exercise"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="What's this habit about?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frequency: e.target.value as HabitFormData['frequency'],
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Target Count *
              </label>
              <input
                type="number"
                min="1"
                value={formData.target_count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_count: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Points *
              </label>
              <input
                type="number"
                min="1"
                value={formData.points_per_completion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points_per_completion: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                Color
              </label>

              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="h-16 w-16 cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200"
                />

                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-sm text-gray-500">Selected Color</p>
                  <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2">
                    <span className="font-mono text-sm text-gray-700">
                      {formData.color}
                    </span>
                    <span
                      className="h-6 w-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: formData.color }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                Icon
              </label>

              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="Run"
                  maxLength={4}
                  className="h-16 w-20 rounded-lg border border-gray-300 text-center text-2xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-sm text-gray-500">Preview</p>
                  <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-100 text-2xl text-gray-900">
                    {formData.icon || 'OK'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={loading}
              className="w-full sm:w-auto"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
