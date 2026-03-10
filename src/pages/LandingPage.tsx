import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Target, Activity, Brain, Search, Settings, Lightbulb, Briefcase, Grid2x2 as Grid, CheckCircle, Zap, ChevronRight, X } from 'lucide-react';

type StatModalType = 'accuracy' | 'tests' | 'signals' | null;

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [statModal, setStatModal] = useState<StatModalType>(null);
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('https://hook.us2.make.com/d9mu0r2etlejrf2linmykf61glz2tpu3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setFormSubmitted(true);
      setTimeout(() => {
        setShowGetStartedModal(false);
        setFormSubmitted(false);
        setFormData({ name: '', email: '' });
      }, 2000);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const statContent = {
    accuracy: {
      title: 'Accuracy Rate',
      description: 'Our AI-powered analysis achieves approximately 70% accuracy across historical datasets. This rate is maintained through continuous testing and optimization of our predictive models against real historical market data.'
    },
    tests: {
      title: 'Comprehensive Testing',
      description: 'Each asset undergoes over 3 million individual backtests across multiple parameters, timeframes, and market conditions. This extensive testing ensures robust and reliable trend identification.'
    },
    signals: {
      title: 'AI-Weighted Signals',
      description: 'Our signals are intelligently weighted using machine learning algorithms that analyze multiple data points, historical patterns, and market conditions to provide you with the most actionable insights.'
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 relative overflow-hidden" style={{ fontFamily: "'Inter', 'Courier New', monospace" }}>
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#00D8FF08 1px, transparent 1px), linear-gradient(90deg, #00D8FF08 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00D8FF] rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D8FF] rounded-full blur-[120px] opacity-10"></div>
      </div>

      {/* Technical Breadcrumb - Top Left */}
      <div className="fixed top-4 left-4 z-40 text-[#00D8FF] text-xs font-mono opacity-60">
        HyLEX Node 01 // Active
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/5 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-[#00D8FF] drop-shadow-[0_0_8px_rgba(0,216,255,0.6)]" />
            <span className="text-xl font-bold tracking-tight">Hylex <span className="italic text-[#00D8FF]">OPTIMIZED</span> Trends</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-[#00D8FF] transition-all duration-300 text-sm tracking-wide">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-[#00D8FF] transition-all duration-300 text-sm tracking-wide">How It Works</a>
            <a href="#pricing" className="text-gray-400 hover:text-[#00D8FF] transition-all duration-300 text-sm tracking-wide">Pricing</a>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#00D8FF] hover:bg-[#00D8FF]/80 text-[#020617] px-6 py-2 rounded font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,216,255,0.5)] tracking-wide"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 relative z-10">
        <div className="text-center max-w-4xl">
          <div className="flex flex-col items-center justify-center mb-8 animate-[fadeInUp_1s_ease-out]">
            <h1 className="text-7xl font-extrabold text-white mb-4 tracking-tighter">
              Raw Data
            </h1>
            <ChevronRight className="w-20 h-20 text-[#00D8FF] mb-4 drop-shadow-[0_0_12px_rgba(0,216,255,0.8)] animate-pulse" />
            <h1 className="text-7xl font-extrabold text-white tracking-tighter">
              Actionable Insights
            </h1>
          </div>

          <h2 className="text-3xl font-semibold text-gray-300 mb-4 tracking-tight">
            Identify Trends in <span className="italic text-[#00D8FF]">Historical Data</span>
          </h2>

          <p className="text-xl text-gray-400 mb-8 tracking-wide">
            Hylex uses AI to find trends, optimal parameters and more to optimize your datasets.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="bg-[#00D8FF] hover:bg-[#00D8FF]/80 text-[#020617] px-8 py-4 rounded font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.6)] inline-flex items-center gap-2 tracking-wide"
          >
            Start Analyzing For Free
            <ChevronRight className="w-5 h-5" />
          </button>

          <p className="text-gray-500 text-sm mt-4 font-mono tracking-widest">
            Historical Data Only
          </p>
        </div>

        {/* Statistics Section */}
        <div className="mt-16 flex gap-12">
          <button
            onClick={() => setStatModal('accuracy')}
            className="flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded group-hover:bg-[#00D8FF]/10 group-hover:border-[#00D8FF]/30 transition-all duration-300">
              <Target className="w-6 h-6 text-[#00D8FF]" />
            </div>
            <span className="text-gray-400 group-hover:text-[#00D8FF] transition-all duration-300 font-mono text-sm">
              ~70 percent accuracy
            </span>
          </button>

          <button
            onClick={() => setStatModal('tests')}
            className="flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded group-hover:bg-[#00D8FF]/10 group-hover:border-[#00D8FF]/30 transition-all duration-300">
              <Activity className="w-6 h-6 text-[#00D8FF]" />
            </div>
            <span className="text-gray-400 group-hover:text-[#00D8FF] transition-all duration-300 font-mono text-sm">
              3+ million tests/asset
            </span>
          </button>

          <button
            onClick={() => setStatModal('signals')}
            className="flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded group-hover:bg-[#00D8FF]/10 group-hover:border-[#00D8FF]/30 transition-all duration-300">
              <Brain className="w-6 h-6 text-[#00D8FF]" />
            </div>
            <span className="text-gray-400 group-hover:text-[#00D8FF] transition-all duration-300 font-mono text-sm">
              AI-Weighted signals
            </span>
          </button>
        </div>
      </section>

      {/* December Signal Highlights */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white tracking-tighter">
            December Signal <span className="italic text-[#00D8FF]">Highlights</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CLS Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500 group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white tracking-tight">CLS</h3>
                <span className="bg-[#00D8FF]/20 text-[#00D8FF] px-3 py-1 rounded text-sm font-bold border border-[#00D8FF]/30">
                  +10.50%
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-6 font-mono">Up move captured</p>

              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Signal date:</span>
                  <span className="text-gray-200">Dec 3, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price at signal:</span>
                  <span className="text-gray-200">$309.54</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cumulative score:</span>
                  <span className="text-[#00D8FF] font-semibold">+3.43 (bullish)</span>
                </div>
                <div className="h-px bg-white/10 my-3"></div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Latest price:</span>
                  <span className="text-gray-200 font-semibold">$342.03</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Move:</span>
                  <span className="text-[#00D8FF] font-bold">+$32.49</span>
                </div>
              </div>
            </div>

            {/* TSLA Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500 group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white tracking-tight">TSLA</h3>
                <span className="bg-[#00D8FF]/20 text-[#00D8FF] px-3 py-1 rounded text-sm font-bold border border-[#00D8FF]/30">
                  +3.71%
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-6 font-mono">Strong bullish call</p>

              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Signal date:</span>
                  <span className="text-gray-200">Dec 1, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price at signal:</span>
                  <span className="text-gray-200">$429.24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cumulative score:</span>
                  <span className="text-[#00D8FF] font-semibold">+4.56 (bullish)</span>
                </div>
                <div className="h-px bg-white/10 my-3"></div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Latest price:</span>
                  <span className="text-gray-200 font-semibold">$445.17</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Move:</span>
                  <span className="text-[#00D8FF] font-bold">+$15.93</span>
                </div>
              </div>
            </div>

            {/* NVDA Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500 group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white tracking-tight">NVDA</h3>
                <span className="bg-[#00D8FF]/20 text-[#00D8FF] px-3 py-1 rounded text-sm font-bold border border-[#00D8FF]/30">
                  +2.96%
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-6 font-mono">Uptrend flagged early</p>

              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Signal date:</span>
                  <span className="text-gray-200">Dec 1, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price at signal:</span>
                  <span className="text-gray-200">$179.66</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cumulative score:</span>
                  <span className="text-[#00D8FF] font-semibold">+3.00 (bullish)</span>
                </div>
                <div className="h-px bg-white/10 my-3"></div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Latest price:</span>
                  <span className="text-gray-200 font-semibold">$184.97</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Move:</span>
                  <span className="text-[#00D8FF] font-bold">+$5.31</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500 group">
              <Search className="w-12 h-12 text-[#00D8FF] mb-4 group-hover:drop-shadow-[0_0_8px_rgba(0,216,255,0.6)] transition-all duration-300" />
              <h3 className="text-xl font-bold mb-3 tracking-tight">What we do</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We analyze vast amounts of historical data to identify meaningful patterns and trends that can inform your decision-making process.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500 group">
              <Settings className="w-12 h-12 text-[#00D8FF] mb-4 group-hover:drop-shadow-[0_0_8px_rgba(0,216,255,0.6)] transition-all duration-300" />
              <h3 className="text-xl font-bold mb-3 tracking-tight">Behind the Scenes</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our platform runs millions of backtests with varying parameters to find optimal configurations that have historically performed best.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500 group">
              <Lightbulb className="w-12 h-12 text-[#00D8FF] mb-4 group-hover:drop-shadow-[0_0_8px_rgba(0,216,255,0.6)] transition-all duration-300" />
              <h3 className="text-xl font-bold mb-3 tracking-tight">Insights</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We deliver structured, easy-to-understand summaries that highlight key findings and actionable insights from complex data analysis.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500 group">
              <Briefcase className="w-12 h-12 text-[#00D8FF] mb-4 group-hover:drop-shadow-[0_0_8px_rgba(0,216,255,0.6)] transition-all duration-300" />
              <h3 className="text-xl font-bold mb-3 tracking-tight">Bespoke Projects</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Need custom analysis? We offer tailored solutions designed specifically for your unique data requirements and business objectives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 tracking-tighter">Key <span className="italic text-[#00D8FF]">Features</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,216,255,0.2)] transition-all duration-500">
              <Grid className="w-10 h-10 text-[#00D8FF] mb-4" />
              <h3 className="text-lg font-bold mb-2 tracking-tight">Heatmaps</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Visual score displays that make complex data patterns immediately understandable at a glance.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,216,255,0.2)] transition-all duration-500">
              <Brain className="w-10 h-10 text-[#00D8FF] mb-4" />
              <h3 className="text-lg font-bold mb-2 tracking-tight">AI-Enhanced Weighting</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Machine learning algorithms adjust signal importance based on historical performance and reliability.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,216,255,0.2)] transition-all duration-500">
              <CheckCircle className="w-10 h-10 text-[#00D8FF] mb-4" />
              <h3 className="text-lg font-bold mb-2 tracking-tight">Pattern Consistency Detection</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Identifies and validates patterns that consistently appear across different market conditions and timeframes.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,216,255,0.2)] transition-all duration-500">
              <Zap className="w-10 h-10 text-[#00D8FF] mb-4" />
              <h3 className="text-lg font-bold mb-2 tracking-tight">Parameter Stress Testing</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Rigorous testing of parameters under various scenarios to ensure robustness and reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 tracking-tighter">How It <span className="italic text-[#00D8FF]">Works</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-8 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500">
              <div className="w-12 h-12 bg-[#00D8FF] rounded flex items-center justify-center text-2xl font-bold mb-4 text-[#020617]">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Data Gathering</h3>
              <p className="text-gray-400 leading-relaxed">
                We collect and process extensive historical data from reliable sources, ensuring data quality and consistency for accurate analysis.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-8 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500">
              <div className="w-12 h-12 bg-[#00D8FF] rounded flex items-center justify-center text-2xl font-bold mb-4 text-[#020617]">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Analysis</h3>
              <p className="text-gray-400 leading-relaxed">
                Our AI algorithms run millions of backtests, optimize parameters, and identify patterns that have shown historical significance.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-8 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500">
              <div className="w-12 h-12 bg-[#00D8FF] rounded flex items-center justify-center text-2xl font-bold mb-4 text-[#020617]">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Condense</h3>
              <p className="text-gray-400 leading-relaxed">
                We transform complex analytical results into clear, actionable insights that you can understand and apply immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 tracking-tighter">Pricing <span className="italic text-[#00D8FF]">Plans</span></h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your needs. Start with our free trial or unlock the full power of Hylex with Premium.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Free Trial Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-8 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500">
              <h3 className="text-2xl font-bold mb-2 tracking-tight">Free Trial</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#00D8FF] tracking-tight">$0</span>
                <span className="text-gray-400 ml-2 font-mono text-sm">Unlimited Time</span>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Hylex Top Movers</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Daily Insights</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Bespoke Project Requests</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">1 Custom Asset Watchlist (12hr updates)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">1 Custom Price Watchlist (12hr updates)</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded font-semibold transition-all duration-300"
              >
                Start Free Trial
              </button>
            </div>

            {/* Premium Card */}
            <div className="bg-white/5 backdrop-blur-md border-2 border-[#00D8FF] rounded-lg p-8 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,216,255,0.3)] transition-all duration-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#00D8FF] text-[#020617] px-4 py-1 rounded text-sm font-bold tracking-wide">
                Most Popular
              </div>

              <h3 className="text-2xl font-bold mb-2 tracking-tight">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#00D8FF] tracking-tight">$1,000</span>
                <span className="text-gray-400 ml-2 font-mono text-sm">CAD/month + tax</span>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm font-semibold">Everything in Free, plus:</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Unlimited Access to All Tools</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Horizon Optimizer</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Indicator Analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">AI News Scans</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Zero Day Options Analytics</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Price Direction Forecasting</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Event Forecasting</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Relative Value Analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Interest Rate Comparison</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">6 Custom Asset Watchlists (12hr updates)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">6 Custom Price Watchlists (12hr updates)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Community Chatrooms (Forex, Commodities, Stocks, Crypto, Strategies, World News)</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/login?redirect=get-premium')}
                className="w-full bg-[#00D8FF] hover:bg-[#00D8FF]/80 text-[#020617] px-6 py-3 rounded font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,216,255,0.5)] tracking-wide"
              >
                Get Premium
              </button>
            </div>

            {/* Bespoke Projects Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-8 hover:border-[#00D8FF]/50 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.2)] transition-all duration-500">
              <h3 className="text-2xl font-bold mb-2 tracking-tight">Bespoke Projects</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#00D8FF] tracking-tight">Custom</span>
                <span className="text-gray-400 ml-2 block mt-1 text-sm font-mono">Pricing varies by project</span>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Custom Analysis Tailored to Your Needs</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Specialized Data Sourcing</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Custom Algorithm Development</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00D8FF] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">Dedicated Support</span>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Pricing depends on project scope, data sourcing requirements, and analysis complexity. Get in touch via the "Bespoke Projects" tab in the platform.
              </p>

              <button
                onClick={() => navigate('/login?redirect=bespoke-projects')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded font-semibold transition-all duration-300"
              >
                Request Quote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 tracking-tighter">Ready to <span className="italic text-[#00D8FF]">Start</span>?</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#00D8FF] hover:bg-[#00D8FF]/80 text-[#020617] px-12 py-5 rounded font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,216,255,0.6)] inline-flex items-center gap-2 mb-8 tracking-wide"
          >
            Get Started For Free
            <ChevronRight className="w-6 h-6" />
          </button>

          <p className="text-gray-500 text-xs max-w-2xl mx-auto leading-relaxed font-mono">
            This platform and its tools are provided for educational and informational purposes only. Nothing on this site constitutes financial advice, investment recommendations, or trading signals. Historical performance does not guarantee future results. All analysis is based on past data and should not be used as the sole basis for any financial decisions. Users are solely responsible for their own investment choices and should consult with qualified financial professionals before making any trading or investment decisions. Use of this platform indicates acceptance of these terms and acknowledgment that all trading and investing carries risk of loss.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#00D8FF]" />
            <span className="font-bold tracking-tight">Hylex <span className="italic text-[#00D8FF]">OPTIMIZED</span> Trends</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-[#00D8FF] transition-colors text-sm font-mono">Terms</a>
            <a href="#" className="text-gray-400 hover:text-[#00D8FF] transition-colors text-sm font-mono">Privacy</a>
          </div>
        </div>
        <div className="text-center text-gray-500 text-xs mt-4 font-mono">
          Copyright 2025
        </div>
        {/* Technical Breadcrumb - Bottom Right */}
        <div className="absolute bottom-4 right-4 text-[#00D8FF] text-xs font-mono opacity-60">
          System Status: Operational
        </div>
      </footer>

      {/* Statistics Modal */}
      {statModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          onClick={() => setStatModal(null)}
        >
          <div
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-8 max-w-lg w-full hover:border-[#00D8FF]/50 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#00D8FF] tracking-tight">
                {statContent[statModal].title}
              </h3>
              <button
                onClick={() => setStatModal(null)}
                className="text-gray-400 hover:text-[#00D8FF] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {statContent[statModal].description}
            </p>
          </div>
        </div>
      )}

      {/* Get Started Modal */}
      {showGetStartedModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          onClick={() => setShowGetStartedModal(false)}
        >
          <div
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-8 max-w-md w-full hover:border-[#00D8FF]/50 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold tracking-tight">Get Started</h3>
              <button
                onClick={() => setShowGetStartedModal(false)}
                className="text-gray-400 hover:text-[#00D8FF] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {formSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-[#00D8FF] mx-auto mb-4" />
                <p className="text-xl font-semibold text-[#00D8FF]">Successfully Submitted!</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-mono">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-gray-100 focus:outline-none focus:border-[#00D8FF] transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2 text-sm font-mono">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-gray-100 focus:outline-none focus:border-[#00D8FF] transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#00D8FF] hover:bg-[#00D8FF]/80 text-[#020617] px-6 py-3 rounded font-bold transition-all duration-300 hover:scale-105"
                >
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
