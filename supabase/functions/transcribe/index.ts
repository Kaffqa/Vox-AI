import { corsHeaders } from '../_shared/cors.ts';
import { validateUser } from '../_shared/auth.ts';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB — OpenAI Whisper limit

Deno.serve(async (req: Request) => {
  // ── CORS preflight ──────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── Auth ───────────────────────────────────────────────────────────
    const user = await validateUser(req);

    // ── Parse multipart form data ─────────────────────────────────────
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Content-Type must be multipart/form-data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing "file" field in form data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `File size exceeds the 25 MB limit (got ${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── Call Groq Whisper API ──────────────────────────────────────────
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (!groqKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Groq API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const whisperForm = new FormData();
    whisperForm.append('file', file, file.name);
    whisperForm.append('model', 'whisper-large-v3-turbo');

    // Allow optional language hint from the client
    const language = formData.get('language');
    if (language && typeof language === 'string') {
      whisperForm.append('language', language);
    }

    const whisperRes = await fetch(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
        },
        body: whisperForm,
      },
    );

    if (!whisperRes.ok) {
      const errorBody = await whisperRes.text();
      console.error('Whisper API error:', whisperRes.status, errorBody);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Transcription failed (${whisperRes.status})`,
          details: errorBody,
        }),
        {
          status: whisperRes.status >= 500 ? 502 : whisperRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const result = await whisperRes.json();

    // ── Success response ──────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        text: result.text,
        userId: user.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const isAuthError =
      message.includes('Authorization') ||
      message.includes('Authentication') ||
      message.includes('User not found');

    console.error('transcribe error:', message);

    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: isAuthError ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
