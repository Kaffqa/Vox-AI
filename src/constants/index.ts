import type { NavItem } from '../types';

// Re-export everything from lib/constants for backward compatibility
export { APP_NAME, MAX_AUDIO_SIZE, MAX_TTS_CHARS, SUPPORTED_AUDIO_FORMATS, SUPPORTED_AUDIO_MIME_TYPES, VOICE_OPTIONS } from '../lib/constants';

export const APP_TAGLINE = 'Transform voice to text and text to voice with AI precision';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
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
];
