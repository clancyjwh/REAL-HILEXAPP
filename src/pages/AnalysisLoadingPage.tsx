import { Loader2 } from 'lucide-react';

export default function AnalysisLoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse" />
      </div>
      <h2 className="mt-8 text-2xl font-bold text-white">Analyzing Asset</h2>
      <p className="mt-2 text-slate-400">Please wait while we fetch the latest insights...</p>
    </div>
  );
}
