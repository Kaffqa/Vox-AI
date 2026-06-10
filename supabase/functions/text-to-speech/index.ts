import { corsHeaders } from '../_shared/cors.ts';
import { validateUser } from '../_shared/auth.ts';

const MAX_TEXT_LENGTH = 4096;
const ALLOWED_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
const ALLOWED_MODELS = ['tts-1', 'tts-1-hd'] as const;

Deno.serve(async (req: Request) => {
  // ── CORS preflight ──────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── Auth ───────────────────────────────────────────────────────────
    const user = await validateUser(req);

    // ── Validate method ───────────────────────────────────────────────
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── Parse JSON body ───────────────────────────────────────────────
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Content-Type must be application/json' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = await req.json();
    const { text, voice, model } = body as {
      text?: string;
      voice?: string;
      model?: string;
    };

    // ── Input validation ──────────────────────────────────────────────
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing or empty "text" field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters (got ${text.length})`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!voice || typeof voice !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing "voice" field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!ALLOWED_VOICES.includes(voice as typeof ALLOWED_VOICES[number])) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid voice "${voice}". Allowed: ${ALLOWED_VOICES.join(', ')}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const selectedModel = model ?? 'tts-1';
    if (!ALLOWED_MODELS.includes(selectedModel as typeof ALLOWED_MODELS[number])) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid model "${selectedModel}". Allowed: ${ALLOWED_MODELS.join(', ')}`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── Call Azure Neural TTS API ─────────────────────────────────────
    const azureKey = Deno.env.get('AZURE_SPEECH_KEY');
    const azureRegion = Deno.env.get('AZURE_SPEECH_REGION');

    if (!azureKey || !azureRegion) {
      return new Response(
        JSON.stringify({ success: false, error: 'Azure Speech credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const voiceMapping: Record<string, string> = {
      alloy: 'en-US-AndrewMultilingualNeural',
      echo: 'en-US-BrianNeural',
      fable: 'en-GB-RyanNeural',
      onyx: 'en-US-ChristopherNeural',
      nova: 'en-US-AriaNeural',
      shimmer: 'en-US-JennyNeural',
    };

    const azureVoiceName = voiceMapping[voice] || 'en-US-JennyNeural';

    // Build SSML
    const ssml = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' name='${azureVoiceName}'>${text}</voice></speak>`;

    const ttsRes = await fetch(
      `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'VoxAI',
        },
        body: ssml,
      },
    );

    if (!ttsRes.ok) {
      const errorBody = await ttsRes.text();
      console.error('TTS API error:', ttsRes.status, errorBody);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Text-to-speech failed (${ttsRes.status})`,
          details: errorBody,
        }),
        {
          status: ttsRes.status >= 500 ? 502 : ttsRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // ── Stream audio back to client ───────────────────────────────────
    const audioData = await ttsRes.arrayBuffer();

    return new Response(audioData, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.byteLength.toString(),
        'X-User-Id': user.id,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const isAuthError =
      message.includes('Authorization') ||
      message.includes('Authentication') ||
      message.includes('User not found');

    console.error('text-to-speech error:', message);

    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: isAuthError ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
