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

const glassCard = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.08)',
};

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  accentColor: string;
  glowColor: string;
  items: string[];
  formatter: (text: string) => string;
  bullet?: string;
}

function SectionCard({ icon, title, accentColor, items, formatter, bullet }: SectionCardProps) {
  return (
    <div className="rounded-xl p-6" style={glassCard}>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg" style={{ background: `${accentColor}18` }}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: accentColor }}
            />
            <span className="text-slate-300 text-sm leading-relaxed">{formatter(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
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
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('type', 'daily_insights')
        .eq('is_read', false);
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
      year: 'numeric',
    });
  };

  const formatText = (text: string) => text.replace(/Rate_of_Change/g, 'ROC');

  if (loading) {
    return (
      <div className="min-h-screen pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-[#00D8FF]" />
          <p className="text-slate-400 text-sm">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(0,216,255,0.1)' }}>
            <Newspaper className="w-6 h-6" style={{ color: '#00D8FF' }} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Daily Insights</h1>
        </div>
        <p className="text-slate-400 ml-[52px] text-sm">Professional market analysis delivered daily</p>
      </div>

      {insights.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={glassCard}>
          <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No insights available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {insights.map((insight) => (
            <div key={insight.id} className="space-y-5">
              {/* Date badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: 'rgba(0,216,255,0.08)', border: '1px solid rgba(0,216,255,0.2)', color: '#00D8FF' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D8FF] animate-pulse" />
                {formatDate(insight.run_date)}
              </div>

              {/* Top Mover — hero card */}
              <div
                className="rounded-xl p-7 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,216,255,0.08) 0%, rgba(0,216,255,0.02) 100%)',
                  border: '1px solid rgba(0,216,255,0.25)',
                  boxShadow: '0 0 40px rgba(0,216,255,0.06)',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-48 h-48 opacity-5 rounded-full"
                  style={{ background: '#00D8FF', filter: 'blur(40px)', transform: 'translate(20%,-20%)' }}
                />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(0,216,255,0.12)' }}>
                    <TrendingUp className="w-5 h-5" style={{ color: '#00D8FF' }} />
                  </div>
                  <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: '#00D8FF' }}>
                    Top Mover
                  </span>
                </div>
                <p className="text-4xl font-bold text-white tracking-tight">{formatText(insight.top_mover)}</p>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {insight.strongest_signals?.length > 0 && (
                  <SectionCard
                    icon={<Zap className="w-4 h-4 text-amber-400" />}
                    title="Strongest Signals"
                    accentColor="#f59e0b"
                    glowColor="rgba(245,158,11,0.15)"
                    items={insight.strongest_signals}
                    formatter={formatText}
                  />
                )}

                {insight.assets_to_watch?.length > 0 && (
                  <SectionCard
                    icon={<Eye className="w-4 h-4" style={{ color: '#00D8FF' }} />}
                    title="Assets to Watch"
                    accentColor="#00D8FF"
                    glowColor="rgba(0,216,255,0.1)"
                    items={insight.assets_to_watch}
                    formatter={formatText}
                  />
                )}

                {insight.weekly_winners?.length > 0 && (
                  <SectionCard
                    icon={<Award className="w-4 h-4 text-emerald-400" />}
                    title="Weekly Winners"
                    accentColor="#10b981"
                    glowColor="rgba(16,185,129,0.12)"
                    items={insight.weekly_winners}
                    formatter={formatText}
                  />
                )}

                {insight.weekly_laggers?.length > 0 && (
                  <SectionCard
                    icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
                    title="Weekly Laggards"
                    accentColor="#f87171"
                    glowColor="rgba(248,113,113,0.12)"
                    items={insight.weekly_laggers}
                    formatter={formatText}
                  />
                )}

                {insight.consensus_signals?.length > 0 && (
                  <SectionCard
                    icon={<Target className="w-4 h-4 text-violet-400" />}
                    title="Consensus Signals"
                    accentColor="#a78bfa"
                    glowColor="rgba(167,139,250,0.12)"
                    items={insight.consensus_signals}
                    formatter={formatText}
                  />
                )}

                {insight.rare_events?.length > 0 && (
                  <div
                    className="rounded-xl p-6 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(251,191,36,0.02) 100%)',
                      border: '1px solid rgba(251,191,36,0.25)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.12)' }}>
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Rare Events</h3>
                      <span
                        className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}
                      >
                        ⚡ Notable
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {insight.rare_events.map((event, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-yellow-400" />
                          <span className="text-slate-300 text-sm leading-relaxed">{formatText(event)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {insights.length > 0 && (
        <div className="mt-10 text-center">
          <p className="text-slate-600 text-xs">
            Note: Daily insights may be delayed; values above may reflect slightly older analyses
          </p>
        </div>
      )}
    </div>
  );
}
