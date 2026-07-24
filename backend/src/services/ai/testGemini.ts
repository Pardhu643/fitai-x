import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.join(__dirname, '../../../.env'), override: true });

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testConnection() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  console.log('Testing Gemini API key prefix:', apiKey.substring(0, 10) + '...');
  
  // Wait 9 seconds to bypass rate-limiting RetryInfo block
  console.log('Waiting for quota cooldown (9s)...');
  await sleep(9500);

  const models = ['gemini-flash-latest', 'gemini-pro-latest', 'gemini-2.5-flash', 'gemini-3.5-flash'];
  
  for (const modelName of models) {
    try {
      console.log(`\nTrying model: ${modelName}...`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Reply with exactly: Gemini connection successful');
      const response = await result.response;
      console.log(`Success with ${modelName}! Response:`, response.text().trim());
      return; // Stop if success
    } catch (error: any) {
      console.error(`Failed with ${modelName}:`, error.message);
    }
  }
}

testConnection();
