import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { User, Settings } from 'lucide-react'

const UserProfile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            await createUserProfile(user.id)
          } else {
            console.error('Error fetching user profile:', error)
            throw error
          }
        } else if (data) {
          setUsername(data.username || '')
          setBio(data.bio || '')
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      alert('Error fetching user profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ id: userId, username: '', bio: '' })
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        throw error
      }

      setUsername('')
      setBio('')
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      alert('Error creating user profile. Please try again.')
    }
  }

  const handleSaveProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ id: user.id, username, bio })

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error in handleSaveProfile:', error)
      alert('Error updating profile. Please try again.')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">User Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center mb-6">
          <User size={64} className="text-gray-400 mr-4" />
          <div>
            <h2 className="text-2xl font-semibold">{username || user.email}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="ml-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            <Settings size={20} />
          </button>
        </div>
        {isEditing ? (
          <div>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="bio" className="block text-gray-700 font-bold mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                rows={4}
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Save Profile
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-2">Bio</h3>
            <p className="text-gray-700">{bio || 'No bio yet.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile