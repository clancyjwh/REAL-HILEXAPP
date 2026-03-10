import { Puzzle, Database, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InfoCard {
  title: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  content: React.ReactNode;
}

const infoCards: InfoCard[] = [
  {
    title: 'What are Bespoke Projects?',
    icon: Puzzle,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <p className="text-slate-300 text-base leading-relaxed">
        Bespoke projects involve applying our advanced analysis model to your custom data.
        Whether you have your own datasets or need us to source them, Hilex will run our
        proprietary analysis engine to identify historical patterns and trends, empowering
        you to make informed, data-driven decisions for your business ventures.
      </p>
    ),
  },
  {
    title: 'What Data Do We Analyze?',
    icon: Database,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
    content: (
      <div className="text-slate-300 text-base leading-relaxed">
        <p className="mb-4">
          Anything you need. Our flexible analysis framework adapts to various data types and industries:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-400">
          <li>Real Estate</li>
          <li>Private Equity</li>
          <li>Commodities</li>
          <li>And much more</li>
        </ul>
      </div>
    ),
  },
];

export default function BespokeProjectsInfoPage() {
  const navigate = useNavigate();

  const handleRequestProject = () => {
    navigate('/bespoke-projects');
  };

  return (
    <div className="min-h-screen pb-12">
      <button
        onClick={() => navigate('/documentation/projects-updates')}
        className="group flex items-center gap-2 px-4 py-2 mb-6 text-slate-300 hover:text-white transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm font-medium">Back to Projects & Updates</span>
      </button>

      <div className="text-center mb-16 pt-8">
        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-emerald-500/20 rounded-3xl mb-8 backdrop-blur-sm border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/30 animate-pulse">
          <Puzzle className="w-16 h-16 text-cyan-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent leading-tight">
          Bespoke Projects
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto font-medium">
          Custom analysis solutions tailored to your unique business needs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto px-4 mb-12">
        {infoCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 ${card.borderColor} shadow-xl ${card.shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-105`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative">
                <div className="flex items-start gap-6 mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadowColor} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                      {card.title}
                    </h3>
                  </div>
                </div>

                <div className="group-hover:text-slate-200 transition-colors duration-300">
                  {card.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleRequestProject}
          className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white text-lg shadow-xl shadow-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105 flex items-center gap-3"
        >
          <span>Request Bespoke Project</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
