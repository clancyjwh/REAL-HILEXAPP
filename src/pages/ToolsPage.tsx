import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, BarChart3, Newspaper, Percent, Linkedin, Zap, LineChart, Send } from 'lucide-react';
import { features } from '../config/features';
import { useAuth } from '../contexts/AuthContext';
import Disclaimer from '../components/Disclaimer';
import PremiumBadge from '../components/PremiumBadge';

const TOOL_CARD_BASE = `
  group relative overflow-hidden rounded-xl p-8 text-left transition-all duration-300 border
`;

const glassCard = `${TOOL_CARD_BASE} cursor-pointer`
  .trim();

const lockedCard = `${TOOL_CARD_BASE} opacity-50 cursor-not-allowed`
  .trim();

interface ToolCardProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  borderHover: string;
  shadowColor: string;
  title: string;
  description: string;
  enabled: boolean;
  premium?: boolean;
  onClick: () => void;
}

function ToolCard({ icon, iconColor, iconBg, borderHover, shadowColor, title, description, enabled, premium, onClick }: ToolCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`${enabled ? glassCard : lockedCard} ${enabled ? borderHover : ''}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.08)',
        ...(enabled ? {} : {}),
      }}
      onMouseEnter={e => {
        if (!enabled) return;
        (e.currentTarget as HTMLElement).style.boxShadow = shadowColor;
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLElement).style.borderColor = '';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.transform = 'none';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      {premium && <PremiumBadge />}
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 ${iconBg} rounded-xl transition-all duration-200 group-hover:scale-110`}>
          {icon}
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed mb-5">{description}</p>
      {enabled && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide" style={{ color: '#00D8FF' }}>
          Launch →
        </span>
      )}
    </button>
  );
}

export default function ToolsPage() {
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(0,216,255,0.1)' }}>
            <Activity className="w-6 h-6" style={{ color: '#00D8FF' }} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Analytics & Trading Tools</h1>
            <p className="text-slate-400 mt-1">Access advanced analytics and trading tools</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.showHorizonOptimizer && (
          <ToolCard
            icon={<Activity className="w-7 h-7 text-violet-400" />}
            iconColor="text-violet-400"
            iconBg="bg-violet-500/10"
            borderHover="hover:border-violet-500/40"
            shadowColor="0 8px 30px rgba(139,92,246,0.25)"
            title="Horizon Optimizer"
            description="Explore historical parameter performance across timeframes."
            enabled={isPremium}
            premium={!isPremium}
            onClick={() => isPremium && navigate('/tools/horizon')}
          />
        )}

        <ToolCard
          icon={<TrendingUp className="w-7 h-7 text-amber-400" />}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
          borderHover="hover:border-amber-500/40"
          shadowColor="0 8px 30px rgba(245,158,11,0.25)"
          title="Technical Indicators"
          description="Analyze assets by optimized technical indicators."
          enabled={isPremium}
          premium={!isPremium}
          onClick={() => isPremium && navigate('/tools/analysis')}
        />

        <ToolCard
          icon={<BarChart3 className="w-7 h-7 text-blue-400" />}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
          borderHover="hover:border-blue-500/40"
          shadowColor="0 8px 30px rgba(59,130,246,0.25)"
          title="Relative Value Index"
          description="Compare asset relative values across categories."
          enabled={isPremium}
          premium={!isPremium}
          onClick={() => isPremium && navigate('/tools/relative-value-index')}
        />

        <ToolCard
          icon={<Newspaper className="w-7 h-7" style={{ color: '#00D8FF' }} />}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10"
          borderHover="hover:border-cyan-500/40"
          shadowColor="0 8px 30px rgba(0,216,255,0.25)"
          title="AI Newsfeed"
          description="Find market consensus, relevant headlines, and movers for any asset."
          enabled={isPremium}
          premium={!isPremium}
          onClick={() => isPremium && navigate('/tools/ai-newsfeed')}
        />

        <ToolCard
          icon={<Percent className="w-7 h-7 text-pink-400" />}
          iconColor="text-pink-400"
          iconBg="bg-pink-500/10"
          borderHover="hover:border-pink-500/40"
          shadowColor="0 8px 30px rgba(236,72,153,0.25)"
          title="Interest Rates"
          description="Compare central bank interest rates across countries."
          enabled={isPremium}
          premium={!isPremium}
          onClick={() => isPremium && navigate('/tools/interest-rates')}
        />

        <ToolCard
          icon={<Zap className="w-7 h-7 text-emerald-400" />}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
          borderHover="hover:border-emerald-500/40"
          shadowColor="0 8px 30px rgba(16,185,129,0.25)"
          title="Zero Day Options"
          description="Analyze ultra-short-term options strategies with minute-level precision."
          enabled={isPremium}
          premium={!isPremium}
          onClick={() => isPremium && navigate('/tools/zero-day-options')}
        />

        <ToolCard
          icon={<TrendingUp className="w-7 h-7 text-blue-400" />}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
          borderHover="hover:border-blue-500/40"
          shadowColor="0 8px 30px rgba(59,130,246,0.25)"
          title="Event Forecasting"
          description="Predict real-world outcomes including elections, sports, price targets, and policy events."
          enabled={isPremium}
          premium={!isPremium}
          onClick={() => isPremium && navigate('/tools/event-forecasting')}
        />

        <ToolCard
          icon={<LineChart className="w-7 h-7 text-orange-400" />}
          iconColor="text-orange-400"
          iconBg="bg-orange-500/10"
          borderHover="hover:border-orange-500/40"
          shadowColor="0 8px 30px rgba(249,115,22,0.25)"
          title="Price Direction Forecast"
          description="Generate price forecasts for assets across multiple timeframes."
          enabled={isPremium}
          premium={!isPremium}
          onClick={() => isPremium && navigate('/tools/price-forecasting')}
        />
      </div>

      <Disclaimer />

      <div className="mt-8 flex items-center justify-center gap-6">
        <a
          href="https://www.linkedin.com/search/results/all/?fetchDeterministicClustersOnly=true&heroEntityKey=urn%3Ali%3Aorganization%3A109950133&keywords=hylex%20optimized%20trends&origin=RICH_QUERY_SUGGESTION&position=0&searchId=193d177c-9b19-4dbf-b348-64d3c5bba970&sid=PLZ&spellCorrectionEnabled=false"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 transition-colors text-sm"
          style={{ color: '#94a3b8' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#00D8FF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          <Linkedin className="w-5 h-5" />
          <span>Follow us on LinkedIn!</span>
        </a>
        <a
          href="https://x.com/HilEX_Optimized"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 transition-colors text-sm"
          style={{ color: '#94a3b8' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#00D8FF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          <span className="w-5 h-5 flex items-center justify-center font-bold text-lg">𝕏</span>
          <span>Follow us on X!</span>
        </a>
        <a
          href="https://t.me/HilexOptimizedTrendsUpdatebot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 transition-colors text-sm"
          style={{ color: '#94a3b8' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#00D8FF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          <Send className="w-5 h-5" />
          <span>Join our Telegram for daily updates!</span>
        </a>
      </div>
    </>
  );
}
