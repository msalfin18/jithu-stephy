
import { useState, useRef, useEffect } from 'react';
import { Music, Pause } from 'lucide-react';

const playlist = [
  '/music/wedding-song-1.mp3',
  '/music/wedding-song-2.mp3',
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const audioRef = useRef(null);
  const trackIndexRef = useRef(0);

  useEffect(() => {
    trackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    const audio = new Audio();

    audio.preload = 'auto';
    audio.src = playlist[0];

    audioRef.current = audio;

    const handleEnded = () => {
      const nextIndex =
        (trackIndexRef.current + 1) % playlist.length;

      trackIndexRef.current = nextIndex;
      setCurrentTrackIndex(nextIndex);

      audio.src = playlist[nextIndex];
      audio.load();

      audio.play().catch((err) => {
        console.error('Next track playback failed:', {
          track: playlist[nextIndex],
          error: err,
        });
      });
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      console.error('Audio file loading failed:', {
        track: playlist[trackIndexRef.current],
        url: audio.currentSrc,
        errorCode: audio.error?.code,
        errorMessage: audio.error?.message,
        networkState: audio.networkState,
        readyState: audio.readyState,
      });
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);

      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch (err) {
      console.error('Audio playback error:', {
        track: playlist[trackIndexRef.current],
        url: audio.currentSrc,
        error: err,
      });
    }
  };

  return (
    <button
      className="music-player"
      onClick={togglePlay}
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
      title={
        isPlaying
          ? 'Playing Wedding Music (Loop Mode)'
          : 'Play Wedding Music'
      }
    >
      {isPlaying ? (
        <Pause className="music-icon" size={18} />
      ) : (
        <Music className="music-icon" size={18} />
      )}

      <div className="music-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`music-bar ${isPlaying ? 'playing' : 'paused'
              }`}
          />
        ))}
      </div>

      <span className="music-label">
        {isPlaying ? 'Playing' : 'Play'}
      </span>
    </button>
  );
}
