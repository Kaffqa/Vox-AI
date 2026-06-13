import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Upload, Save, RotateCcw, Type } from "lucide-react";
import MicrophoneButton from "../components/stt/MicrophoneButton";
import AudioWaveform from "../components/stt/AudioWaveform";
import FileUploader from "../components/stt/FileUploader";
import TranscriptionEditor from "../components/stt/TranscriptionEditor";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useTranscription } from "../hooks/useTranscription";
import { showSuccess, showError } from "../components/ui/Toast";
import AIChatPanel from "../components/stt/AIChatPanel";
import { Sparkles, X } from "lucide-react";

type InputMode = "record" | "upload";

export default function SpeechToText() {
  const [mode, setMode] = useState<InputMode>("record");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const recorder = useAudioRecorder();
  const transcription = useTranscription();

  const handleToggleRecording = useCallback(async () => {
    if (recorder.isRecording) {
      const blob = await recorder.stopRecording();
      if (blob) {
        const text = await transcription.transcribeAudio(blob);
        if (text) showSuccess("Transcription complete!");
      }
    } else {
      transcription.clearTranscription();
      setSaved(false);
      recorder.startRecording();
    }
  }, [recorder, transcription]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setUploadedFile(file);
      transcription.clearTranscription();
      setSaved(false);

      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const text = await transcription.transcribeAudio(blob, file.name);
      if (text) showSuccess("Transcription complete!");
    },
    [transcription],
  );

  const handleSave = useCallback(async () => {
    if (!transcription.transcription) return;

    const audioBlob =
      recorder.audioBlob ||
      (uploadedFile
        ? new Blob([await uploadedFile.arrayBuffer()], {
            type: uploadedFile.type,
          })
        : null);

    if (!audioBlob) {
      showError("No audio to save");
      return;
    }

    const result = await transcription.saveToHistory(
      audioBlob,
      transcription.transcription,
      uploadedFile?.name,
    );

    if (result) {
      setSaved(true);
      showSuccess("Saved to history!");
    } else {
      showError("Failed to save. Are you logged in?");
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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Scroll to editor when transcription starts appearing
  useEffect(() => {
    if (transcription.transcription && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [transcription.transcription]);

  return (
    <div
      className={`max-w-4xl mx-auto space-y-8 pb-12 relative overflow-hidden md:overflow-visible transition-all duration-300 ${isChatOpen ? "lg:pr-[420px]" : ""}`}
    >
      {/* Background glow specific to this page */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] max-w-[800px] h-[400px] pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(ellipse, #06b6d4 0%, transparent 60%)",
          filter: "blur(80px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3 relative z-10 pt-4"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
          Speech to Text
        </h1>
        <p className="text-sm md:text-base text-[--text-secondary] max-w-lg mx-auto">
          Experience seamless, AI-powered transcription. Speak naturally or
          upload an audio file to see it transform into text instantly.
        </p>
      </motion.div>

      {/* Input Section - Centralized */}
      <motion.div
        className="relative rounded-[2rem] p-6 md:p-10 flex flex-col items-center justify-center overflow-hidden border z-10"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(255, 255, 255, 0.08)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        {/* Toggle Switch */}
        <div
          className="flex p-1 mb-8 rounded-full"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <button
            onClick={() => setMode("record")}
            className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${mode === "record" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            {mode === "record" && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Mic className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Record</span>
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${mode === "upload" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            {mode === "upload" && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Upload className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Upload File</span>
          </button>
        </div>

        {/* Input Area */}
        <div className="w-full flex justify-center min-h-[220px]">
          <AnimatePresence mode="wait">
            {mode === "record" ? (
              <motion.div
                key="record"
                className="flex flex-col items-center gap-6 w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Duration Display */}
                <div className="h-10 flex items-center justify-center">
                  {recorder.isRecording || recorder.duration > 0 ? (
                    <motion.div
                      className="text-4xl font-mono font-bold tracking-wider"
                      style={{
                        background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {formatDuration(recorder.duration)}
                    </motion.div>
                  ) : (
                    <p className="text-slate-500 font-medium">
                      Ready to record
                    </p>
                  )}
                </div>

                {/* Microphone Button & Waveform wrapper */}
                <div className="relative flex flex-col items-center justify-center py-4 w-full">
                  {/* Floating Waveform */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                    <AudioWaveform
                      audioLevel={recorder.audioLevel}
                      isActive={recorder.isRecording}
                    />
                  </div>

                  <div className="relative z-10">
                    <MicrophoneButton
                      isRecording={recorder.isRecording}
                      isProcessing={transcription.isTranscribing}
                      audioLevel={recorder.audioLevel}
                      onClick={handleToggleRecording}
                    />
                  </div>
                </div>

                {/* Error Display */}
                {recorder.error && (
                  <motion.p
                    className="text-sm text-rose-400 font-medium bg-rose-500/10 px-4 py-2 rounded-lg"
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
                className="w-full max-w-lg flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FileUploader
                  onFileSelect={handleFileSelect}
                  disabled={transcription.isTranscribing}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Transcription Result Area */}
      <motion.div
        ref={editorRef}
        className="w-full relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div
          className="rounded-[2rem] overflow-hidden border flex flex-col transition-all duration-500"
          style={{
            background: "rgba(6, 7, 10, 0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "rgba(255, 255, 255, 0.05)",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
            minHeight:
              transcription.transcription || transcription.isTranscribing
                ? "400px"
                : "200px",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div
              className="p-2 rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1))",
              }}
            >
              <Type className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-lg text-slate-200">
              Transcription Result
            </h3>

            {/* Status indicator */}
            {transcription.isTranscribing && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-medium text-cyan-400">
                  Processing AI...
                </span>
              </div>
            )}
          </div>

          {/* Editor Area */}
          <div className="flex-1 p-0 relative">
            {!transcription.transcription &&
            !transcription.isTranscribing &&
            !transcription.error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 opacity-60">
                <Type className="w-12 h-12 mb-4 opacity-20" />
                <p>Your transcription will appear here</p>
              </div>
            ) : (
              <TranscriptionEditor
                text={transcription.transcription}
                isLoading={transcription.isTranscribing}
                onTextChange={transcription.setTranscription}
              />
            )}

            {/* Error Display */}
            {transcription.error && (
              <div className="absolute bottom-4 left-4 right-4">
                <motion.div
                  className="text-sm text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {transcription.error}
                </motion.div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <AnimatePresence>
            {(transcription.transcription || saved) && (
              <motion.div
                className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between gap-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <motion.button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </motion.button>

                  <motion.button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isChatOpen
                        ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                        : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isChatOpen ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    {isChatOpen ? "Close AI" : "Ask AI"}
                  </motion.button>
                </div>

                <motion.button
                  onClick={handleSave}
                  disabled={saved}
                  className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
                    saved
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10"
                      : "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
                  }`}
                  whileHover={!saved ? { scale: 1.05 } : {}}
                  whileTap={!saved ? { scale: 0.95 } : {}}
                >
                  <Save className="w-4 h-4" />
                  {saved ? "Saved to History" : "Save to History"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* AI Chat Panel */}
      <AIChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        transcriptionText={transcription.transcription || ""}
      />
    </div>
  );
}
