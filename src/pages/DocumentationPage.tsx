import { BookOpen, TrendingUp, Newspaper, HelpCircle, Activity, Database, Puzzle, Settings, BookText, MessageCircle, Linkedin, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DocumentationTopic {
  title: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  description: string;
}

const topics: DocumentationTopic[] = [
  {
    title: 'Indicators',
    icon: Activity,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400/60',
    shadowColor: 'shadow-cyan-500/50',
    description: 'Understand the technical indicators we track',
  },
  {
    title: 'Newsfeed',
    icon: Newspaper,
    gradient: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-400/60',
    shadowColor: 'shadow-purple-500/50',
    description: 'Discover our AI-powered news aggregation system',
  },
  {
    title: 'FAQs',
    icon: HelpCircle,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400/60',
    shadowColor: 'shadow-emerald-500/50',
    description: 'Find answers to frequently asked questions',
  },
  {
    title: 'Analysis Tools',
    icon: TrendingUp,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-400/60',
    shadowColor: 'shadow-orange-500/50',
    description: 'Learn how our analysis engine evaluates market trends',
  },
  {
    title: 'Asset Data',
    icon: Database,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-400/60',
    shadowColor: 'shadow-blue-500/50',
    description: 'Explore our comprehensive asset database',
  },
  {
    title: 'Optimized Parameters',
    icon: Settings,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-400/60',
    shadowColor: 'shadow-amber-500/50',
    description: 'Learn how we evaluate historically best-performing parameters',
  },
  {
    title: 'Projects/Updates',
    icon: Puzzle,
    gradient: 'from-fuchsia-500 to-violet-600',
    borderColor: 'border-fuchsia-400/60',
    shadowColor: 'shadow-fuchsia-500/50',
    description: 'Stay informed about custom projects and updates',
  },
  {
    title: 'Definitions',
    icon: BookText,
    gradient: 'from-slate-500 to-zinc-600',
    borderColor: 'border-slate-400/60',
    shadowColor: 'shadow-slate-500/50',
    description: 'Comprehensive glossary of all terms and indicators',
  },
  {
    title: 'Hilex Chatbot',
    icon: MessageCircle,
    gradient: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-400/60',
    shadowColor: 'shadow-green-500/50',
    description: 'Ask questions about technical indicators and trading concepts',
  },
];

export default function DocumentationPage() {
  const navigate = useNavigate();

  const handleTopicClick = (topic: string) => {
    if (topic === 'Indicators') {
      navigate('/documentation/indicators');
    } else if (topic === 'Analysis Tools') {
      navigate('/documentation/analysis-tools');
    } else if (topic === 'Newsfeed') {
      navigate('/documentation/newsfeed');
    } else if (topic === 'FAQs') {
      navigate('/documentation/faq');
    } else if (topic === 'Asset Data') {
      navigate('/documentation/asset-data');
    } else if (topic === 'Optimized Parameters') {
      navigate('/documentation/parameter-methodology');
    } else if (topic === 'Projects/Updates') {
      navigate('/documentation/projects-updates');
    } else if (topic === 'Definitions') {
      navigate('/documentation/definitions');
    } else if (topic === 'Hilex Chatbot') {
      navigate('/documentation/chatbot');
    } else {
      console.log(`Navigating to ${topic} documentation`);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="text-center mb-16 pt-8">
        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl mb-8 backdrop-blur-sm border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/30 animate-pulse">
          <BookOpen className="w-16 h-16 text-cyan-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
          Explore how Hilex delivers its analysis
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto font-medium">
          Choose a topic to see the methodology behind our platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <button
              key={topic.title}
              onClick={() => handleTopicClick(topic.title)}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border-2 ${topic.borderColor} shadow-xl ${topic.shadowColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 text-left`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${topic.gradient} shadow-lg ${topic.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                  {topic.title}
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                  {topic.description}
                </p>

                <div className={`mt-6 inline-flex items-center text-sm font-semibold text-transparent bg-gradient-to-r ${topic.gradient} bg-clip-text group-hover:translate-x-2 transition-transform duration-300`}>
                  Learn More →
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <div className="inline-block bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 max-w-3xl">
          <p className="text-slate-300 text-lg leading-relaxed">
            Our documentation is continuously updated to reflect the latest features and methodologies.
            If you have questions that aren't covered here, please reach out to our support team.
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <a
          href="https://www.linkedin.com/search/results/all/?fetchDeterministicClustersOnly=true&heroEntityKey=urn%3Ali%3Aorganization%3A109950133&keywords=hylex%20optimized%20trends&origin=RICH_QUERY_SUGGESTION&position=0&searchId=193d177c-9b19-4dbf-b348-64d3c5bba970&sid=PLZ&spellCorrectionEnabled=false"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
        >
          <Linkedin className="w-5 h-5" />
          <span>Follow us on LinkedIn!</span>
        </a>
        <a
          href="https://x.com/HilEX_Optimized"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
        >
          <span className="w-5 h-5 flex items-center justify-center font-bold text-lg">𝕏</span>
          <span>Follow us on X!</span>
        </a>
        <a
          href="https://t.me/HilexOptimizedTrendsUpdatebot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
        >
          <Send className="w-5 h-5" />
          <span>Join our Telegram for daily updates!</span>
        </a>
      </div>
    </div>
  );
}
