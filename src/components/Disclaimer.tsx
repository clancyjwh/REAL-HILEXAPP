import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="mt-8 mb-4 mx-auto max-w-6xl space-y-4">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-orange-500">DISCLAIMER:</span> Hilex provides technical analysis and market data for educational purposes only. This is not financial advice. Past performance does not guarantee future results. Trading involves substantial risk of loss. Consult a licensed financial advisor before making investment decisions. We are not a registered investment advisor.
          </div>
        </div>
      </div>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="text-xs text-slate-400 text-center">
          <span className="font-semibold">Note:</span> All prices are in USD
        </div>
      </div>
    </div>
  );
}
