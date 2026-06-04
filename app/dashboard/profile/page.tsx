'use client'

import { Button } from '@/components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const { user, updateProfile } = useUser(userId)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    avatar_url: '',
  })

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }

    getCurrentUser()
  }, [])

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          Loading profile...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">👤 Profile</h1>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="break-all font-medium text-gray-900">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Username</p>
            {editing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="font-medium text-gray-900">
                {user.username || 'Not set'}
              </p>
            )}
          </div>

          <div className="flex items-center pt-4 sm:justify-between">
            {editing ? (
              <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="ghost"
                  onClick={() => setEditing(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  className="w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setFormData({
                    username: user.username || '',
                    avatar_url: user.avatar_url || '',
                  })
                  setEditing(true)
                }}
                className="w-full sm:w-auto"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {user.total_points}
              </p>
              <p className="text-sm text-gray-500">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {user.current_level}
              </p>
              <p className="text-sm text-gray-500">Current Level</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">Joined</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
