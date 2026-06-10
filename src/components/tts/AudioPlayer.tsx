import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string | null;
  isLoading?: boolean;
  onDownload?: () => void;
}

export default function AudioPlayer({ audioUrl, isLoading, onDownload }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('ended', () => { setIsPlaying(false); setCurrentTime(0); });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isLoading) {
    return (
      <motion.div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-5 h-5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
          <span className="text-sm text-violet-400 font-medium">Generating speech...</span>
        </div>
        {/* Skeleton waveform */}
        <div className="flex items-center gap-0.5 justify-center mt-4">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-white/10"
              animate={{
                height: [8, 20 + Math.random() * 20, 8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.03,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!audioUrl) return null;

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-[--text-primary]">Audio Output</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Main controls */}
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <motion.button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600
              flex items-center justify-center flex-shrink-0
              shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white fill-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            )}
          </motion.button>

          {/* Progress bar */}
          <div className="flex-1 space-y-1.5">
            <div
              ref={progressRef}
              className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
              {/* Seek handle */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg
                  opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 7px)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[--text-muted]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleMute} className="text-[--text-secondary] hover:text-[--text-primary] transition-colors">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 accent-cyan-400 bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
            />
          </div>
        </div>

        {/* Download button */}
        {onDownload && (
          <motion.button
            onClick={onDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10
              text-sm font-medium text-[--text-secondary] hover:text-[--text-primary] transition-all"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Download className="w-4 h-4" />
            Download MP3
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
