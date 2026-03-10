import { Puzzle, Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectUpdateTool {
  name: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  route: string;
}

const projectTools: ProjectUpdateTool[] = [
  {
    name: 'Bespoke Projects',
    icon: Puzzle,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    route: '/documentation/bespoke-projects',
  },
  {
    name: 'Bespoke Updates',
    icon: Bell,
    gradient: 'from-fuchsia-500 to-violet-600',
    borderColor: 'border-fuchsia-400/60',
    shadowColor: 'shadow-fuchsia-500/50',
    route: '/documentation/bespoke-updates',
  },
];

export default function ProjectsUpdatesPage() {
  const navigate = useNavigate();

  const handleToolClick = (route: string) => {
    navigate(route);
  };

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
        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/20 to-violet-500/20 rounded-3xl mb-8 backdrop-blur-sm border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/30 animate-pulse">
          <Puzzle className="w-16 h-16 text-cyan-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent leading-tight">
          Projects & Updates
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto font-medium">
          Explore custom projects and stay informed with tailored updates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto px-4">
        {projectTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.name}
              onClick={() => handleToolClick(tool.route)}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 ${tool.borderColor} shadow-xl ${tool.shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 text-left`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg ${tool.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  {tool.name}
                </h3>

                <div className={`inline-flex items-center text-sm font-semibold text-transparent bg-gradient-to-r ${tool.gradient} bg-clip-text group-hover:translate-x-2 transition-transform duration-300`}>
                  Learn More →
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
