import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
  audioLevel: number;
  isActive: boolean;
}

export default function AudioWaveform({ audioLevel, isActive }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<number[]>(Array(40).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const bars = barsRef.current;
      const barCount = bars.length;
      const barWidth = width / barCount - 2;
      const maxBarHeight = height * 0.8;

      // Update bar heights
      for (let i = 0; i < barCount; i++) {
        if (isActive) {
          // Create wave-like pattern based on audio level
          const targetHeight = audioLevel * maxBarHeight * (0.3 + Math.random() * 0.7);
          bars[i] = bars[i] + (targetHeight - bars[i]) * 0.3;
        } else {
          bars[i] = bars[i] * 0.9; // Decay to zero
        }
      }

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const barHeight = Math.max(2, bars[i]);
        const y = (height - barHeight) / 2;

        // Gradient from cyan to violet
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        const progress = i / barCount;
        
        if (isActive) {
          gradient.addColorStop(0, `rgba(6, 182, 212, ${0.6 + audioLevel * 0.4})`);
          gradient.addColorStop(1, `rgba(139, 92, 246, ${0.6 + audioLevel * 0.4})`);
        } else {
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    // Set canvas DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [audioLevel, isActive]);

  return (
    <motion.div
      className="w-full h-16 rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)' }}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: isActive ? 1 : 0.5, scaleY: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </motion.div>
  );
}
