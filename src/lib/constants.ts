// ============================================
// VoxAI — Application Constants
// ============================================

import type { VoiceOption, NavItem } from '../types';

/** Application name */
export const APP_NAME = 'VoxAI';

/** Maximum upload size for audio files: 10 MB */
export const MAX_AUDIO_SIZE = 10 * 1024 * 1024;

/** Maximum character count for TTS input */
export const MAX_TTS_CHARS = 4096;

/** Supported audio file extensions for STT upload */
export const SUPPORTED_AUDIO_FORMATS = [
  '.mp3',
  '.wav',
  '.m4a',
  '.webm',
  '.mp4',
  '.mpeg',
  '.mpga',
] as const;

/** MIME types corresponding to supported formats */
export const SUPPORTED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/x-m4a',
  'audio/webm',
  'audio/mp4',
  'video/mp4',
  'audio/mpga',
] as const;

/** Available TTS voice models */
export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'alloy',
    name: 'Alloy',
    description: 'Neutral and balanced — great for general use',
    icon: '⚙️',
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Warm and smooth — perfect for narration',
    icon: '🔊',
  },
  {
    id: 'fable',
    name: 'Fable',
    description: 'Expressive and dynamic — ideal for storytelling',
    icon: '📖',
  },
  {
    id: 'onyx',
    name: 'Onyx',
    description: 'Deep and authoritative — suited for presentations',
    icon: '🎙️',
  },
  {
    id: 'nova',
    name: 'Nova',
    description: 'Bright and energetic — great for casual content',
    icon: '✨',
  },
  {
    id: 'shimmer',
    name: 'Shimmer',
    description: 'Soft and gentle — ideal for meditative content',
    icon: '🌊',
  },
] as const;

/** Main navigation items */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Speech to Text',
    path: '/speech-to-text',
    icon: 'Mic',
  },
  {
    label: 'Text to Speech',
    path: '/text-to-speech',
    icon: 'Volume2',
  },
  {
    label: 'History',
    path: '/history',
    icon: 'History',
  },
] as const;
