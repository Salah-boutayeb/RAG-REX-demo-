import React, { useState } from 'react';
import { Database, Brain, Layers, Search, BookOpen, PlayCircle } from 'lucide-react';
import ConceptCard from './components/ConceptCard';
import RagSimulator from './components/RagSimulator';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LEARN);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Layers className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              RAG & REX <span className="text-gray-500 font-normal hidden sm:inline">| Explorer</span>
            </h1>
          </div>
          
          <nav className="flex gap-2">
            <button
              onClick={() => setMode(AppMode.LEARN)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === AppMode.LEARN 
                  ? 'bg-gray-800 text-white border border-gray-600' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <BookOpen size={16} />
              <span className="hidden sm:inline">Comprendre</span>
            </button>
            <button
              onClick={() => setMode(AppMode.EXPERIMENT)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === AppMode.EXPERIMENT 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <PlayCircle size={16} />
              <span>Expérimenter</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {mode === AppMode.LEARN ? (
          <div className="space-y-12 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-4xl font-bold text-white tracking-tight">
                Donnez un cerveau à vos données
              </h2>
              <p className="text-lg text-gray-400">
                Découvrez comment le RAG (Retrieval-Augmented Generation) permet aux IA d'accéder à vos informations en temps réel, et comment le REX (Retrieval-Enhanced Explanation) rend ce processus transparent.
              </p>
            </div>

            {/* Concepts Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <ConceptCard
                title="1. Récupération (Retrieval)"
                description="Le système recherche les informations les plus pertinentes dans votre base de connaissances en fonction de la question de l'utilisateur."
                icon={<Search size={24} />}
                color="blue"
              />
              <ConceptCard
                title="2. Augmentation"
                description="Les informations trouvées sont injectées dans le contexte du modèle (prompt) pour lui fournir les éléments de réponse nécessaires."
                icon={<Database size={24} />}
                color="green"
              />
              <ConceptCard
                title="3. Génération"
                description="Le modèle (LLM) utilise ces informations précises pour rédiger une réponse naturelle, fiable et sans hallucinations."
                icon={<Brain size={24} />}
                color="purple"
              />
            </div>

            {/* Deep Dive into REX */}
            <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-purple-400">REX</span> : Pourquoi l'explication est-elle clé ?
              </h3>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4 text-gray-300">
                  <p>
                    <strong>REX (Retrieval-Enhanced Explanation)</strong> est une couche de transparence ajoutée au RAG. Au lieu de simplement répondre, le système :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>Identifie les sources exactes utilisées.</li>
                    <li>Explique <em>pourquoi</em> ces documents sont pertinents pour la question.</li>
                    <li>Permet de vérifier la fiabilité de la réponse (Fact-Checking).</li>
                  </ul>
                  <p className="text-sm mt-4 text-gray-400 italic">
                    Passez en mode "Expérimenter" pour voir le REX en action via les scores de pertinence et les justifications.
                  </p>
                </div>
                <div className="w-full md:w-1/3 bg-gray-900 rounded-xl p-4 border border-gray-800 font-mono text-xs text-green-400 shadow-inner">
                  <div className="mb-2 text-gray-500">// Exemple de sortie REX</div>
                  <div className="mb-2">Document #12: Score 95%</div>
                  <div className="pl-4 border-l border-gray-700 mb-2 text-gray-300">
                    "La capitale de la France est Paris..."
                  </div>
                  <div className="text-purple-400">
                    REX: Ce document contient la réponse directe à la question "Quelle est la capitale ?"
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
               <button 
                 onClick={() => setMode(AppMode.EXPERIMENT)}
                 className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:scale-105"
               >
                 Lancer la Démo Interactive
               </button>
            </div>
          </div>
        ) : (
          /* EXPERIMENT MODE */
          <div className="h-[calc(100vh-8rem)] animate-fade-in">
             <RagSimulator />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;