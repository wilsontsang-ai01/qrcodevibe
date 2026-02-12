
import { GoogleGenAI } from "@google/genai";

export const processNLEntry = async (input: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please ensure it is configured.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Task: Extract or transform the following natural language input into a single valid URL or plain text string suitable for a QR code.
    
    Rules:
    - If it's a social handle (e.g., @username on X), convert to the profile URL (e.g., https://x.com/username).
    - If it mentions a website, return the clean URL.
    - If it's just plain text, keep it as text.
    - Return ONLY the resulting string, no explanations.
    - If you are unsure, return the input string as is.

    Input: "${input}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-latest',
      contents: prompt,
      config: {
        temperature: 0.1,
        topP: 1,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    return response.text?.trim() || input;
  } catch (error) {
    console.error("Gemini Error:", error);
    return input; // Fallback to original input
  }
};
