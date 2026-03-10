import { Home, TrendingUp, Wrench, UserCircle, Star, Puzzle, BookOpen, MessageSquare, Newspaper } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getAvailableFeatures } from '../config/features';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export default function Sidebar() {
  const location = useLocation();
  const { user, isPremium } = useAuth();
  const availableFeatures = getAvailableFeatures();

  const navItemColors: Record<string, string> = {
    'Home': 'hover:text-blue-400',
    'Tools': 'hover:text-green-400',
    'My Watchlist': 'hover:text-yellow-400',
    'Chatroom': 'hover:text-purple-400',
    'Bespoke Projects': 'hover:text-orange-400',
    'Education Centre': 'hover:text-cyan-400',
    'Daily Insights': 'hover:text-blue-400',
    'My Account': 'hover:text-orange-400',
  };

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', path: '/' },
    availableFeatures.showTools && { icon: Wrench, label: 'Tools', path: '/tools' },
    { icon: Star, label: 'My Watchlist', path: '/my-watchlist' },
    { icon: MessageSquare, label: 'Chatroom', path: '/chatroom' },
    { icon: Puzzle, label: 'Bespoke Projects', path: '/bespoke-projects' },
    { icon: BookOpen, label: 'Education Centre', path: '/documentation' },
    { icon: Newspaper, label: 'Daily Insights', path: '/daily-insights' },
    { icon: UserCircle, label: 'My Account', path: '/my-account' },
  ].filter(Boolean) as NavItem[];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">
      <div className="p-6 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            Hilex Optimized Trends
          </h1>
          <NotificationBell />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const hoverColor = navItemColors[item.label] || 'hover:text-white';

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : `text-white hover:bg-slate-800/50 ${hoverColor}`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex-shrink-0 border-t border-slate-800">
        {!isPremium && (
          <div className="p-4 border-b border-slate-800">
            <Link
              to="/get-premium"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Star className="w-5 h-5" />
              <span>Get Premium</span>
            </Link>
          </div>
        )}
        <div className="p-4">
          <div className="text-xs text-slate-500 text-center">
            <p className="font-medium text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
