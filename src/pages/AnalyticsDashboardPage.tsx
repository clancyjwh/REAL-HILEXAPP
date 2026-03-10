import { useEffect, useState } from 'react';
import { Activity, Users, Eye, TrendingUp, Clock, MousePointer } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsStats {
  totalPageViews: number;
  uniqueVisitors: number;
  totalEvents: number;
  topPages: Array<{ page_path: string; count: number }>;
  topEvents: Array<{ event_name: string; count: number }>;
  recentActivity: Array<{
    id: string;
    type: 'page_view' | 'event';
    path: string;
    name?: string;
    created_at: string;
  }>;
}

export default function AnalyticsDashboardPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date | null = null;

      if (timeRange === '24h') {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (timeRange === '7d') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === '30d') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const dateFilter = startDate ? `created_at.gte.${startDate.toISOString()}` : '';

      const [pageViewsRes, eventsRes] = await Promise.all([
        supabase
          .from('analytics_page_views')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(100)
          .then(res => dateFilter ? supabase.from('analytics_page_views').select('*', { count: 'exact' }).gte('created_at', startDate!.toISOString()) : res),
        supabase
          .from('analytics_events')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(100)
          .then(res => dateFilter ? supabase.from('analytics_events').select('*', { count: 'exact' }).gte('created_at', startDate!.toISOString()) : res),
      ]);

      const pageViews = pageViewsRes.data || [];
      const events = eventsRes.data || [];

      const uniqueSessions = new Set([
        ...pageViews.map(pv => pv.session_id),
        ...events.map(e => e.session_id),
      ]);

      const pagePathCounts: Record<string, number> = {};
      pageViews.forEach(pv => {
        pagePathCounts[pv.page_path] = (pagePathCounts[pv.page_path] || 0) + 1;
      });

      const eventNameCounts: Record<string, number> = {};
      events.forEach(e => {
        eventNameCounts[e.event_name] = (eventNameCounts[e.event_name] || 0) + 1;
      });

      const topPages = Object.entries(pagePathCounts)
        .map(([page_path, count]) => ({ page_path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topEvents = Object.entries(eventNameCounts)
        .map(([event_name, count]) => ({ event_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const recentActivity = [
        ...pageViews.slice(0, 50).map(pv => ({
          id: pv.id,
          type: 'page_view' as const,
          path: pv.page_path,
          created_at: pv.created_at,
        })),
        ...events.slice(0, 50).map(e => ({
          id: e.id,
          type: 'event' as const,
          path: e.page_path,
          name: e.event_name,
          created_at: e.created_at,
        })),
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);

      setStats({
        totalPageViews: pageViewsRes.count || 0,
        uniqueVisitors: uniqueSessions.size,
        totalEvents: eventsRes.count || 0,
        topPages,
        topEvents,
        recentActivity,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-orange-600" />
          Analytics Dashboard
        </h1>

        <div className="flex gap-2">
          {(['24h', '7d', '30d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7d' : range === '30d' ? 'Last 30d' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-blue-500" />
            <h3 className="text-slate-300 font-medium">Total Page Views</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalPageViews.toLocaleString()}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <h3 className="text-slate-300 font-medium">Unique Visitors</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.uniqueVisitors.toLocaleString()}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <MousePointer className="w-5 h-5 text-orange-500" />
            <h3 className="text-slate-300 font-medium">Total Events</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalEvents.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3 className="text-xl font-semibold text-white">Top Pages</h3>
          </div>
          <div className="space-y-3">
            {stats.topPages.map((page, index) => (
              <div key={page.page_path} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-medium w-6">{index + 1}.</span>
                  <span className="text-slate-300 font-mono text-sm">{page.page_path}</span>
                </div>
                <span className="text-white font-semibold">{page.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MousePointer className="w-5 h-5 text-orange-600" />
            <h3 className="text-xl font-semibold text-white">Top Events</h3>
          </div>
          <div className="space-y-3">
            {stats.topEvents.map((event, index) => (
              <div key={event.event_name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-medium w-6">{index + 1}.</span>
                  <span className="text-slate-300">{event.event_name.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-white font-semibold">{event.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-orange-600" />
          <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="space-y-2">
          {stats.recentActivity.map(activity => (
            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
              <div className="flex items-center gap-3">
                {activity.type === 'page_view' ? (
                  <Eye className="w-4 h-4 text-blue-500" />
                ) : (
                  <MousePointer className="w-4 h-4 text-orange-500" />
                )}
                <div>
                  <span className="text-slate-300 font-mono text-sm">{activity.path}</span>
                  {activity.name && (
                    <span className="text-slate-500 text-sm ml-2">({activity.name.replace(/_/g, ' ')})</span>
                  )}
                </div>
              </div>
              <span className="text-slate-500 text-sm">
                {new Date(activity.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
