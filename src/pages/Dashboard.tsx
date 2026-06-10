import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, Volume2, Clock, Sparkles, ArrowRight, Zap, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Stats {
  totalSTT: number;
  totalTTS: number;
  recentSTT: Array<{ id: string; transcription_text: string; created_at: string }>;
  recentTTS: Array<{ id: string; input_text: string; voice_model: string; created_at: string }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ totalSTT: 0, totalTTS: 0, recentSTT: [], recentTTS: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        const [sttRes, ttsRes] = await Promise.all([
          supabase.from('stt_history').select('id, transcription_text, created_at')
            .eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(3),
          supabase.from('tts_history').select('id, input_text, voice_model, created_at')
            .eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(3),
        ]);

        setStats({
          totalSTT: sttRes.data?.length || 0,
          totalTTS: ttsRes.data?.length || 0,
          recentSTT: (sttRes.data || []) as Stats['recentSTT'],
          recentTTS: (ttsRes.data || []) as Stats['recentTTS'],
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const userName = user?.full_name || user?.email?.split('@')[0] || 'User';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome section */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-[--text-primary]">
          {greeting}, <span className="gradient-text">{userName}</span> 👋
        </h1>
        <p className="text-sm text-[--text-secondary]">
          Ready to transform your voice and text with AI?
        </p>
      </motion.div>

      {/* Quick action cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* STT Card */}
        <motion.button
          onClick={() => navigate('/speech-to-text')}
          className="group relative overflow-hidden rounded-2xl p-6 text-left cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0.02) 100%)',
            border: '1px solid rgba(6,182,212,0.15)',
          }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(6,182,212,0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
              <Mic className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-[--text-primary] mb-1">Start Recording</h3>
            <p className="text-xs text-[--text-secondary] mb-4">Record audio or upload files for AI transcription</p>
            <div className="flex items-center gap-1 text-xs text-cyan-400 font-medium">
              Get started <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.button>

        {/* TTS Card */}
        <motion.button
          onClick={() => navigate('/text-to-speech')}
          className="group relative overflow-hidden rounded-2xl p-6 text-left cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.02) 100%)',
            border: '1px solid rgba(139,92,246,0.15)',
          }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(139,92,246,0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
              <Volume2 className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-[--text-primary] mb-1">Generate Speech</h3>
            <p className="text-xs text-[--text-secondary] mb-4">Convert text to natural-sounding AI voices</p>
            <div className="flex items-center gap-1 text-xs text-violet-400 font-medium">
              Get started <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        {[
          { label: 'Transcriptions', value: stats.totalSTT, icon: Mic, color: 'cyan' },
          { label: 'Speeches', value: stats.totalTTS, icon: Volume2, color: 'violet' },
          { label: 'Total Activity', value: stats.totalSTT + stats.totalTTS, icon: Zap, color: 'emerald' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 text-${stat.color}-400`} style={{ color: stat.color === 'cyan' ? '#22d3ee' : stat.color === 'violet' ? '#a78bfa' : '#34d399' }} />
              <span className="text-xs text-[--text-muted]">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-[--text-primary]">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-white/5 rounded animate-pulse" />
              ) : (
                stat.value
              )}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Features */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-[--text-secondary] mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Powered by AI
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Zap, title: 'High Accuracy', desc: 'OpenAI Whisper for precise transcription', color: '#22d3ee' },
            { icon: Volume2, title: 'Multiple Voices', desc: '6 AI voices to choose from', color: '#a78bfa' },
            { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and protected', color: '#34d399' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl p-4"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <feature.icon className="w-5 h-5 mb-2" style={{ color: feature.color }} />
              <h3 className="text-sm font-medium text-[--text-primary]">{feature.title}</h3>
              <p className="text-xs text-[--text-muted] mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      {(stats.recentSTT.length > 0 || stats.recentTTS.length > 0) && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[--text-secondary] flex items-center gap-2">
              <Clock className="w-4 h-4" /> Recent Activity
            </h2>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {[...stats.recentSTT.map((s) => ({ ...s, _type: 'stt' as const, text: s.transcription_text })),
              ...stats.recentTTS.map((s) => ({ ...s, _type: 'tts' as const, text: s.input_text }))]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/[0.03] transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${item._type === 'stt' ? 'bg-cyan-500/10' : 'bg-violet-500/10'}`}
                  >
                    {item._type === 'stt'
                      ? <Mic className="w-4 h-4 text-cyan-400" />
                      : <Volume2 className="w-4 h-4 text-violet-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[--text-primary] truncate">
                      {item.text}
                    </p>
                    <p className="text-[10px] text-[--text-muted]">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
