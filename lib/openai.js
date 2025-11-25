import OpenAI from 'openai';

let openaiClient = null;

export function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.warn('OpenAI API key not configured. AI features will not work.');
      return null;
    }
    
    openaiClient = new OpenAI({ apiKey });
  }
  
  return openaiClient;
}

export default getOpenAIClient;
