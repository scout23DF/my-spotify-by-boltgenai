import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Music, Disc, Mic2 } from 'lucide-react'

const Search = ({ onPlaySong }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState({ songs: [], albums: [], artists: [] })

  useEffect(() => {
    if (searchTerm) {
      performSearch()
    } else {
      setSearchResults({ songs: [], albums: [], artists: [] })
    }
  }, [searchTerm])

  const performSearch = async () => {
    const songResults = await supabase
      .from('songs')
      .select('*, albums(title)')
      .ilike('title', `%${searchTerm}%`)
      .limit(5)

    const albumResults = await supabase
      .from('albums')
      .select('*')
      .ilike('title', `%${searchTerm}%`)
      .limit(5)

    const artistResults = await supabase
      .from('artists')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .limit(5)

    setSearchResults({
      songs: songResults.data || [],
      albums: albumResults.data || [],
      artists: artistResults.data || [],
    })
  }

  return (
    <div className="mb-8">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for songs, albums, or artists"
        className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {(searchResults.songs.length > 0 || searchResults.albums.length > 0 || searchResults.artists.length > 0) && (
        <div className="mt-4 bg-white rounded-md shadow-md p-4">
          {searchResults.songs.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Songs</h3>
              <ul>
                {searchResults.songs.map((song) => (
                  <li key={song.id} className="flex items-center mb-2">
                    <Music className="mr-2" size={16} />
                    <button
                      onClick={() => onPlaySong(song, searchResults.songs)}
                      className="text-blue-500 hover:underline"
                    >
                      {song.title} - {song.albums.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {searchResults.albums.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Albums</h3>
              <ul>
                {searchResults.albums.map((album) => (
                  <li key={album.id} className="flex items-center mb-2">
                    <Disc className="mr-2" size={16} />
                    {album.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {searchResults.artists.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Artists</h3>
              <ul>
                {searchResults.artists.map((artist) => (
                  <li key={artist.id} className="flex items-center mb-2">
                    <Mic2 className="mr-2" size={16} />
                    {artist.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Search