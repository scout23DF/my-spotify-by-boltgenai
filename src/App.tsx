import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { supabase, setupDatabase } from './supabaseClient'
import { Session } from '@supabase/supabase-js'
import Sidebar from './components/Sidebar'
import Player from './components/Player'
import Search from './components/Search'
import Home from './pages/Home'
import Artists from './pages/Artists'
import Albums from './pages/Albums'
import Songs from './pages/Songs'
import Auth from './pages/Auth'
import UserProfile from './pages/UserProfile'
import SharedContent from './pages/SharedContent'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [currentSong, setCurrentSong] = useState(null)
  const [playlist, setPlaylist] = useState([])
  const [isDbSetup, setIsDbSetup] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        setupDatabaseAndTables()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setupDatabaseAndTables()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function setupDatabaseAndTables() {
    if (!isDbSetup) {
      try {
        await setupDatabase()
        setIsDbSetup(true)
      } catch (error) {
        console.error('Failed to set up database:', error)
      }
    }
  }

  const handlePlaySong = (song, songList) => {
    setCurrentSong(song)
    setPlaylist(songList)
  }

  const handleNextSong = () => {
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % playlist.length
    setCurrentSong(playlist[nextIndex])
  }

  const handlePreviousSong = () => {
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id)
    const previousIndex = (currentIndex - 1 + playlist.length) % playlist.length
    setCurrentSong(playlist[previousIndex])
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {session ? (
          <>
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              <Search onPlaySong={handlePlaySong} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/artists" element={<Artists />} />
                <Route path="/albums" element={<Albums />} />
                <Route path="/songs" element={<Songs onPlaySong={handlePlaySong} />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/shared/:contentType/:id" element={<SharedContent />} />
              </Routes>
            </main>
            {currentSong && (
              <Player
                currentSong={currentSong}
                playlist={playlist}
                onNextSong={handleNextSong}
                onPreviousSong={handlePreviousSong}
              />
            )}
          </>
        ) : (
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  )
}

export default App