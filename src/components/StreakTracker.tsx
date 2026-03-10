import { useEffect, useState } from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LevelInfo {
  level: number;
  name: string;
  minStreak: number;
  nextLevelStreak: number;
}

const LEVELS: LevelInfo[] = [
  { level: 1, name: 'New Trader', minStreak: 1, nextLevelStreak: 3 },
  { level: 2, name: 'Chart Watcher', minStreak: 3, nextLevelStreak: 5 },
  { level: 3, name: 'Trend Chaser', minStreak: 5, nextLevelStreak: 10 },
  { level: 4, name: 'Market Hawk', minStreak: 10, nextLevelStreak: 20 },
  { level: 5, name: 'Alpha Seeker', minStreak: 20, nextLevelStreak: Infinity },
];

export default function StreakTracker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelName, setLevelName] = useState('New Trader');
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSeenProgress, setLastSeenProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    updateStreak();
  }, []);

  const getLevelInfo = (streakCount: number): LevelInfo => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (streakCount >= LEVELS[i].minStreak) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  };

  const getNextLevelName = (currentLevelInfo: LevelInfo): string => {
    const currentIndex = LEVELS.findIndex(l => l.level === currentLevelInfo.level);
    if (currentIndex < LEVELS.length - 1) {
      const nextLevel = LEVELS[currentIndex + 1];
      return `${nextLevel.name} (Level ${nextLevel.level})`;
    }
    return 'Max Level';
  };

  const calculateProgress = (streakCount: number, levelInfo: LevelInfo): number => {
    if (levelInfo.nextLevelStreak === Infinity) {
      return 100;
    }

    return Math.min(100, (streakCount / levelInfo.nextLevelStreak) * 100);
  };

  const updateStreak = async () => {
    if (!user) return;

    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('streak_count, last_login_date, level')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user streak data:', fetchError);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      let newStreak = userData?.streak_count || 0;
      let shouldUpdate = false;
      let streakIncreased = false;

      const lastLogin = userData?.last_login_date;
      console.log('Streak calculation:', { today, lastLogin, currentStreak: userData?.streak_count });

      if (!lastLogin) {
        newStreak = 1;
        shouldUpdate = true;
        streakIncreased = true;
        console.log('First login - setting streak to 1');
      } else if (lastLogin === today) {
        newStreak = userData.streak_count || 1;
        console.log('Already logged in today - maintaining streak:', newStreak);
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        console.log('Checking if last login was yesterday:', { yesterdayStr, lastLogin });

        if (lastLogin === yesterdayStr) {
          newStreak = (userData.streak_count || 0) + 1;
          streakIncreased = true;
          console.log('Consecutive login! New streak:', newStreak);
        } else {
          newStreak = 1;
          console.log('Streak broken - resetting to 1');
        }
        shouldUpdate = true;
      }

      const levelInfo = getLevelInfo(newStreak);
      const progressPercent = calculateProgress(newStreak, levelInfo);

      const storedProgress = localStorage.getItem(`streak_progress_${user.id}`);
      const previousProgress = storedProgress ? parseFloat(storedProgress) : null;

      setStreak(newStreak);
      setLevel(levelInfo.level);
      setLevelName(levelInfo.name);
      setProgress(progressPercent);
      setLastSeenProgress(previousProgress);

      if (previousProgress !== null && progressPercent > previousProgress) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      localStorage.setItem(`streak_progress_${user.id}`, progressPercent.toString());

      if (shouldUpdate) {
        const { error: updateError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            streak_count: newStreak,
            last_login_date: today,
            level: levelInfo.level,
          }, {
            onConflict: 'id'
          });

        if (updateError) {
          console.error('Error updating streak:', updateError);
        } else {
          console.log('Streak updated successfully:', { newStreak, today, level: levelInfo.level });
        }
      }

    } catch (err) {
      console.error('Unexpected error updating streak:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="relative">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            >
              <div
                className={`w-2 h-2 ${
                  ['bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500'][
                    Math.floor(Math.random() * 5)
                  ]
                }`}
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/login-streak')}
        className="w-full bg-gradient-to-br from-orange-900/20 to-slate-800 border border-orange-500/30 rounded-lg p-4 shadow-lg hover:border-orange-500/50 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                {streak}-day streak
              </h3>
              <p className="text-xs text-slate-400">Keep it going!</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-slate-300">Level {level}</span>
            </div>
            <p className="text-xs font-semibold text-orange-400">{levelName}</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Progress to {getNextLevelName(getLevelInfo(streak))}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </button>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
