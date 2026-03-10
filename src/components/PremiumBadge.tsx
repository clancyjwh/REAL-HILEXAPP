import { Crown } from 'lucide-react';

export default function PremiumBadge() {
  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm text-black px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
      <Crown className="w-3.5 h-3.5" />
      <span>Premium</span>
    </div>
  );
}
