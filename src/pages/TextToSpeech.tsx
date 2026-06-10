import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save, Square } from 'lucide-react';
import TextInput from '../components/tts/TextInput';
import VoiceSelect from '../components/tts/VoiceSelect';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { showSuccess, showError } from '../components/ui/Toast';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [saved, setSaved] = useState(false);

  const tts = useTextToSpeech();

  // Set default voice
  useEffect(() => {
    if (tts.voices.length > 0 && !selectedVoiceURI) {
      const bestVoice = tts.voices.find(v => v.name.includes('Natural') || v.name.includes('Online')) || tts.voices[0];
      setSelectedVoiceURI(bestVoice.voiceURI);
    }
  }, [tts.voices, selectedVoiceURI]);

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      showError('Please enter some text');
      return;
    }
    setSaved(false);
    const success = await tts.generateSpeech(text, selectedVoiceURI);
    if (!success && tts.error) {
      showError(tts.error);
    }
  }, [text, selectedVoiceURI, tts]);

  const handleSave = useCallback(async () => {
    const result = await tts.saveToHistory(text, selectedVoiceURI);
    if (result) {
      setSaved(true);
      showSuccess('Saved to history!');
    } else {
      showError('Failed to save. Are you logged in?');
    }
  }, [tts, text, selectedVoiceURI]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-[--text-primary]">Text to Speech</h1>
        <p className="text-sm text-[--text-secondary]">Transform your text into natural-sounding speech (100% Free)</p>
      </motion.div>

      <div className="space-y-6">
        <TextInput value={text} onChange={setText} disabled={tts.isSpeaking} />

        <motion.div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
           <h3 className="text-sm font-semibold text-[--text-primary]">Select Voice</h3>
           <VoiceSelect
             voices={tts.voices}
             selectedURI={selectedVoiceURI}
             onChange={setSelectedVoiceURI}
             disabled={tts.isSpeaking}
           />
        </motion.div>

        <motion.div>
          {tts.isSpeaking ? (
            <motion.button onClick={tts.stopSpeech} className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-semibold text-white bg-rose-500/80 hover:bg-rose-500 transition-all">
              <Square className="w-4 h-4 fill-current" />
              Stop Playing
            </motion.button>
          ) : (
            <motion.button onClick={handleGenerate} disabled={!text.trim() || text.length > 4096} className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-violet-600 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all">
              <Sparkles className="w-4 h-4" />
              Play Speech
            </motion.button>
          )}
        </motion.div>

        <motion.button onClick={handleSave} disabled={saved || !text.trim()} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-[--text-secondary] hover:text-[--text-primary] border border-white/5'}`}>
          <Save className="w-4 h-4" />
          {saved ? 'Saved to History!' : 'Save Text to History'}
        </motion.button>

        {tts.error && <motion.div className="text-xs text-rose-400 bg-rose-500/10 px-4 py-2.5 rounded-xl">{tts.error}</motion.div>}
      </div>
    </div>
  );
}
