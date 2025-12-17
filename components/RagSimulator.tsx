import React, { useState, useEffect } from 'react';
import { KnowledgeChunk, RetrievalResult, ChatMessage } from '../types';
import { performRetrieval, generateAnswer } from '../services/geminiService';
import { Database, Search, MessageSquare, ArrowRight, Activity, BrainCircuit, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DEFAULT_KNOWLEDGE = `Le RAG (Retrieval-Augmented Generation) combine la recherche d'information et la génération de texte.
Contrairement à un LLM classique qui s'appuie uniquement sur ses données d'entraînement, le RAG consulte une base externe.
Le processus se déroule en trois étapes : Indexation, Récupération (Retrieval) et Génération.
REX peut désigner "Retrieval-Enhanced Explanation", où le modèle explique pourquoi il a choisi certains documents.
Les Embeddings sont des représentations vectorielles du texte utilisées pour calculer la similarité sémantique.
L'API Gemini de Google permet de traiter de grandes fenêtres de contexte, ce qui est idéal pour le RAG.
Le RAG réduit les hallucinations en ancrant les réponses dans des faits vérifiables.`;

const RagSimulator: React.FC = () => {
  // State
  const [knowledgeText, setKnowledgeText] = useState(DEFAULT_KNOWLEDGE);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loadingStep, setLoadingStep] = useState<'idle' | 'indexing' | 'retrieving' | 'generating'>('idle');
  const [lastRetrieval, setLastRetrieval] = useState<RetrievalResult[]>([]);

  // Split text into chunks when knowledge text changes (Simple chunking by newline for demo)
  useEffect(() => {
    const rawLines = knowledgeText.split('\n').filter(line => line.trim().length > 0);
    const newChunks: KnowledgeChunk[] = rawLines.map((line, idx) => ({
      id: `chunk-${idx + 1}`,
      content: line.trim()
    }));
    setChunks(newChunks);
  }, [knowledgeText]);

  const handleSearch = async () => {
    if (!query.trim() || chunks.length === 0) return;

    // Add user message
    const userMsg: ChatMessage = { role: 'user', content: query };
    setChatHistory(prev => [...prev, userMsg]);
    
    // Start Process
    setLoadingStep('retrieving');
    
    // 1. Retrieval & REX
    const retrievalResults = await performRetrieval(query, chunks);
    setLastRetrieval(retrievalResults);

    // Filter top chunks (Score > 50 or top 3)
    const topResults = retrievalResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(r => r.score > 20); // Noise filter

    const relevantChunks = topResults.map(r => {
      const original = chunks.find(c => c.id === r.chunkId);
      return { ...original!, score: r.score, reasoning: r.reasoning };
    });

    setLoadingStep('generating');

    // 2. Generation
    const answer = await generateAnswer(query, relevantChunks);

    setChatHistory(prev => [
      ...prev,
      { 
        role: 'model', 
        content: answer, 
        relatedChunks: relevantChunks 
      }
    ]);

    setLoadingStep('idle');
    setQuery('');
  };

  // Helper for chart data
  const chartData = lastRetrieval.map(r => ({
    id: r.chunkId,
    score: r.score,
    fullData: r
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-2">
      
      {/* Left Column: Knowledge Base & Internals */}
      <div className="lg:w-1/2 flex flex-col gap-6">
        
        {/* Knowledge Base Input */}
        <div className="bg-card p-4 rounded-xl border border-gray-700 flex flex-col h-1/2">
          <div className="flex items-center gap-2 mb-3 text-blue-400">
            <Database size={20} />
            <h2 className="font-semibold">Base de Connaissances (Knowledge Base)</h2>
          </div>
          <textarea
            className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 resize-none font-mono leading-relaxed"
            value={knowledgeText}
            onChange={(e) => setKnowledgeText(e.target.value)}
            placeholder="Entrez vos données ici..."
          />
          <div className="mt-2 text-xs text-gray-500 flex justify-between">
            <span>{chunks.length} segments détectés</span>
            <span>Modifiable</span>
          </div>
        </div>

        {/* Visualizer (REX Part) */}
        <div className="bg-card p-4 rounded-xl border border-gray-700 flex flex-col h-1/2 overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-purple-400">
            <Activity size={20} />
            <h2 className="font-semibold">Visualisation REX (Scores de Pertinence)</h2>
          </div>
          
          {lastRetrieval.length > 0 ? (
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="id" width={60} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload.fullData as RetrievalResult;
                        const chunkContent = chunks.find(c => c.id === data.chunkId)?.content.substring(0, 50) + "...";
                        return (
                          <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl text-xs max-w-xs z-50">
                            <p className="font-bold text-white mb-1">Score: {data.score}</p>
                            <p className="text-gray-300 mb-2 italic">"{chunkContent}"</p>
                            <p className="text-purple-300"><span className="font-semibold">REX:</span> {data.reasoning}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 50 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-sm italic">
              Posez une question pour voir l'analyse REX.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Chat & Interaction */}
      <div className="lg:w-1/2 flex flex-col gap-4">
        
        {/* Chat Window */}
        <div className="flex-1 bg-card rounded-xl border border-gray-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-400">
              <MessageSquare size={20} />
              <h2 className="font-semibold">Assistant RAG</h2>
            </div>
            {loadingStep !== 'idle' && (
              <div className="flex items-center gap-2 text-xs text-yellow-400 animate-pulse">
                <RefreshCw className="animate-spin" size={14} />
                <span className="uppercase font-bold tracking-wider">{loadingStep}...</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center mt-20 text-gray-500">
                <BrainCircuit size={48} className="mx-auto mb-4 opacity-20" />
                <p>Posez une question sur la base de connaissances.</p>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                
                {/* REX: Source Citation */}
                {msg.relatedChunks && msg.relatedChunks.length > 0 && (
                  <div className="mt-2 max-w-[85%] space-y-1">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Sources utilisées (Contexte) :</p>
                    {msg.relatedChunks.map((chunk, cIdx) => (
                      <div key={cIdx} className="bg-gray-900/50 border-l-2 border-green-500 p-2 text-xs text-gray-400 rounded-r">
                         <div className="flex justify-between mb-1">
                            <span className="font-mono text-green-400 font-bold">{chunk.id}</span>
                            <span className="text-gray-600">Pertinence: {chunk.score}/100</span>
                         </div>
                         <p className="italic opacity-80 line-clamp-2">"{chunk.content}"</p>
                         {/* REX Reasoning Tooltip-ish */}
                         <p className="mt-1 text-purple-400/80 block">REX: {chunk.reasoning}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-800/30 border-t border-gray-700">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ex: Qu'est-ce que le RAG ?"
                className="w-full bg-gray-900 border border-gray-600 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={loadingStep !== 'idle'}
              />
              <button
                onClick={handleSearch}
                disabled={loadingStep !== 'idle' || !query.trim()}
                className="absolute right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RagSimulator;