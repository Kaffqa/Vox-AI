import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    
    const { messages, transcriptionText } = await req.json();

    if (!transcriptionText || !messages || !Array.isArray(messages)) {
      throw new Error('Missing required fields: transcriptionText or messages');
    }

    if (!GROQ_API_KEY) {
      throw new Error('Groq API Key is not configured');
    }

    // Prepare messages for Groq API
    // We inject the system prompt as the first message
    const systemPrompt = {
      role: 'system',
      content: `Anda adalah asisten analitik pintar yang sangat membantu. Tugas Anda adalah menjawab pertanyaan pengguna BERDASARKAN teks transkripsi berikut ini saja. Jika informasi yang ditanyakan pengguna tidak ada di dalam teks transkripsi, Anda harus menjawab dengan sopan bahwa Anda tidak mengetahuinya berdasarkan teks yang diberikan. Jangan menggunakan pengetahuan luar selain yang diberikan. Format jawaban Anda dalam Markdown yang rapi jika memungkinkan.\n\nTEKS TRANSKRIPSI:\n"""\n${transcriptionText}\n"""`
    };

    const apiMessages = [systemPrompt, ...messages];

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast model suitable for chat
        messages: apiMessages,
        temperature: 0.3, // Lower temperature for more factual, context-bound answers
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to communicate with Groq API');
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Maaf, saya tidak dapat merespon saat ini.';

    return new Response(
      JSON.stringify({ reply }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
