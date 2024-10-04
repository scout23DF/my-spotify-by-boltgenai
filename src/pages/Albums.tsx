import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Image, Share2 } from 'lucide-react'

const Albums = () => {
  const [albums, setAlbums] = useState([])
  const [newAlbum, setNewAlbum] = useState({ title: '', artist_id: '', artwork: null })
  const [artists, setArtists] = useState([])
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    fetchAlbums()
    fetchArtists()
    getUserId()
  }, [])

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)
  }

  const fetchAlbums = async () => {
    const { data, error } = await supabase
      .from('albums')
      .select('*, artists(name)')
      .order('title', { ascending: true })
    if (error) console.error('Error fetching albums:', error)
    else setAlbums(data)
  }

  const fetchArtists = async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('name', { ascending: true })
    if (error) console.error('Error fetching artists:', error)
    else setArtists(data)
  }

  const addAlbum = async () => {
    if (!userId) return

    let artworkUrl = null
    if (newAlbum.artwork) {
      const fileExt = newAlbum.artwork.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('album-artworks')
        .upload(`${userId}/${fileName}`, newAlbum.artwork)

      if (error) {
        console.error('Error uploading file:', error)
        return
      }

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('album-artworks')
        .getPublicUrl(`${userId}/${fileName}`)

      if (urlError) {
        console.error('Error getting public URL:', urlError)
        return
      }

      artworkUrl = publicUrl
    }

    const { data, error } = await supabase
      .from('albums')
      .insert([{ 
        title: newAlbum.title, 
        artist_id: newAlbum.artist_id, 
        artwork_url: artworkUrl, 
        user_id: userId 
      }])
    if (error) console.error('Error adding album:', error)
    else {
      setNewAlbum({ title: '', artist_id: '', artwork: null })
      fetchAlbums()
    }
  }

  const shareAlbum = (album) => {
    const shareUrl = `${window.location.origin}/shared/album/${album.id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!')
    }, (err) => {
      console.error('Could not copy text: ', err)
    })
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Albums</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newAlbum.title}
          onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
          className="p-2 mr-2 text-black"
          placeholder="New album title"
        />
        <select
          value={newAlbum.artist_id}
          onChange={(e) => setNewAlbum({ ...newAlbum, artist_id: e.target.value })}
          className="p-2 mr-2 text-black"
        >
          <option value="">Select an artist</option>
          {artists.map((artist) => (
            <option key={artist.id} value={artist.id}>{artist.name}</option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewAlbum({ ...newAlbum, artwork: e.target.files[0] })}
          className="p-2 mr-2"
        />
        <button
          onClick={addAlbum}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Add Album
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {albums.map((album) => (
          <div key={album.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {album.artwork_url ? (
              <img src={album.artwork_url} alt={album.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <Image size={64} className="text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{album.title}</h2>
              <p className="text-gray-600">{album.artists.name}</p>
              <button
                onClick={() => shareAlbum(album)}
                className="mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded flex items-center"
              >
                <Share2 size={16} className="mr-1" /> Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Albums