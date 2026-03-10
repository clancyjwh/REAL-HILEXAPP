import { useNavigate } from 'react-router-dom';
import { Zap, Bitcoin, DollarSign, TrendingUp, Gem, Globe } from 'lucide-react';
import Disclaimer from '../components/Disclaimer';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const categories: Category[] = [
  {
    id: 'crypto',
    name: 'Crypto',
    description: 'Top moving cryptocurrencies',
    icon: Bitcoin,
    color: 'amber',
  },
  {
    id: 'forex',
    name: 'Forex',
    description: 'Top moving currency pairs',
    icon: DollarSign,
    color: 'amber',
  },
  {
    id: 'stocks',
    name: 'Stocks',
    description: 'Top moving stocks',
    icon: TrendingUp,
    color: 'amber',
  },
  {
    id: 'commodities',
    name: 'Commodities',
    description: 'Top moving commodities',
    icon: Gem,
    color: 'amber',
  },
  {
    id: 'general',
    name: 'General Market Scan',
    description: 'Overview of all market movers',
    icon: Globe,
    color: 'amber',
  },
];

export default function MarketMoversPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Market Movers</h1>
            <p className="text-slate-400">Track the biggest market movements</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl">
        <p className="text-slate-300 mb-6">
          Select a market category to see the top movers
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                key={category.id}
                onClick={() => navigate(`/market-movers/${category.id}`)}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 hover:border-amber-500 p-8 text-left transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
              >
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-amber-500/10 group-hover:bg-amber-500/20 rounded-xl transition-colors">
                    <Icon className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-slate-400">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            );
          })}
        </div>
      </div>
      <Disclaimer />
    </>
  );
}
