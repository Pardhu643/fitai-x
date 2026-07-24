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
      throw new Error('API key not configured');
    }

    const fullPrompt = `You are Rachel, an AI Fitness Coach. Ground your response in the provided user context where appropriate. Keep responses concise and practical. Distinguish general fitness advice from stored user data.\nContext: ${JSON.stringify(context || {})}\n\nUser: ${prompt}`;
    
    // Google Gen AI API call
    const result = await this.model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }
}
export const geminiService = new GeminiService();
