import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const Artists = () => {
  const [artists, setArtists] = useState([])
  const [newArtist, setNewArtist] = useState('')
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    fetchArtists()
    getUserId()
  }, [])

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)
  }

  const fetchArtists = async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('name', { ascending: true })
    if (error) console.error('Error fetching artists:', error)
    else setArtists(data)
  }

  const addArtist = async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('artists')
      .insert([{ name: newArtist, user_id: userId }])
    if (error) console.error('Error adding artist:', error)
    else {
      setNewArtist('')
      fetchArtists()
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Artists</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newArtist}
          onChange={(e) => setNewArtist(e.target.value)}
          className="p-2 mr-2 text-black"
          placeholder="New artist name"
        />
        <button
          onClick={addArtist}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Add Artist
        </button>
      </div>
      <ul>
        {artists.map((artist) => (
          <li key={artist.id} className="text-xl mb-2">{artist.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default Artists