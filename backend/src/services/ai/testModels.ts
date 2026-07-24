import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: path.join(__dirname, '../../../.env'), override: true });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log('Sending request to Gemini API...');
  try {
    const res = await axios.get(url, { timeout: 10000 });
    console.log('Success! Available models:');
    if (res.data && res.data.models) {
      res.data.models.forEach((m: any) => console.log(`- ${m.name}`));
    } else {
      console.log(res.data);
    }
  } catch (error: any) {
    console.error('Request failed.');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

listModels();
