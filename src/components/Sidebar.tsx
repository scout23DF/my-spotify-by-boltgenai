import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Mic2, Disc, Music, LogOut, User } from 'lucide-react'
import { supabase } from '../supabaseClient'

const Sidebar = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error logging out:', error)
  }

  return (
    <nav className="w-64 bg-gray-800 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Spotify Clone</h1>
      </div>
      <ul>
        <li className="mb-4">
          <Link to="/" className="flex items-center text-gray-300 hover:text-white">
            <Home className="mr-4" />
            Home
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/artists" className="flex items-center text-gray-300 hover:text-white">
            <Mic2 className="mr-4" />
            Artists
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/albums" className="flex items-center text-gray-300 hover:text-white">
            <Disc className="mr-4" />
            Albums
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/songs" className="flex items-center text-gray-300 hover:text-white">
            <Music className="mr-4" />
            Songs
          </Link>
        </li>
        <li className="mb-4">
          <Link to="/profile" className="flex items-center text-gray-300 hover:text-white">
            <User className="mr-4" />
            Profile
          </Link>
        </li>
      </ul>
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center text-gray-300 hover:text-white"
        >
          <LogOut className="mr-4" />
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Sidebar