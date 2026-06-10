import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { STTHistory, TTSHistory, HistoryType } from '../types';

interface HistoryState {
  sttHistory: STTHistory[];
  ttsHistory: TTSHistory[];
  isLoading: boolean;
  error: string | null;
}

interface HistoryReturn extends HistoryState {
  fetchHistory: (type?: HistoryType) => Promise<void>;
  deleteSTTItem: (id: string, audioUrl?: string) => Promise<boolean>;
  deleteTTSItem: (id: string) => Promise<boolean>;
  searchHistory: (query: string, type?: HistoryType) => void;
  filteredSTT: STTHistory[];
  filteredTTS: TTSHistory[];
}

export function useHistory(): HistoryReturn {
  const [state, setState] = useState<HistoryState>({
    sttHistory: [],
    ttsHistory: [],
    isLoading: false,
    error: null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<HistoryType>('all');

  const fetchHistory = useCallback(async (type: HistoryType = 'all') => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let sttData: STTHistory[] = [];
      let ttsData: TTSHistory[] = [];

      if (type === 'all' || type === 'stt') {
        const { data, error } = await supabase
          .from('stt_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        sttData = (data || []) as STTHistory[];
      }

      if (type === 'all' || type === 'tts') {
        const { data, error } = await supabase
          .from('tts_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        ttsData = (data || []) as TTSHistory[];
      }

      setState({
        sttHistory: type === 'tts' ? state.sttHistory : sttData,
        ttsHistory: type === 'stt' ? state.ttsHistory : ttsData,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch history';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, [state.sttHistory, state.ttsHistory]);

  const deleteSTTItem = useCallback(async (id: string, audioUrl?: string): Promise<boolean> => {
    try {
      if (audioUrl) {
        try {
          const urlObj = new URL(audioUrl);
          const pathParts = urlObj.pathname.split('/audio-files/');
          if (pathParts.length > 1) {
            const storagePath = decodeURIComponent(pathParts[1]);
            const { error: storageError } = await supabase.storage.from('audio-files').remove([storagePath]);
            if (storageError) console.error('Failed to delete storage file:', storageError);
          }
        } catch (e) {
          console.error('Failed to parse or delete audio file:', e);
        }
      }

      const { error } = await supabase
        .from('stt_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        sttHistory: prev.sttHistory.filter((item) => item.id !== id),
      }));

      return true;
    } catch (err) {
      console.error('Failed to delete STT item:', err);
      return false;
    }
  }, []);

  const deleteTTSItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tts_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        ttsHistory: prev.ttsHistory.filter((item) => item.id !== id),
      }));

      return true;
    } catch (err) {
      console.error('Failed to delete TTS item:', err);
      return false;
    }
  }, []);

  const searchHistory = useCallback((query: string, type?: HistoryType) => {
    setSearchQuery(query.toLowerCase());
    if (type) setFilterType(type);
  }, []);

  // Filtered results based on search
  const filteredSTT = state.sttHistory.filter((item) => {
    if (filterType === 'tts') return false;
    if (!searchQuery) return true;
    return (
      item.transcription_text.toLowerCase().includes(searchQuery) ||
      item.file_name?.toLowerCase().includes(searchQuery)
    );
  });

  const filteredTTS = state.ttsHistory.filter((item) => {
    if (filterType === 'stt') return false;
    if (!searchQuery) return true;
    return (
      item.input_text.toLowerCase().includes(searchQuery) ||
      item.voice_model.toLowerCase().includes(searchQuery)
    );
  });

  // Fetch on mount
  useEffect(() => {
    fetchHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    fetchHistory,
    deleteSTTItem,
    deleteTTSItem,
    searchHistory,
    filteredSTT,
    filteredTTS,
  };
}
