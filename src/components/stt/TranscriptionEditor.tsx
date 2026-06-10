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
        className="w-full h-full p-8 flex flex-col justify-center space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="space-y-4 max-w-2xl mx-auto w-full">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="h-3 rounded-full"
              style={{
                background: 'linear-gradient(90deg, rgba(6,182,212,0.1) 0%, rgba(139,92,246,0.3) 50%, rgba(6,182,212,0.1) 100%)',
                backgroundSize: '200% 100%',
                width: `${90 - i * 12}%`,
              }}
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!text) {
    return null; // Handled by parent now
  }

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Actions toolbar */}
      <div className="flex items-center justify-end px-4 py-2 bg-black/10">
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
      <div className="p-6 md:p-8 flex-1 flex flex-col min-h-[300px]">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full flex-1 bg-transparent text-slate-200 text-base md:text-lg leading-relaxed
            resize-none outline-none placeholder:text-[--text-muted]"
          style={{ fontFamily: "Inter, sans-serif" }}
          placeholder="No transcription yet..."
        />
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-end gap-4 px-6 py-3 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Hash className="w-3.5 h-3.5 text-cyan-500" />
          {wordCount} words
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Type className="w-3.5 h-3.5 text-violet-500" />
          {charCount} characters
        </div>
      </div>
    </motion.div>
  );
}
