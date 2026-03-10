import { useNavigate } from 'react-router-dom';
import { Bitcoin, TrendingUp, DollarSign, Gem } from 'lucide-react';
import Disclaimer from '../components/Disclaimer';

interface CategoryCard {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBg: string;
}

const categories: CategoryCard[] = [
  {
    id: 'crypto',
    title: 'Crypto',
    icon: Bitcoin,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-700',
    hoverBg: 'hover:bg-orange-900/30',
  },
  {
    id: 'stocks',
    title: 'Stocks',
    icon: TrendingUp,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-700',
    hoverBg: 'hover:bg-blue-900/30',
  },
  {
    id: 'forex',
    title: 'Forex',
    icon: DollarSign,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-700',
    hoverBg: 'hover:bg-green-900/30',
  },
  {
    id: 'commodities',
    title: 'Commodities',
    icon: Gem,
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-700',
    hoverBg: 'hover:bg-amber-900/30',
  },
];

export default function TopPicksPage() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/top-picks/${categoryId}`);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Hilex - Top Movers</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {categories.map((category) => {
          const Icon = category.icon;
          const isDisabled = category.id === 'crypto' || category.id === 'commodities';

          if (isDisabled) {
            return (
              <div
                key={category.id}
                className={`${category.bgColor} ${category.borderColor} border-2 rounded-xl p-8 opacity-40 cursor-not-allowed relative`}
              >
                <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg">
                  <span className="text-xs text-slate-400 font-medium">Not Available in Beta</span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-4 rounded-full ${category.bgColor}`}>
                    <Icon className={`w-12 h-12 ${category.color}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                </div>
              </div>
            );
          }

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`${category.bgColor} ${category.borderColor} border-2 rounded-xl p-8 transition-all duration-200 ${category.hoverBg} hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full ${category.bgColor}`}>
                  <Icon className={`w-12 h-12 ${category.color}`} />
                </div>
                <h2 className="text-2xl font-bold text-white">{category.title}</h2>
              </div>
            </button>
          );
        })}
      </div>
      <Disclaimer />
    </>
  );
}
