import React, { useState, useEffect } from 'react'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { Shuffle, Repeat, Image } from 'lucide-react'

const Player = ({ currentSong, playlist, onNextSong, onPreviousSong }) => {
  const [isShuffleOn, setIsShuffleOn] = useState(false)
  const [repeatMode, setRepeatMode] = useState('off') // 'off', 'all', 'one'

  const toggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn)
  }

  const toggleRepeat = () => {
    setRepeatMode(current => {
      switch (current) {
        case 'off': return 'all'
        case 'all': return 'one'
        case 'one': return 'off'
        default: return 'off'
      }
    })
  }

  const handleClickNext = () => {
    if (isShuffleOn) {
      const nextIndex = Math.floor(Math.random() * playlist.length)
      onNextSong(playlist[nextIndex])
    } else {
      onNextSong()
    }
  }

  const handleClickPrevious = () => {
    if (isShuffleOn) {
      const prevIndex = Math.floor(Math.random() * playlist.length)
      onPreviousSong(playlist[prevIndex])
    } else {
      onPreviousSong()
    }
  }

  const handleEnded = () => {
    if (repeatMode === 'one') {
      // Replay the same song
      const audioElement = document.querySelector('.rhap_main-controls-button.rhap_play-pause-button')
      if (audioElement) {
        audioElement.click()
      }
    } else if (repeatMode === 'all' || isShuffleOn) {
      handleClickNext()
    } else {
      onNextSong()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800">
      <div className="flex justify-between items-center p-2">
        <div className="flex items-center">
          {currentSong?.albums?.artwork_url ? (
            <img src={currentSong.albums.artwork_url} alt={currentSong.title} className="w-16 h-16 object-cover mr-4" />
          ) : (
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center mr-4">
              <Image size={32} className="text-gray-400" />
            </div>
          )}
          <div>
            <p className="text-white font-semibold">{currentSong?.title}</p>
            <p className="text-gray-400">{currentSong?.albums?.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleShuffle}
            className={`focus:outline-none ${isShuffleOn ? 'text-green-500' : 'text-gray-300'}`}
          >
            <Shuffle size={20} />
          </button>
          <button
            onClick={toggleRepeat}
            className={`focus:outline-none ${repeatMode !== 'off' ? 'text-green-500' : 'text-gray-300'}`}
          >
            <Repeat size={20} />
            {repeatMode === 'one' && <span className="text-xs ml-1">1</span>}
          </button>
        </div>
      </div>
      <AudioPlayer
        autoPlay={false}
        src={currentSong?.file_path || ''}
        onPlay={e => console.log("onPlay")}
        onClickNext={handleClickNext}
        onClickPrevious={handleClickPrevious}
        onEnded={handleEnded}
        showSkipControls={true}
        showJumpControls={false}
        // other props here
      />
    </div>
  )
}

export default Player