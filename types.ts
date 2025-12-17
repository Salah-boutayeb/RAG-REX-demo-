export interface KnowledgeChunk {
  id: string;
  content: string;
  score?: number; // Relevance score
  reasoning?: string; // REX: Why was this retrieved?
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  relatedChunks?: KnowledgeChunk[]; // For citing sources
  isThinking?: boolean;
}

export enum AppMode {
  LEARN = 'LEARN',
  EXPERIMENT = 'EXPERIMENT',
}

export interface RetrievalResult {
  chunkId: string;
  score: number;
  reasoning: string;
}

export interface RagResponse {
  answer: string;
  retrievalData: RetrievalResult[];
}
