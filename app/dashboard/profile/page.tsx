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

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        avatar_url: user.avatar_url || '',
      })
    }
  }, [user])

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">👤 Profile</h1>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{user.email}</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            ) : (
              <p className="font-medium text-gray-900">
                {user.username || 'Not set'}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            {editing ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setEditing(true)}
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
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
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
