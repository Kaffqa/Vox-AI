import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { STTHistory } from '../types';

interface TranscriptionState {
  isTranscribing: boolean;
  transcription: string | null;
  error: string | null;
}

interface TranscriptionReturn extends TranscriptionState {
  transcribeAudio: (audioBlob: Blob, fileName?: string) => Promise<string | null>;
  setTranscription: (text: string) => void;
  clearTranscription: () => void;
  saveToHistory: (audioBlob: Blob, transcriptionText: string, fileName?: string) => Promise<STTHistory | null>;
}

export function useTranscription(): TranscriptionReturn {
  const [state, setState] = useState<TranscriptionState>({
    isTranscribing: false,
    transcription: null,
    error: null,
  });

  const transcribeAudio = useCallback(async (audioBlob: Blob, fileName?: string): Promise<string | null> => {
    try {
      setState({ isTranscribing: true, transcription: null, error: null });

      // Create FormData with the audio file
      const formData = new FormData();
      const extension = audioBlob.type.includes('webm') ? 'webm' : 
                        audioBlob.type.includes('mp4') ? 'mp4' : 
                        audioBlob.type.includes('wav') ? 'wav' : 'webm';
      const file = new File([audioBlob], fileName || `recording.${extension}`, { type: audioBlob.type });
      formData.append('file', file);

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('transcribe', {
        body: formData,
      });

      if (error) throw new Error(error.message || 'Transcription failed');
      if (!data?.text) throw new Error('No transcription returned');

      const transcriptionText = data.text;
      setState({ isTranscribing: false, transcription: transcriptionText, error: null });

      return transcriptionText;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription failed';
      setState({ isTranscribing: false, transcription: null, error: message });
      return null;
    }
  }, []);

  const saveToHistory = useCallback(async (
    audioBlob: Blob, 
    transcriptionText: string, 
    fileName?: string
  ): Promise<STTHistory | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload audio to Supabase Storage
      const extension = audioBlob.type.includes('webm') ? 'webm' : 
                        audioBlob.type.includes('mp4') ? 'mp4' : 'wav';
      const storagePath = `${user.id}/${Date.now()}.${extension}`;
      
      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(storagePath, audioBlob, {
          contentType: audioBlob.type,
          upsert: false,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-files')
        .getPublicUrl(storagePath);

      // Save to database
      const { data, error } = await supabase
        .from('stt_history')
        .insert({
          user_id: user.id,
          audio_url: publicUrl,
          transcription_text: transcriptionText,
          file_name: fileName || `recording.${extension}`,
          file_size: audioBlob.size,
        })
        .select()
        .single();

      if (error) throw new Error(`Save failed: ${error.message}`);
      return data as STTHistory;
    } catch (err) {
      console.error('Failed to save to history:', err);
      return null;
    }
  }, []);

  const setTranscription = useCallback((text: string) => {
    setState((prev) => ({ ...prev, transcription: text }));
  }, []);

  const clearTranscription = useCallback(() => {
    setState({ isTranscribing: false, transcription: null, error: null });
  }, []);

  return {
    ...state,
    transcribeAudio,
    setTranscription,
    clearTranscription,
    saveToHistory,
  };
}
