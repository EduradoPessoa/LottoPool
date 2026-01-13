
import { GoogleGenAI, Type } from "@google/genai";

// Standard initialization for GoogleGenAI as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLuckyNumbers = async (type: string, quantity: number) => {
  const prompt = `Gere ${quantity} conjuntos de números para a loteria ${type}. Use lógica estatística de números que costumam sair ou padrões aleatórios equilibrados (pares/ímpares). Retorne apenas o JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            games: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  numbers: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  explanation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    // Correctly using response.text property (not a method)
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return null;
  }
};

export const fetchLatestResult = async (type: string, drawNumber: string) => {
  const prompt = `Busque o resultado oficial do concurso ${drawNumber} da ${type} da Caixa Econômica Federal.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri
    })) || [];

    return {
      text: response.text,
      sources
    };
  } catch (error) {
    console.error("Error searching result:", error);
    return null;
  }
};
