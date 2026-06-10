// ============================================
// VoxAI — Core Type Definitions
// ============================================

/** Authenticated user profile */
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

/** Speech-to-Text transcription record */
export interface STTHistory {
  id: string;
  user_id: string;
  audio_url: string;
  transcription_text: string;
  file_name?: string;
  file_size?: number;
  duration_seconds?: number;
  created_at: string;
}

/** Text-to-Speech synthesis record */
export interface TTSHistory {
  id: string;
  user_id: string;
  input_text: string;
  voice_model: VoiceModel;
  audio_url: string;
  created_at: string;
}

/** Available TTS voice identifiers */
export type VoiceModel = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

/** Voice option for the UI selector */
export interface VoiceOption {
  id: VoiceModel;
  name: string;
  description: string;
  icon: string;
}

/** Filter for history view */
export type HistoryType = 'stt' | 'tts' | 'all';

/** Navigation item for sidebar / mobile nav */
export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

/** Toast notification severity */
export type ToastType = 'success' | 'error' | 'info';

/** Audio recording state machine */
export type RecordingState = 'idle' | 'recording' | 'paused' | 'processing';

/** Generic async operation state */
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
