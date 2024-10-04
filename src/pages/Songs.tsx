import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Share2 } from 'lucide-react'

const Songs = ({ onPlaySong }) => {
  const [songs, setSongs] = useState([])
  const [newSong, setNewSong] = useState({ title: '', album_id: '', file: null })
  const [albums, setAlbums] = useState([])
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    fetchSongs()
    fetchAlbums()
    getUserId()
  }, [])

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)
  }

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*, albums(title)')
      .order('title', { ascending: true })
    if (error) console.error('Error fetching songs:', error)
    else setSongs(data)
  }

  const fetchAlbums = async () => {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('title', { ascending: true })
    if (error) console.error('Error fetching albums:', error)
    else setAlbums(data)
  }

  const addSong = async () => {
    if (!userId || !newSong.file) return

    const fileExt = newSong.file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('songs')
      .upload(`${userId}/${fileName}`, newSong.file)

    if (error) {
      console.error('Error uploading file:', error)
      return
    }

    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('songs')
      .getPublicUrl(`${userId}/${fileName}`)

    if (urlError) {
      console.error('Error getting public URL:', urlError)
      return
    }

    const { data: songData, error: songError } = await supabase
      .from('songs')
      .insert([
        { 
          title: newSong.title, 
          album_id: newSong.album_id,
          file_path: publicUrl,
          user_id: userId
        }
      ])

    if (songError) console.error('Error adding song:', songError)
    else {
      setNewSong({ title: '', album_id: '', file: null })
      fetchSongs()
    }
  }

  const playSong = (song) => {
    onPlaySong(song, songs)
  }

  const shareSong = (song) => {
    const shareUrl = `${window.location.origin}/shared/song/${song.id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!')
    }, (err) => {
      console.error('Could not copy text: ', err)
    })
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">Songs</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newSong.title}
          onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
          className="p-2 mr-2 text-black"
          placeholder="New song title"
        />
        <select
          value={newSong.album_id}
          onChange={(e) => setNewSong({ ...newSong, album_id: e.target.value })}
          className="p-2 mr-2 text-black"
        >
          <option value="">Select an album</option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>{album.title}</option>
          ))}
        </select>
        <input
          type="file"
          accept=".mp3"
          onChange={(e) => setNewSong({ ...newSong, file: e.target.files[0] })}
          className="p-2 mr-2"
        />
        <button
          onClick={addSong}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Add Song
        </button>
      </div>
      <ul>
        {songs.map((song) => (
          <li key={song.id} className="text-xl mb-2 flex items-center">
            <button 
              onClick={() => playSong(song)}
              className="mr-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
            >
              Play
            </button>
            {song.title} - {song.albums.title}
            <button
              onClick={() => shareSong(song)}
              className="ml-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded"
            >
              <Share2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Songs