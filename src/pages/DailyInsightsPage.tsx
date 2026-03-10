import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Newspaper, TrendingUp, Eye, Award, AlertTriangle, Target, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DailyInsight {
  id: number;
  run_date: string;
  top_mover: string;
  strongest_signals: string[];
  assets_to_watch: string[];
  weekly_winners: string[];
  weekly_laggers: string[];
  consensus_signals: string[];
  rare_events: string[];
  created_at: string;
}

export default function DailyInsightsPage() {
  const [insights, setInsights] = useState<DailyInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadInsights();
    markNotificationsAsRead();
  }, [user]);

  const loadInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_insights')
        .select('*')
        .order('run_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      setInsights(data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('type', 'daily_insights')
        .eq('is_read', false);

      if (error) {
        console.error('Error marking notifications as read:', error);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatText = (text: string) => {
    return text.replace(/Rate_of_Change/g, 'ROC');
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-12 flex items-center justify-center">
        <div className="text-white">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-500/10 rounded-lg">
            <Newspaper className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">Daily Insights</h1>
        </div>
        <p className="text-slate-400 ml-[52px]">Professional market analysis delivered daily</p>
      </div>

      {insights.length === 0 ? (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-12 text-center">
          <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No insights available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-16">
          {insights.map((insight) => (
            <div key={insight.id} className="space-y-6">
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Run Date: {formatDate(insight.run_date)}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 border-l-4 border-l-blue-500 rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">Top Mover</h2>
                </div>
                <p className="text-3xl font-bold text-blue-400">{formatText(insight.top_mover)}</p>
              </div>

              {insight.strongest_signals && insight.strongest_signals.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <h3 className="text-xl font-bold text-white">Strongest Signals</h3>
                  </div>
                  <ul className="space-y-2">
                    {insight.strongest_signals.map((signal, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-400 mt-1">•</span>
                        <span className="text-slate-300 text-base leading-relaxed">{formatText(signal)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insight.assets_to_watch && insight.assets_to_watch.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xl font-bold text-white">Assets to Watch</h3>
                  </div>
                  <ul className="space-y-2">
                    {insight.assets_to_watch.map((asset, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span className="text-slate-300 text-base leading-relaxed">{formatText(asset)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(insight.weekly_winners?.length > 0 || insight.weekly_laggers?.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {insight.weekly_winners && insight.weekly_winners.length > 0 && (
                    <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 shadow-md">
                      <div className="flex items-center gap-3 mb-4">
                        <Award className="w-5 h-5 text-green-400" />
                        <h3 className="text-xl font-bold text-white">Weekly Winners</h3>
                      </div>
                      <ul className="space-y-2">
                        {insight.weekly_winners.map((winner, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            <span className="text-slate-300 text-base leading-relaxed">{formatText(winner)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insight.weekly_laggers && insight.weekly_laggers.length > 0 && (
                    <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 shadow-md">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="text-xl font-bold text-white">Weekly Laggards</h3>
                      </div>
                      <ul className="space-y-2">
                        {insight.weekly_laggers.map((lagger, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>
                            <span className="text-slate-300 text-base leading-relaxed">{formatText(lagger)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {insight.consensus_signals && insight.consensus_signals.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-5 h-5 text-violet-400" />
                    <h3 className="text-xl font-bold text-white">Consensus Signals</h3>
                  </div>
                  <ul className="space-y-2">
                    {insight.consensus_signals.map((signal, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-violet-400 mt-1">•</span>
                        <span className="text-slate-300 text-base leading-relaxed">{formatText(signal)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insight.rare_events && insight.rare_events.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 border-l-4 border-l-yellow-500 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold text-white">Rare Events</h3>
                  </div>
                  <ul className="space-y-2">
                    {insight.rare_events.map((event, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span className="text-slate-300 text-base leading-relaxed">{formatText(event)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {insights.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Note: Daily insights may be delayed; the values above may reflect slightly older analyses
          </p>
        </div>
      )}
    </div>
  );
}
