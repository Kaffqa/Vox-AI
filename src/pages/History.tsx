import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Play, FileText, Volume2, Clock, Filter, Mic, ChevronDown } from 'lucide-react';
import { useHistory } from '../hooks/useHistory';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { showSuccess, showError } from '../components/ui/Toast';
import type { HistoryType, STTHistory, TTSHistory } from '../types';

export default function History() {
  const [activeFilter, setActiveFilter] = useState<HistoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const history = useHistory();
  const player = useAudioPlayer();

  useEffect(() => {
    history.fetchHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = useCallback(async (id: string, type: 'stt' | 'tts') => {
    const success = type === 'stt'
      ? await history.deleteSTTItem(id)
      : await history.deleteTTSItem(id);

    if (success) {
      showSuccess('Item deleted');
    } else {
      showError('Failed to delete');
    }
  }, [history]);

  const handlePlay = useCallback((url: string, id: string, text?: string) => {
    if (url === 'web-speech-api' && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      return;
    }

    if (playingId === id) {
      player.toggle();
    } else {
      player.loadAudio(url);
      setTimeout(() => player.play(), 100);
      setPlayingId(id);
    }
  }, [player, playingId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const truncateText = (text: string, max: number = 120) => {
    if (text.length <= max) return text;
    return text.slice(0, max) + '...';
  };

  // Combine and sort all history
  const allItems: (STTHistory & { _type: 'stt' } | TTSHistory & { _type: 'tts' })[] = [];

  if (activeFilter === 'all' || activeFilter === 'stt') {
    history.filteredSTT
      .filter((item) => !searchQuery || item.transcription_text.toLowerCase().includes(searchQuery.toLowerCase()))
      .forEach((item) => allItems.push({ ...item, _type: 'stt' }));
  }
  if (activeFilter === 'all' || activeFilter === 'tts') {
    history.filteredTTS
      .filter((item) => !searchQuery || item.input_text.toLowerCase().includes(searchQuery.toLowerCase()))
      .forEach((item) => allItems.push({ ...item, _type: 'tts' }));
  }

  allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-[--text-primary]">History</h1>
        <p className="text-sm text-[--text-secondary]">
          Your past transcriptions and speech generations
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-muted]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-white/[0.08]
              text-[--text-primary] placeholder:text-[--text-muted] outline-none
              focus:border-cyan-500/30 transition-colors"
          />
        </div>

        {/* Filter buttons */}
        <div
          className="inline-flex rounded-xl p-1 self-start"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {(['all', 'stt', 'tts'] as HistoryType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${activeFilter === filter
                  ? 'bg-white/10 text-white'
                  : 'text-[--text-secondary] hover:text-[--text-primary]'
                }`}
            >
              {filter === 'all' && <Filter className="w-3 h-3" />}
              {filter === 'stt' && <Mic className="w-3 h-3" />}
              {filter === 'tts' && <Volume2 className="w-3 h-3" />}
              {filter === 'all' ? 'All' : filter.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>

      {/* History list */}
      {history.isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="rounded-2xl p-4 h-24"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="space-y-2.5">
                <div className="h-3 w-20 rounded-full bg-white/5 animate-pulse" />
                <div className="h-3 w-full rounded-full bg-white/5 animate-pulse" />
                <div className="h-3 w-3/4 rounded-full bg-white/5 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 gap-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <Clock className="w-8 h-8 text-[--text-muted]" />
          </div>
          <div className="text-center">
            <p className="text-[--text-secondary] font-medium">No history yet</p>
            <p className="text-xs text-[--text-muted] mt-1">
              Start transcribing or generating speech to see your history here
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {allItems.map((item, index) => {
              const isSTT = item._type === 'stt';
              const isExpanded = expandedId === item.id;
              const text = isSTT ? (item as STTHistory).transcription_text : (item as TTSHistory).input_text;

              return (
                <motion.div
                  key={item.id}
                  className="rounded-2xl overflow-hidden group"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ borderColor: 'rgba(255,255,255,0.12)' }}
                >
                  <div className="p-4">
                    {/* Top row: type badge + date + actions */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase
                          ${isSTT
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                          }`}
                        >
                          {isSTT ? <Mic className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                          {isSTT ? 'STT' : 'TTS'}
                        </span>
                        {!isSTT && (
                          <span className="text-[10px] text-[--text-muted] px-1.5 py-0.5 rounded bg-white/5">
                            {(item as TTSHistory).voice_model}
                          </span>
                        )}
                        <span className="text-[10px] text-[--text-muted]">
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          onClick={() => handlePlay(item.audio_url, item.id, text)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-[--text-secondary] hover:text-cyan-400 transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Play audio"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(item.id, item._type)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[--text-secondary] hover:text-rose-400 transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Text preview */}
                    <p className="text-sm text-[--text-primary] leading-relaxed">
                      {isExpanded ? text : truncateText(text)}
                    </p>

                    {/* Expand toggle */}
                    {text.length > 120 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="flex items-center gap-1 mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
