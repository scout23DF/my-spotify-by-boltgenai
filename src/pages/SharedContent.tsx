import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Music, Disc, Mic2 } from 'lucide-react'

const SharedContent = () => {
  const { contentType, id } = useParams()
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSharedContent()
  }, [contentType, id])

  const fetchSharedContent = async () => {
    try {
      setLoading(true)
      let data

      switch (contentType) {
        case 'song':
          const { data: songData } = await supabase
            .from('songs')
            .select('*, albums(title, artists(name))')
            .eq('id', id)
            .single()
          data = songData
          break
        case 'album':
          const { data: albumData } = await supabase
            .from('albums')
            .select('*, artists(name), songs(*)')
            .eq('id', id)
            .single()
          data = albumData
          break
        case 'artist':
          const { data: artistData } = await supabase
            .from('artists')
            .select('*, albums(*, songs(*))')
            .eq('id', id)
            .single()
          data = artistData
          break
        default:
          throw new Error('Invalid content type')
      }

      setContent(data)
    } catch (error) {
      console.error('Error fetching shared content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!content) {
    return <div>Content not found</div>
  }

  const renderContent = () => {
    switch (contentType) {
      case 'song':
        return (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Music size={24} className="mr-2 text-blue-500" />
              <h2 className="text-2xl font-semibold">{content.title}</h2>
            </div>
            <p className="text-gray-600">Album: {content.albums.title}</p>
            <p className="text-gray-600">Artist: {content.albums.artists.name}</p>
          </div>
        )
      case 'album':
        return (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Disc size={24} className="mr-2 text-blue-500" />
              <h2 className="text-2xl font-semibold">{content.title}</h2>
            </div>
            <p className="text-gray-600 mb-4">Artist: {content.artists.name}</p>
            <h3 className="text-xl font-semibold mb-2">Songs:</h3>
            <ul className="list-disc pl-6">
              {content.songs.map((song) => (
                <li key={song.id} className="text-gray-700">{song.title}</li>
              ))}
            </ul>
          </div>
        )
      case 'artist':
        return (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Mic2 size={24} className="mr-2 text-blue-500" />
              <h2 className="text-2xl font-semibold">{content.name}</h2>
            </div>
            <h3 className="text-xl font-semibold mb-2">Albums:</h3>
            {content.albums.map((album) => (
              <div key={album.id} className="mb-4">
                <h4 className="text-lg font-semibold">{album.title}</h4>
                <ul className="list-disc pl-6">
                  {album.songs.map((song) => (
                    <li key={song.id} className="text-gray-700">{song.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )
      default:
        return <div>Invalid content type</div>
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Shared Content</h1>
      {renderContent()}
    </div>
  )
}

export default SharedContent