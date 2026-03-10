import { useNavigate } from 'react-router-dom';
import { MessageSquare, TrendingUp, LineChart, Bitcoin, DollarSign, BarChart3, Linkedin, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PremiumBadge from '../components/PremiumBadge';

interface Chatroom {
  id: string;
  name: string;
  description: string;
}

interface ChatroomOption extends Chatroom {
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
}

export default function ChatroomPage() {
  const navigate = useNavigate();
  const { isPremium } = useAuth();
  const [chatrooms, setChatrooms] = useState<ChatroomOption[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap: Record<string, { icon: React.ElementType; gradient: string; borderColor: string }> = {
    'General Chat': { icon: MessageSquare, gradient: 'from-blue-500 to-cyan-600', borderColor: 'border-blue-400/60' },
    'News & Top Movers': { icon: TrendingUp, gradient: 'from-green-500 to-emerald-600', borderColor: 'border-green-400/60' },
    'Strategies & Backtesting': { icon: LineChart, gradient: 'from-orange-500 to-red-600', borderColor: 'border-orange-400/60' },
    'Crypto': { icon: Bitcoin, gradient: 'from-amber-500 to-yellow-600', borderColor: 'border-amber-400/60' },
    'Forex': { icon: DollarSign, gradient: 'from-teal-500 to-cyan-600', borderColor: 'border-teal-400/60' },
    'Stocks & Commodities': { icon: BarChart3, gradient: 'from-violet-500 to-purple-600', borderColor: 'border-violet-400/60' },
  };

  useEffect(() => {
    loadChatrooms();
  }, []);

  const loadChatrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chatrooms')
        .select('id, name, description')
        .order('name');

      if (error) throw error;

      const chatroomsWithIcons = (data || []).map(room => ({
        ...room,
        icon: iconMap[room.name]?.icon || MessageSquare,
        gradient: iconMap[room.name]?.gradient || 'from-slate-500 to-slate-600',
        borderColor: iconMap[room.name]?.borderColor || 'border-slate-400/60',
      }));

      setChatrooms(chatroomsWithIcons);
    } catch (error) {
      console.error('Error loading chatrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatroomClick = (chatroomId: string) => {
    navigate(`/chatroom/${chatroomId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-12 flex items-center justify-center">
        <div className="text-white">Loading chatrooms...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <MessageSquare className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Chatrooms</h1>
            <p className="text-slate-400">Join a community discussion</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatrooms.map((chatroom) => {
          const Icon = chatroom.icon;
          return (
            <button
              key={chatroom.id}
              onClick={() => isPremium && handleChatroomClick(chatroom.id)}
              disabled={!isPremium}
              className={`group relative bg-slate-900 border ${chatroom.borderColor} rounded-xl p-6 transition-all duration-200 text-left ${
                isPremium
                  ? 'hover:bg-slate-800 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              {!isPremium && <PremiumBadge />}
              <div className="mb-4">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${chatroom.gradient}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                {chatroom.name}
              </h3>
              <p className="text-slate-400 text-sm">
                {chatroom.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Active now</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-12 bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Chatroom Guidelines</h2>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-1">•</span>
            <span>Be respectful and courteous to all community members</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-1">•</span>
            <span>No spam, promotional content, or self-promotion</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-1">•</span>
            <span>Stay on topic within each chatroom</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-1">•</span>
            <span>No financial advice - share insights and ideas only</span>
          </li>
        </ul>
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
