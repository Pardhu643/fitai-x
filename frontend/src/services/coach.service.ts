import api from '../lib/api';

export type ResponseType = 
  | 'general'
  | 'workout'
  | 'exercise'
  | 'meal'
  | 'grocery'
  | 'habit'
  | 'goal'
  | 'recovery'
  | 'calendar'
  | 'progress';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  type?: ResponseType;
  data?: any;
}

export const coachService = {
  chat: async (message: string, history: ChatMessage[]) => {
    const response = await api.post('/api/v1/ai-coach/chat', { message, history });
    return response.data;
  },
};
