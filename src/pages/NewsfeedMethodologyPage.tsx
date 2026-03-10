import { ScanSearch, FileEdit, Newspaper, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MethodologyStep {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  shadowColor: string;
}

const steps: MethodologyStep[] = [
  {
    title: 'Scan',
    description: 'Using Artificial Intelligence, Hilex newsfeeds scan recent news articles, social media posts, and videos from reliable sources based on user input',
    icon: ScanSearch,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
  },
  {
    title: 'Rewrite',
    description: 'Our custom AI packages this raw information into a digestible format, citing sources and giving you custom data',
    icon: FileEdit,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
  },
];

export default function NewsfeedMethodologyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/documentation')}
        className="group flex items-center gap-2 px-4 py-2 mb-6 text-slate-300 hover:text-white transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm font-medium">Back to Education Centre</span>
      </button>
      <div className="text-center mb-16 pt-8">
        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-teal-500/20 rounded-3xl mb-8 backdrop-blur-sm border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/30 animate-pulse">
          <Newspaper className="w-16 h-16 text-cyan-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent leading-tight">
          Find out how our AIs find relevant data
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 mb-12">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 ${step.borderColor} shadow-xl ${step.shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative">
                <div className="flex items-start gap-6 mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg ${step.shadowColor} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-r ${step.gradient} text-white font-bold text-xs mb-2`}>
                      STEP {index + 1}
                    </div>
                    <h3 className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <p className="text-slate-300 text-base leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate('/ai-newsfeed')}
          className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white text-lg shadow-xl shadow-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105 flex items-center gap-3"
        >
          <span>See Newsfeed in Action</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
