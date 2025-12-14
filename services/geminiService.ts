import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  if (transactions.length === 0) {
    return "Please add some transactions first so I can analyze your spending habits.";
  }

  // Format transactions for the prompt
  const transactionSummary = transactions.slice(0, 50).map(t => 
    `- ${t.date.split('T')[0]}: ${t.type.toUpperCase()} of $${t.amount} for ${t.category} (${t.note})`
  ).join('\n');

  const prompt = `You are a personal finance assistant. Here are my recent transactions:

${transactionSummary}

Based on this data, provide:
1. A brief 1-sentence summary of my spending behavior.
2. Three specific, actionable tips to save money or improve my financial health.

Keep the tone encouraging but professional. Format the output with clear headings.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful, concise financial expert.",
      }
    });
    
    return response.text || "I couldn't generate insights at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the financial brain right now. Please try again later.";
  }
};