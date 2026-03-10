import { ArrowLeft, MessageCircle, HelpCircle, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InfoCard {
  title: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  content: React.ReactNode;
}

const chatbotCards: InfoCard[] = [
  {
    title: 'What It Does',
    icon: MessageCircle,
    gradient: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-400/60',
    shadowColor: 'shadow-green-500/50',
    content: (
      <div className="space-y-3">
        <p className="text-slate-300 text-base leading-relaxed">
          The chatbot is trained on all Hilex educational content. Ask it anything about technical indicators, trading concepts, or how our platform works.
        </p>
      </div>
    ),
  },
  {
    title: 'What to Ask',
    icon: HelpCircle,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-cyan-500">
            <h4 className="text-white font-semibold mb-2 text-sm">Indicator explanations</h4>
            <p className="text-slate-400 text-sm italic">"What is MACD?"</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="text-white font-semibold mb-2 text-sm">Definition help</h4>
            <p className="text-slate-400 text-sm italic">"What does historical accuracy mean?"</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-cyan-500">
            <h4 className="text-white font-semibold mb-2 text-sm">Strategy questions</h4>
            <p className="text-slate-400 text-sm italic">"How do I read the Signal Score?"</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'How It Works',
    icon: Lightbulb,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-400/60',
    shadowColor: 'shadow-amber-500/50',
    content: (
      <div className="space-y-3">
        <p className="text-slate-300 text-base leading-relaxed">
          Type your question in plain English. The bot searches our documentation and explains concepts in beginner-friendly language.
        </p>
      </div>
    ),
  },
];

export default function ChatbotPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/documentation')}
        className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 mb-8 hover:gap-3"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Documentation</span>
      </button>

      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl mb-6 backdrop-blur-sm border-2 border-green-400/40 shadow-2xl shadow-green-500/30">
          <MessageCircle className="w-14 h-14 text-green-400" />
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Hilex Chatbot
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Get instant answers to your questions about technical indicators and trading concepts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-12">
        {chatbotCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 ${card.borderColor} shadow-xl ${card.shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadowColor}`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{card.title}</h2>
              </div>
              <div>{card.content}</div>
            </div>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 border-green-400/60 shadow-xl shadow-green-500/50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl mb-6 backdrop-blur-sm border border-green-400/40">
              <MessageCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Coming Soon</h3>
            <p className="text-slate-300 text-lg leading-relaxed">
              Our AI-powered chatbot is currently in development. Soon you'll be able to ask questions directly and get instant, personalized answers about all things Hilex.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
