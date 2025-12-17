import React from 'react';

interface ConceptCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ title, description, icon, color }) => {
  return (
    <div className={`p-6 rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm hover:border-${color}-500 transition-all duration-300 group`}>
      <div className={`w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center mb-4 text-${color}-400 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default ConceptCard;