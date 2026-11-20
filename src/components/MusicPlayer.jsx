import { useState, useRef, useEffect } from 'react';
import { Music, Pause } from 'lucide-react';

const playlist = [
  '/music/videoplayback.mp3',
  '/music/videoplayback (1).mp3',
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);
  const trackIndexRef = useRef(0);

  // Keep trackIndexRef in sync with currentTrackIndex
  useEffect(() => {
    trackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = encodeURI(playlist[0]);
    audioRef.current = audio;

    // Continuous loop mode: when the current track finishes, automatically play the next
    // track in the playlist, or loop back to the first track when reaching the end.
    const handleEnded = () => {
      const nextIndex = (trackIndexRef.current + 1) % playlist.length;
      trackIndexRef.current = nextIndex;
      setCurrentTrackIndex(nextIndex);
      audio.src = encodeURI(playlist[nextIndex]);
      audio.load();
      audio.play().catch((err) => {
        console.warn('Continuous loop playback error:', err);
      });
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (!audio.src || audio.src === window.location.href) {
        audio.src = encodeURI(playlist[trackIndexRef.current]);
      }
      audio.play().catch((err) => {
        console.warn('Audio playback error:', err);
      });
    }
  };

  return (
    <button
      className="music-player"
      onClick={togglePlay}
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
      title={isPlaying ? 'Playing Wedding Music (Loop Mode)' : 'Play Wedding Music'}
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
            className={`music-bar ${isPlaying ? 'playing' : 'paused'}`}
          />
        ))}
      </div>
      <span className="music-label">{isPlaying ? 'Playing' : 'Play'}</span>
    </button>
  );
}
