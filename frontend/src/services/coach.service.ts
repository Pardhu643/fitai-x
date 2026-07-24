import api from '../lib/api';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

export const coachService = {
  chat: async (message: string, history: ChatMessage[]) => {
    const response = await api.post('/api/v1/ai-coach/chat', { message, history });
    return response.data;
  },
};
