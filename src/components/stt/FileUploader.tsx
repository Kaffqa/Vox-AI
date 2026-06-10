import { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileAudio, X, AlertCircle } from 'lucide-react';
import { SUPPORTED_AUDIO_FORMATS, MAX_AUDIO_SIZE } from '../../lib/constants';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUploader({ onFileSelect, disabled }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_AUDIO_FORMATS.includes(extension as any)) {
      return `Unsupported format. Use: ${SUPPORTED_AUDIO_FORMATS.join(', ')}`;
    }
    if (file.size > MAX_AUDIO_SIZE) {
      return `File too large. Maximum size is ${MAX_AUDIO_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  }, []);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full space-y-3">
      <motion.div
        className={`
          relative rounded-2xl border-2 border-dashed p-8
          flex flex-col items-center justify-center gap-4
          cursor-pointer transition-all duration-300
          ${isDragging
            ? 'border-cyan-400/60 bg-cyan-500/5'
            : selectedFile
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-[--border-glass] bg-[--bg-glass] hover:border-[--border-glass-hover] hover:bg-[--bg-glass-hover]'
          }
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_AUDIO_FORMATS.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {selectedFile ? (
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <FileAudio className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-[--text-primary] text-center truncate max-w-[250px]">
              {selectedFile.name}
            </p>
            <p className="text-xs text-[--text-secondary]">
              {formatFileSize(selectedFile.size)}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="mt-1 text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="w-14 h-14 rounded-2xl bg-[--bg-glass-hover] flex items-center justify-center"
              animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
            >
              <Upload className="w-7 h-7 text-[--text-secondary]" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-medium text-[--text-primary]">
                Drop your audio file here
              </p>
              <p className="text-xs text-[--text-muted] mt-1">
                or click to browse • MP3, WAV, M4A, WebM • Max 10MB
              </p>
            </div>
          </>
        )}
      </motion.div>

      {error && (
        <motion.div
          className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </div>
  );
}
