import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI!: GoogleGenerativeAI;

  private init() {
    if (this.genAI) return;
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private isTransientError(error: any): boolean {
    const status = error.status;
    const message = error.message || '';
    
    // Status checks
    if ([429, 500, 502, 503, 504].includes(status)) {
      return true;
    }
    
    // String content checks for transient messages
    if (
      message.includes('Quota exceeded') ||
      message.includes('Too Many Requests') ||
      message.includes('high demand') ||
      message.includes('Service Unavailable') ||
      message.includes('Overloaded')
    ) {
      return true;
    }
    
    return false;
  }

  private async generateWithModel(modelName: string, prompt: string, attempt: number): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: modelName });
    
    try {
      console.log(`[Gemini Request] Model: ${modelName} | Attempt: ${attempt}`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (!text || text.trim() === '') {
        throw new Error('Empty provider response');
      }
      return text;
    } catch (error: any) {
      console.error(`[Gemini Error] Model: ${modelName} | Attempt: ${attempt} | Status: ${error.status} | Msg: ${error.message}`);
      throw error;
    }
  }

  async generateCoachResponse(prompt: string, context?: any): Promise<string> {
    this.init();
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('API key not configured');
    }

    const fullPrompt = `You are Rachel, an AI Fitness Coach. Ground your response in the provided user context where appropriate. Keep responses concise and practical. Distinguish general fitness advice from stored user data.\nContext: ${JSON.stringify(context || {})}\n\nUser: ${prompt}`;
    
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.0-flash';
    
    const maxAttempts = 3;
    const delays = [0, 1000, 2500]; // attempt 1: 0ms, attempt 2: ~1000ms, attempt 3: ~2500ms

    // Try Primary Model first
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        const jitter = Math.random() * 300;
        const delay = delays[attempt - 1] + jitter;
        console.log(`[Gemini Retry] Delaying ${Math.round(delay)}ms before attempt ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        const reply = await this.generateWithModel(primaryModel, fullPrompt, attempt);
        return reply;
      } catch (error: any) {
        if (!this.isTransientError(error) || attempt === maxAttempts) {
          if (!this.isTransientError(error)) {
            throw error;
          }
          break;
        }
      }
    }

    // Try Fallback Model
    console.log(`[Gemini Fallback] Switching to fallback model: ${fallbackModel}`);
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        const jitter = Math.random() * 300;
        const delay = delays[attempt - 1] + jitter;
        console.log(`[Gemini Fallback Retry] Delaying ${Math.round(delay)}ms before attempt ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        const reply = await this.generateWithModel(fallbackModel, fullPrompt, attempt);
        return reply;
      } catch (error: any) {
        if (!this.isTransientError(error) || attempt === maxAttempts) {
          throw error;
        }
      }
    }

    throw new Error('All model attempts failed');
  }
}
export const geminiService = new GeminiService();
