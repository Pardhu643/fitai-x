import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI!: GoogleGenerativeAI;
  private model: any;

  private init() {
    if (this.genAI) return;
    const apiKey = process.env.GEMINI_API_KEY || '';
    const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async generateCoachResponse(prompt: string, context?: any): Promise<string> {
    this.init();
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('API key not configured');
    }

    const fullPrompt = `You are Rachel, an AI Fitness Coach. Ground your response in the provided user context where appropriate. Keep responses concise and practical. Distinguish general fitness advice from stored user data.\nContext: ${JSON.stringify(context || {})}\n\nUser: ${prompt}`;
    
    const result = await this.model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }
}
export const geminiService = new GeminiService();
