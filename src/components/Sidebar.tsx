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
    <aside className="fixed left-0 top-0 h-screen w-64 sidebar-glass flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <TrendingUp className="w-5 h-5 text-[#00D8FF] drop-shadow-[0_0_8px_rgba(0,216,255,0.7)]" />
            <span className="leading-tight">Hilex Optimized<br /><span className="text-[#00D8FF]">Trends</span></span>
          </h1>
          <NotificationBell />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                      ? 'bg-[#00D8FF]/10 text-[#00D8FF] border border-[#00D8FF]/30 shadow-[0_0_12px_rgba(0,216,255,0.15)]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${isActive
                      ? 'text-[#00D8FF] drop-shadow-[0_0_6px_rgba(0,216,255,0.8)]'
                      : 'group-hover:text-[#00D8FF]'
                    }`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D8FF] shadow-[0_0_6px_rgba(0,216,255,1)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="flex-shrink-0 border-t border-white/10">
        {!isPremium && (
          <div className="p-4 border-b border-white/10">
            <Link
              to="/get-premium"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold transition-all duration-200 shadow-lg hover:shadow-orange-500/30 hover:shadow-xl text-sm"
            >
              <Star className="w-4 h-4" />
              <span>Get Premium</span>
            </Link>
          </div>
        )}
        <div className="p-4">
          <div className="text-xs text-slate-600 text-center font-mono truncate">
            {user?.email}
          </div>
        </div>
      </div>
    </aside>
  );
}
