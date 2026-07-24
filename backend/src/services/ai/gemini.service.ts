import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateCoachResponse(prompt: string, context?: any): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return 'AI Coach is temporarily offline.';
    }

    try {
      const fullPrompt = `You are Rachel, an AI Fitness Coach.\nContext: ${JSON.stringify(context || {})}\n\nUser: ${prompt}`;
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in Gemini AI Service:', error);
      return 'AI Coach is temporarily offline.';
    }
  }
}
export const geminiService = new GeminiService();
