import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: "gemini-pro" });
}
