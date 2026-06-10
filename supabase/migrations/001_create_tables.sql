-- ============================================================================
-- VoxAI — Database Schema Migration
-- Creates tables, RLS policies, and indexes for STT & TTS history
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Speech-to-Text History
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stt_history (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    audio_url       text            NOT NULL,
    transcription_text text         NOT NULL,
    file_name       text,
    file_size       integer,
    duration_seconds numeric,
    created_at      timestamptz     NOT NULL DEFAULT now()
);

COMMENT ON TABLE stt_history IS 'Stores speech-to-text transcription history per user.';

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Text-to-Speech History
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tts_history (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    input_text      text            NOT NULL,
    voice_model     text            NOT NULL,
    audio_url       text            NOT NULL,
    created_at      timestamptz     NOT NULL DEFAULT now()
);

COMMENT ON TABLE tts_history IS 'Stores text-to-speech generation history per user.';

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Row Level Security
-- ────────────────────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE stt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tts_history ENABLE ROW LEVEL SECURITY;

-- STT policies — users can only read / create / delete their own rows
CREATE POLICY "Users can view their own STT history"
    ON stt_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own STT history"
    ON stt_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own STT history"
    ON stt_history FOR DELETE
    USING (auth.uid() = user_id);

-- TTS policies — users can only read / create / delete their own rows
CREATE POLICY "Users can view their own TTS history"
    ON tts_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TTS history"
    ON tts_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own TTS history"
    ON tts_history FOR DELETE
    USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Indexes for performance
-- ────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stt_history_user_id
    ON stt_history (user_id);

CREATE INDEX IF NOT EXISTS idx_stt_history_created_at
    ON stt_history (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tts_history_user_id
    ON tts_history (user_id);

CREATE INDEX IF NOT EXISTS idx_tts_history_created_at
    ON tts_history (created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Storage Bucket Setup (manual via Supabase Dashboard or CLI)
-- ────────────────────────────────────────────────────────────────────────────
--
-- The audio files for STT and TTS are stored in Supabase Storage.
-- Create the following buckets manually in the Supabase Dashboard:
--
-- BUCKET: "audio"
--   - Public: false (private bucket)
--   - Allowed MIME types: audio/mpeg, audio/wav, audio/webm, audio/ogg, audio/mp4
--   - Max file size: 25 MB
--
-- Then apply these Storage RLS policies via Dashboard → Storage → Policies:
--
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ Policy: "Users can upload their own audio files"                       │
-- │ Operation: INSERT                                                      │
-- │ Target: bucket_id = 'audio'                                           │
-- │ Check:  (auth.uid())::text = (storage.foldername(name))[1]            │
-- │                                                                        │
-- │ Files should be uploaded under a path like:                            │
-- │   audio/{user_id}/{filename}                                          │
-- │ This policy ensures users can only upload to their own folder.        │
-- └─────────────────────────────────────────────────────────────────────────┘
--
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ Policy: "Users can read their own audio files"                         │
-- │ Operation: SELECT                                                      │
-- │ Target: bucket_id = 'audio'                                           │
-- │ Using:  (auth.uid())::text = (storage.foldername(name))[1]            │
-- └─────────────────────────────────────────────────────────────────────────┘
--
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ Policy: "Users can delete their own audio files"                       │
-- │ Operation: DELETE                                                      │
-- │ Target: bucket_id = 'audio'                                           │
-- │ Using:  (auth.uid())::text = (storage.foldername(name))[1]            │
-- └─────────────────────────────────────────────────────────────────────────┘
--
-- Alternatively, create the bucket via SQL (uncomment below):
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('audio', 'audio', false)
-- ON CONFLICT (id) DO NOTHING;
