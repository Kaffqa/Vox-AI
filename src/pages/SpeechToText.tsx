import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Upload, Save, RotateCcw } from 'lucide-react';
import MicrophoneButton from '../components/stt/MicrophoneButton';
import AudioWaveform from '../components/stt/AudioWaveform';
import FileUploader from '../components/stt/FileUploader';
import TranscriptionEditor from '../components/stt/TranscriptionEditor';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useTranscription } from '../hooks/useTranscription';
import { showSuccess, showError } from '../components/ui/Toast';

type InputMode = 'record' | 'upload';

export default function SpeechToText() {
  const [mode, setMode] = useState<InputMode>('record');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);

  const recorder = useAudioRecorder();
  const transcription = useTranscription();

  const handleToggleRecording = useCallback(async () => {
    if (recorder.isRecording) {
      const blob = await recorder.stopRecording();
      if (blob) {
        const text = await transcription.transcribeAudio(blob);
        if (text) showSuccess('Transcription complete!');
      }
    } else {
      transcription.clearTranscription();
      setSaved(false);
      recorder.startRecording();
    }
  }, [recorder, transcription]);

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadedFile(file);
    transcription.clearTranscription();
    setSaved(false);

    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    const text = await transcription.transcribeAudio(blob, file.name);
    if (text) showSuccess('Transcription complete!');
  }, [transcription]);

  const handleSave = useCallback(async () => {
    if (!transcription.transcription) return;

    const audioBlob = recorder.audioBlob ||
      (uploadedFile ? new Blob([await uploadedFile.arrayBuffer()], { type: uploadedFile.type }) : null);

    if (!audioBlob) {
      showError('No audio to save');
      return;
    }

    const result = await transcription.saveToHistory(
      audioBlob,
      transcription.transcription,
      uploadedFile?.name
    );

    if (result) {
      setSaved(true);
      showSuccess('Saved to history!');
    } else {
      showError('Failed to save. Are you logged in?');
    }
  }, [transcription, recorder.audioBlob, uploadedFile]);

  const handleReset = useCallback(() => {
    recorder.resetRecording();
    transcription.clearTranscription();
    setUploadedFile(null);
    setSaved(false);
  }, [recorder, transcription]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-[--text-primary]">
          Speech to Text
        </h1>
        <p className="text-sm text-[--text-secondary]">
          Record your voice or upload an audio file for AI-powered transcription
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Input controls */}
        <motion.div
          className="rounded-2xl overflow-hidden h-full flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Header with Mode Toggle */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
            <h3 className="text-sm font-semibold text-[--text-primary]">Audio Input</h3>
            <div
              className="inline-flex rounded-lg p-0.5"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <button
                onClick={() => setMode('record')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300
                  ${mode === 'record'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white border border-cyan-500/30 shadow-sm'
                    : 'text-[--text-secondary] hover:text-[--text-primary] border border-transparent'
                  }`}
              >
                <Mic className="w-3.5 h-3.5" /> Record
              </button>
              <button
                onClick={() => setMode('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300
                  ${mode === 'upload'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white border border-cyan-500/30 shadow-sm'
                    : 'text-[--text-secondary] hover:text-[--text-primary] border border-transparent'
                  }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
            </div>
          </div>

          {/* Input area */}
          <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center min-h-0">
            <AnimatePresence mode="wait">
              {mode === 'record' ? (
                <motion.div
                  key="record"
                  className="flex flex-col items-center gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Duration display */}
                  {(recorder.isRecording || recorder.duration > 0) && (
                    <motion.div
                      className="text-3xl font-mono font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {formatDuration(recorder.duration)}
                    </motion.div>
                  )}

                  {/* Waveform */}
                  <AudioWaveform
                    audioLevel={recorder.audioLevel}
                    isActive={recorder.isRecording}
                  />

                  {/* Microphone button */}
                  <div className="py-4">
                    <MicrophoneButton
                      isRecording={recorder.isRecording}
                      isProcessing={transcription.isTranscribing}
                      audioLevel={recorder.audioLevel}
                      onClick={handleToggleRecording}
                    />
                  </div>

                  {/* Error */}
                  {recorder.error && (
                    <motion.p
                      className="text-xs text-rose-400 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {recorder.error}
                    </motion.p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <FileUploader
                    onFileSelect={handleFileSelect}
                    disabled={transcription.isTranscribing}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer with Action buttons */}
          {transcription.transcription && (
            <div className="px-4 py-3 border-t border-white/5 shrink-0">
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.button
                  onClick={handleSave}
                  disabled={saved}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium
                    transition-all ${saved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white border border-cyan-500/30 hover:from-cyan-500/30 hover:to-violet-500/30'
                    }`}
                  whileHover={!saved ? { scale: 1.02 } : {}}
                  whileTap={!saved ? { scale: 0.98 } : {}}
                >
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save to History'}
                </motion.button>
                <motion.button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    bg-white/5 text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/10 border border-white/5 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </motion.button>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Right: Transcription result */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full flex flex-col"
        >
          <div className="flex-1 h-full min-h-0">
            <TranscriptionEditor
              text={transcription.transcription}
              isLoading={transcription.isTranscribing}
              onTextChange={transcription.setTranscription}
            />
          </div>

          {transcription.error && (
            <motion.div
              className="mt-3 text-xs text-rose-400 bg-rose-500/10 px-4 py-2.5 rounded-xl"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {transcription.error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
