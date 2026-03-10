import { useNavigate } from 'react-router-dom';
import { Activity, TrendingUp, BarChart3, Newspaper, Percent, Linkedin, Zap, LineChart, Send } from 'lucide-react';
import { features } from '../config/features';
import { useAuth } from '../contexts/AuthContext';
import Disclaimer from '../components/Disclaimer';
import PremiumBadge from '../components/PremiumBadge';

export default function ToolsPage() {
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Activity className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Tools</h1>
            <p className="text-slate-400">Access advanced analytics and trading tools</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.showHorizonOptimizer && (
          <button
            onClick={() => isPremium && navigate('/tools/horizon')}
            disabled={!isPremium}
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 text-left transition-all duration-300 ${
              isPremium
                ? 'hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer'
                : 'opacity-60 cursor-not-allowed'
            }`}
          >
            {!isPremium && <PremiumBadge />}
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-violet-500/10 rounded-lg group-hover:bg-violet-500/20 transition-colors">
                <Activity className="w-8 h-8 text-violet-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Horizon Optimizer</h2>
            </div>
            <p className="text-slate-400">
              Explore Historical Parameter Performance
            </p>
          </button>
        )}

        <button
          onClick={() => isPremium && navigate('/tools/analysis')}
          disabled={!isPremium}
          className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 text-left transition-all duration-300 ${
            isPremium
              ? 'hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer'
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          {!isPremium && <PremiumBadge />}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Technical Indicators</h2>
          </div>
          <p className="text-slate-400">
            Analyze Assets by Indicators
          </p>
        </button>

        <button
          onClick={() => isPremium && navigate('/tools/relative-value-index')}
          disabled={!isPremium}
          className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 text-left transition-all duration-300 ${
            isPremium
              ? 'hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer'
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          {!isPremium && <PremiumBadge />}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Relative Value Index</h2>
          </div>
          <p className="text-slate-400">
            Compare asset relative values
          </p>
        </button>

        <button
          onClick={() => isPremium && navigate('/tools/ai-newsfeed')}
          disabled={!isPremium}
          className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 text-left transition-all duration-300 ${
            isPremium
              ? 'hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer'
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          {!isPremium && <PremiumBadge />}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
              <Newspaper className="w-8 h-8 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">AI Newsfeed</h2>
          </div>
          <p className="text-slate-400">
            Find market consensus, relevant headlines, market movers and more for any asset
          </p>
        </button>

        <button
          onClick={() => isPremium && navigate('/tools/interest-rates')}
          disabled={!isPremium}
          className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 text-left transition-all duration-300 ${
            isPremium
              ? 'hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/20 cursor-pointer'
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          {!isPremium && <PremiumBadge />}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
              <Percent className="w-8 h-8 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Interest Rates</h2>
          </div>
          <p className="text-slate-400">
            Compare central bank interest rates across countries
          </p>
        </button>

        <button
          onClick={() => isPremium && navigate('/tools/zero-day-options')}
          disabled={!isPremium}
          className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 text-left transition-all duration-300 ${
            isPremium
              ? 'hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer'
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          {!isPremium && <PremiumBadge />}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <Zap className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Zero Day Options</h2>
          </div>
          <p className="text-slate-400">
            Analyze ultra-short-term options strategies with minute-level precision
          </p>
        </button>

        <button
          onClick={() => isPremium && navigate('/tools/event-forecasting')}
          disabled={!isPremium}
          className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 text-left transition-all duration-300 ${
            isPremium
              ? 'hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer'
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          {!isPremium && <PremiumBadge />}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Event Forecasting</h2>
          </div>
          <p className="text-slate-400">
            Predict real-world outcomes including elections, sports, price targets, and policy events
          </p>
        </button>

        <button
          onClick={() => isPremium && navigate('/tools/price-forecasting')}
          disabled={!isPremium}
          className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 text-left transition-all duration-300 ${
            isPremium
              ? 'hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer'
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          {!isPremium && <PremiumBadge />}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
              <LineChart className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Price Direction Forecast</h2>
          </div>
          <p className="text-slate-400">
            Generate price forecasts for assets across multiple timeframes
          </p>
        </button>
      </div>

      <Disclaimer />

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
    </>
  );
}
