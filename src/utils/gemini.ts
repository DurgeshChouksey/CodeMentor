import { GoogleGenAI } from "@google/genai";

// create client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/**
 * Ask Gemini a question using context from RAG
 */
export async function askGemini(prompt: string, context: string) {
  const model = "gemini-2.0-flash"; // free, fast, stable

  const contents = `
You are an expert code assistant.

Question:
${prompt}

Relevant code context:
${context}

Only answer using the information found in the code context.
`;

  const response: any = await ai.models.generateContent({
    model,
    contents,
  });

   // Extract the text properly for new SDK
  const text =
    response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

  return text;
}
