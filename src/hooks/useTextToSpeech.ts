import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { TTSHistory } from '../types';

export function useTextToSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter to prefer English and Indonesian
      const preferred = availableVoices.filter(v => v.lang.startsWith('en') || v.lang.startsWith('id'));
      if (preferred.length > 0) {
        setVoices(preferred);
      } else {
        setVoices(availableVoices);
      }
    };
    
    loadVoices();
    // Some browsers need this event to load voices
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Keep a reference to prevent garbage collection bugs on Android Chrome
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const generateSpeech = useCallback((text: string, voiceURI: string) => {
    try {
      setError(null);
      if (!text.trim()) throw new Error('Please enter some text');
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance; // Prevent GC on Android
      
      const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'id-ID'; // Fallback language
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        setIsSpeaking(false);
        // "interrupted" is normal if we cancel, but "synthesis-failed" is a bug
        if (e.error !== 'interrupted') {
          setError('Speech generation failed: ' + e.error);
        }
      };
      
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Speech generation failed';
      setError(message);
      setIsSpeaking(false);
      return false;
    }
  }, [voices]);

  const saveToHistory = useCallback(async (text: string, voiceURI: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tts_history')
        .insert({
          user_id: user.id,
          input_text: text,
          voice_model: voiceURI || 'Default Browser Voice',
          audio_url: 'web-speech-api',
        })
        .select()
        .single();

      if (error) throw new Error(`Save failed: ${error.message}`);
      return data as TTSHistory;
    } catch (err) {
      console.error('Failed to save to history:', err);
      return null;
    }
  }, []);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    voices,
    isSpeaking,
    error,
    generateSpeech,
    saveToHistory,
    stopSpeech
  };
}
