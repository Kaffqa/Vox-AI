import { supabase } from './supabase';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(transcriptionText: string, messages: ChatMessage[]): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('chat-transcript', {
      body: { transcriptionText, messages }
    });

    if (error) {
      throw error;
    }

    if (!data || !data.reply) {
      throw new Error('Invalid response from chat function');
    }

    return data.reply;
  } catch (error: any) {
    console.error('Failed to send chat message:', error);
    throw new Error(error.message || 'Failed to communicate with AI Assistant');
  }
}
