import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LevelInfo {
  level: number;
  name: string;
  minStreak: number;
  nextLevelStreak: number;
  description: string;
}

const LEVELS: LevelInfo[] = [
  { level: 1, name: 'New Trader', minStreak: 1, nextLevelStreak: 3, description: 'Just getting started on your trading journey' },
  { level: 2, name: 'Chart Watcher', minStreak: 3, nextLevelStreak: 5, description: 'Consistently checking in on the markets' },
  { level: 3, name: 'Trend Chaser', minStreak: 5, nextLevelStreak: 10, description: 'Actively following market trends' },
  { level: 4, name: 'Market Hawk', minStreak: 10, nextLevelStreak: 20, description: 'Sharp-eyed observer of market movements' },
  { level: 5, name: 'Alpha Seeker', minStreak: 20, nextLevelStreak: Infinity, description: 'Elite trader seeking the ultimate edge' },
];

export default function LoginStreakPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStreak();
  }, [user]);

  const loadUserStreak = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('streak_count, level')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading user streak:', error);
      setLoading(false);
      return;
    }

    setCurrentStreak(data?.streak_count || 0);
    setCurrentLevel(data?.level || 1);
    setLoading(false);
  };

  const getCurrentLevelInfo = () => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (currentStreak >= LEVELS[i].minStreak) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  };

  const getNextLevel = () => {
    const currentLevelInfo = getCurrentLevelInfo();
    const currentIndex = LEVELS.findIndex(l => l.level === currentLevelInfo.level);
    if (currentIndex < LEVELS.length - 1) {
      return LEVELS[currentIndex + 1];
    }
    return null;
  };

  const getHoursToNextLevel = () => {
    const nextLevel = getNextLevel();
    if (!nextLevel) return null;

    const daysNeeded = nextLevel.minStreak - currentStreak;
    return daysNeeded * 24;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const currentLevelInfo = getCurrentLevelInfo();
  const nextLevel = getNextLevel();
  const hoursToNext = getHoursToNextLevel();

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-8 py-6" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              Login Streak Levels
            </h1>
            <p className="text-slate-400 mt-1">Track your progress and unlock new levels</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-gradient-to-br from-orange-900/20 to-slate-800 border border-orange-500/30 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                <Flame className="w-10 h-10 text-orange-500" />
                {currentStreak}-day streak
              </h2>
              <p className="text-slate-300">Keep logging in daily to maintain your streak!</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-lg font-medium text-slate-300">Level {currentLevel}</span>
              </div>
              <p className="text-xl font-bold text-orange-400">{currentLevelInfo.name}</p>
            </div>
          </div>

          {nextLevel && hoursToNext !== null && (
            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Next Level</h3>
                  <p className="text-slate-300 mb-2">
                    <span className="font-bold text-orange-400">{nextLevel.name}</span> - {nextLevel.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">Time to next level:</span>
                    <span className="font-bold text-blue-400">{hoursToNext} hours</span>
                    <span className="text-slate-500">({nextLevel.minStreak - currentStreak} days)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">All Levels</h2>
        <div className="space-y-4">
          {LEVELS.map((level, index) => {
            const isUnlocked = currentStreak >= level.minStreak;
            const isCurrent = currentLevelInfo.level === level.level;

            return (
              <div
                key={level.level}
                className={`rounded-xl border-2 transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-br from-orange-900/30 to-slate-800 border-orange-500'
                    : isUnlocked
                    ? 'bg-slate-800/50 border-slate-700'
                    : 'bg-slate-900/30 border-slate-800 opacity-60'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-4 rounded-xl ${
                          isCurrent
                            ? 'bg-orange-500/20'
                            : isUnlocked
                            ? 'bg-green-500/20'
                            : 'bg-slate-800'
                        }`}
                      >
                        {isCurrent ? (
                          <Flame className="w-8 h-8 text-orange-500" />
                        ) : isUnlocked ? (
                          <TrendingUp className="w-8 h-8 text-green-500" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <span className="text-slate-500 font-bold">{level.level}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                          {level.name}
                          {isCurrent && (
                            <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-medium">
                              Current Level
                            </span>
                          )}
                        </h3>
                        <p className="text-slate-300">{level.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400 mb-1">Required Streak</div>
                      <div className="text-2xl font-bold text-white">{level.minStreak} days</div>
                    </div>
                  </div>

                  {index < LEVELS.length - 1 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="text-sm text-slate-400">
                        Next level in: <span className="font-semibold text-white">{LEVELS[index + 1].minStreak - level.minStreak} days</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3">How Login Streaks Work</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Log in every day to maintain and grow your streak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Your streak increases by 1 each consecutive day you log in</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Missing a day will reset your streak back to 1</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Reach higher levels by maintaining longer streaks</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
