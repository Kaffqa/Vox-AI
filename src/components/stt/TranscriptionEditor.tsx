import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Check, Type, Hash } from 'lucide-react';

interface TranscriptionEditorProps {
  text: string | null;
  isLoading: boolean;
  onTextChange: (text: string) => void;
}

export default function TranscriptionEditor({ text, isLoading, onTextChange }: TranscriptionEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcription-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const wordCount = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text ? text.length : 0;

  if (isLoading) {
    return (
      <motion.div
        className="rounded-2xl p-6 space-y-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-sm text-cyan-400 font-medium">AI is transcribing your audio...</span>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="h-4 rounded-lg"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
                backgroundSize: '200% 100%',
                width: `${85 - i * 15}%`,
              }}
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!text) {
    return (
      <motion.div
        className="rounded-2xl overflow-hidden h-full flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
          <h3 className="text-sm font-semibold text-[--text-primary]">Transcription Result</h3>
        </div>
        
        {/* Empty State Content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 min-h-[300px]">
          <Type className="w-8 h-8 text-[--text-muted]" />
          <p className="text-[--text-muted] text-sm text-center">
            Transcription will appear here after recording or uploading audio
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl overflow-hidden h-full flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header with actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <h3 className="text-sm font-semibold text-[--text-primary]">Transcription Result</h3>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-white/5 hover:bg-white/10 text-[--text-secondary] hover:text-[--text-primary] transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
          <motion.button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-white/5 hover:bg-white/10 text-[--text-secondary] hover:text-[--text-primary] transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </motion.button>
        </div>
      </div>

      {/* Editable text area */}
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full flex-1 bg-transparent text-[--text-primary] text-sm leading-relaxed
            font-mono resize-none outline-none placeholder:text-[--text-muted]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          placeholder="No transcription yet..."
        />
      </div>

      {/* Footer with stats */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-[--text-muted]">
          <Hash className="w-3 h-3" />
          {wordCount} words
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[--text-muted]">
          <Type className="w-3 h-3" />
          {charCount} characters
        </div>
      </div>
    </motion.div>
  );
}
