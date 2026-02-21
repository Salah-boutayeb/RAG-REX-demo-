import { GoogleGenAI, Type, Schema } from "@google/genai";
import { KnowledgeChunk, RetrievalResult } from "../types";

// Initialize Gemini Client
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Please set it in your environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const ai = getAI();

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Step 1 & 2: Retrieval & REX (Explanation)
 * Simulates a Vector DB retrieval by asking Gemini to score relevance.
 * This demonstrates the "Semantic Search" concept conceptually.
 */
export const performRetrieval = async (
  query: string,
  chunks: KnowledgeChunk[]
): Promise<RetrievalResult[]> => {
  if (!chunks.length) return [];
  if (!ai) {
    return chunks.map(c => ({ chunkId: c.id, score: 0, reasoning: "API Key missing - check environment variables." }));
  }

  const chunksText = chunks.map((c, i) => `ID: ${c.id}\nContent: "${c.content}"`).join("\n---\n");

  const prompt = `
    You are a semantic retrieval engine (RAG system).
    User Query: "${query}"

    Analyze the following text chunks.
    For each chunk, assign a relevance score between 0 and 100 based on how well it helps answer the query.
    Also provide a brief reasoning (REX) for why you gave that score.
    
    Return a JSON array.
  `;

  // Define schema for structured output
  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        chunkId: { type: Type.STRING },
        score: { type: Type.NUMBER },
        reasoning: { type: Type.STRING },
      },
      required: ["chunkId", "score", "reasoning"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        { role: 'user', parts: [{ text: chunksText }] },
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for consistent scoring
      },
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as RetrievalResult[];
  } catch (error) {
    console.error("Error in retrieval:", error);
    // Fallback: Return random scores if API fails (shouldn't happen with valid key)
    return chunks.map(c => ({ chunkId: c.id, score: 0, reasoning: "Error interacting with API" }));
  }
};

/**
 * Step 3: Generation
 * Generates the final answer using ONLY the retrieved context.
 */
export const generateAnswer = async (
  query: string,
  relevantChunks: KnowledgeChunk[]
): Promise<string> => {
  if (!ai) {
    return "L'API Gemini n'est pas configurée. Veuillez ajouter votre GEMINI_API_KEY dans les variables d'environnement de Vercel.";
  }
  const context = relevantChunks.map(c => c.content).join("\n\n");

  const prompt = `
    You are a helpful assistant using a RAG (Retrieval Augmented Generation) architecture.
    
    Context (Retrieved Information):
    """
    ${context}
    """

    User Question: "${query}"

    Instructions:
    1. Answer the question using ONLY the provided context.
    2. If the answer is not in the context, state that you cannot answer based on the available knowledge base.
    3. Keep the answer concise and clear. French language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });

    return response.text || "Désolé, je n'ai pas pu générer une réponse.";
  } catch (error) {
    console.error("Error in generation:", error);
    return "Erreur lors de la génération de la réponse.";
  }
};
