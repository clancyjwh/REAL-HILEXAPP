import { Bell, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
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
    title: 'What are Bespoke Updates?',
    icon: Bell,
    gradient: 'from-fuchsia-500 to-violet-600',
    borderColor: 'border-fuchsia-400/60',
    shadowColor: 'shadow-fuchsia-500/50',
    content: (
      <p className="text-slate-300 text-base leading-relaxed">
        Use our AI news-scanning technology to find relevant, timely, and important updates
        regarding your specific projects and interests.
      </p>
    ),
  },
  {
    title: 'Case Study',
    icon: BookOpen,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    content: (
      <p className="text-slate-300 text-base leading-relaxed">
        A housing developer needed real-time updates on British Columbia laws, grant opportunities,
        funding sources, and regulatory changes. Rather than dedicating valuable team hours to manual
        research, they leveraged our bespoke updates feature to receive weekly digests directly to
        their inbox. This automated solution delivered timely information on funding opportunities
        and legislative changes, enabling the team to focus on growing their project while staying
        fully informed on critical business developments.
      </p>
    ),
  },
];

export default function BespokeUpdatesInfoPage() {
  const navigate = useNavigate();

  const handleRequestUpdates = () => {
    navigate('/bespoke-updates');
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
        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-fuchsia-500/20 via-violet-500/20 to-cyan-500/20 rounded-3xl mb-8 backdrop-blur-sm border-2 border-fuchsia-400/40 shadow-2xl shadow-fuchsia-500/30 animate-pulse">
          <Bell className="w-16 h-16 text-fuchsia-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
          Bespoke Updates
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto font-medium">
          Stay ahead with AI-powered, personalized business intelligence
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
          onClick={handleRequestUpdates}
          className="group relative px-8 py-4 bg-gradient-to-r from-fuchsia-500 to-violet-600 rounded-xl font-semibold text-white text-lg shadow-xl shadow-fuchsia-500/50 hover:shadow-2xl hover:shadow-fuchsia-500/70 transition-all duration-300 hover:scale-105 flex items-center gap-3"
        >
          <span>Request Bespoke Updates</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
