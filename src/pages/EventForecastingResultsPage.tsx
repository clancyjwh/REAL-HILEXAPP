import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Activity, Clock, Users, Newspaper, History, Target, CheckCircle, XCircle, HelpCircle, AlertTriangle, X } from 'lucide-react';

interface LocationState {
  query: string;
  summary: string;
  eventScore: number;
  recentMomentum: number;
  structuralEdge: number;
  expertConsensusScore: number;
  newsSentimentScore: number;
  historicalPatternMatch: number;
  timePressureEffect: number;
  flipConditions?: { flip_conditions: string[] };
}

interface MetricDefinition {
  title: string;
  definition: string;
  example: string;
}

const metricDefinitions: Record<string, MetricDefinition> = {
  'Recent Momentum': {
    title: 'Recent Momentum',
    definition: 'This measures the short-term trend direction and whether conditions are moving toward or away from the predicted outcome. A positive value means recent developments are accelerating in favor of the event; a negative value means momentum is weakening or reversing.',
    example: '"A team winning its last three games shows positive recent momentum."'
  },
  'Structural Edge': {
    title: 'Structural Edge',
    definition: 'This reflects the built-in advantages or disadvantages within the situation, such as incumbency, home-field advantage, demographic alignment, or long-standing market structure. A positive score indicates an inherent tilt toward the outcome; a negative score means the structure works against it.',
    example: '"An incumbent politician typically has a structural edge due to name recognition and organization."'
  },
  'Expert Consensus': {
    title: 'Expert Consensus',
    definition: 'This captures how strongly analysts, commentators, or reputable forecasters lean toward one side of the prediction. A higher score means experts largely agree on the likely direction, while a negative score means expert opinion tilts the other way.',
    example: '"Most polling analysts predicting the same candidate gives a strong expert consensus."'
  },
  'News & Sentiment': {
    title: 'News & Sentiment',
    definition: 'This measures the tone and direction of recent media coverage and public sentiment related to the event. Positive sentiment supports the outcome, while negative sentiment signals concern, skepticism, or unfavorable developments.',
    example: '"A surge of negative headlines about a company creates downward sentiment."'
  },
  'Historical Pattern Match': {
    title: 'Historical Pattern Match',
    definition: 'This assesses how closely the current situation resembles past events with known outcomes. A strong positive match means similar past cases often resolved the same way; a negative match means historical precedent leans against it.',
    example: '"In past elections with similar polling gaps, the leading party usually held their advantage."'
  },
  'Time Pressure Effect': {
    title: 'Time Pressure Effect',
    definition: 'This evaluates how deadlines, timing windows, and late-stage dynamics influence the outcome. A positive score indicates that approaching timing favors the event, while a negative score means timing increases stress, uncertainty, or barriers.',
    example: '"A crypto ETF decision deadline approaching quickly increases time pressure on the outcome."'
  }
};

export default function EventForecastingResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [selectedMetric, setSelectedMetric] = useState<MetricDefinition | null>(null);

  console.log('RESULTS PAGE RECEIVED STATE:', state);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-slate-400 text-xl mb-4">No forecast data available</div>
          <button
            onClick={() => navigate('/tools/event-forecasting')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            New Forecast
          </button>
        </div>
      </div>
    );
  }

  const result = {
    query: state.query,
    summary: state.summary,
    event_score: state.eventScore,
    recent_momentum: state.recentMomentum,
    structural_edge: state.structuralEdge,
    expert_consensus_score: state.expertConsensusScore,
    news_sentiment_score: state.newsSentimentScore,
    historical_pattern_match: state.historicalPatternMatch,
    time_pressure_effect: state.timePressureEffect,
  };

  const getSignalColor = (signal: number) => {
    if (signal >= 7) return 'text-emerald-400';
    if (signal >= 4) return 'text-emerald-300';
    if (signal >= 1) return 'text-green-300';
    if (signal > -1) return 'text-slate-300';
    if (signal >= -4) return 'text-orange-400';
    if (signal >= -7) return 'text-red-400';
    return 'text-red-500';
  };

  const getBarColor = (signal: number) => {
    if (signal >= 7) return 'bg-emerald-400';
    if (signal >= 4) return 'bg-emerald-400';
    if (signal >= 1) return 'bg-cyan-400';
    if (signal > -1) return 'bg-slate-400';
    if (signal >= -4) return 'bg-orange-400';
    if (signal >= -7) return 'bg-red-400';
    return 'bg-red-500';
  };

  const getHeatmapPosition = (value: number) => {
    const normalized = (value + 1) / 2;
    return Math.max(0, Math.min(100, normalized * 100));
  };

  const getHeatmapIndicatorColor = (value: number) => {
    if (value >= 0.5) return 'bg-emerald-400';
    if (value >= 0.3) return 'bg-cyan-400';
    if (value >= 0) return 'bg-slate-400';
    if (value >= -0.3) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getVerdict = (score: number) => {
    if (score >= 3) return { text: 'Yes', color: 'text-emerald-400', bgColor: 'from-emerald-500 to-green-500', icon: CheckCircle };
    if (score <= -3) return { text: 'No', color: 'text-red-400', bgColor: 'from-red-500 to-rose-500', icon: XCircle };
    return { text: 'Uncertain', color: 'text-slate-400', bgColor: 'from-slate-500 to-slate-600', icon: HelpCircle };
  };

  const verdict = getVerdict(result.event_score);

  const scoreCards = [
    {
      title: 'Recent Momentum',
      value: result.recent_momentum,
      icon: TrendingUp,
      description: 'Current trend direction and strength',
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-400/60',
      shadowColor: 'shadow-blue-500/50',
    },
    {
      title: 'Structural Edge',
      value: result.structural_edge,
      icon: Target,
      description: 'Underlying market structure advantage',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-400/60',
      shadowColor: 'shadow-purple-500/50',
    },
    {
      title: 'Expert Consensus',
      value: result.expert_consensus_score,
      icon: Users,
      description: 'Agreement among expert predictions',
      color: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-400/60',
      shadowColor: 'shadow-emerald-500/50',
    },
    {
      title: 'News & Sentiment',
      value: result.news_sentiment_score,
      icon: Newspaper,
      description: 'Public opinion and media coverage',
      color: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-400/60',
      shadowColor: 'shadow-amber-500/50',
    },
    {
      title: 'Historical Pattern Match',
      value: result.historical_pattern_match,
      icon: History,
      description: 'Similarity to past events',
      color: 'from-indigo-500 to-blue-500',
      borderColor: 'border-indigo-400/60',
      shadowColor: 'shadow-indigo-500/50',
    },
    {
      title: 'Time Pressure Effect',
      value: result.time_pressure_effect,
      icon: Clock,
      description: 'Urgency and deadline influence',
      color: 'from-rose-500 to-red-500',
      borderColor: 'border-rose-400/60',
      shadowColor: 'shadow-rose-500/50',
    },
  ];

  return (
    <div className="min-h-screen pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2">Event Forecast Results</h1>
          <p className="text-slate-400">{result.query}</p>
        </div>
        <button
          onClick={() => navigate('/tools/event-forecasting')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          New Forecast
        </button>
      </div>

      {/* Event Score and Verdict Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Event Score */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-2 border-slate-700 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Event Score</h2>
              <p className="text-slate-400 text-sm mt-1">Overall forecast from -10 to +10</p>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-7xl font-bold ${getSignalColor(result.event_score)} mb-8`}>
              {result.event_score > 0 ? '+' : ''}{result.event_score.toFixed(2)}
            </div>
            <div className="relative h-6 rounded-lg overflow-visible mt-6">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500 via-orange-500 via-slate-500 via-cyan-500 to-emerald-500"></div>
              <div
                className="absolute top-1/2 h-10 w-10 bg-white rounded-full shadow-xl border-4 border-slate-800"
                style={{
                  left: `${((result.event_score + 10) / 20) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
            <div className="flex justify-between text-slate-400 text-sm mt-3">
              <span>-10</span>
              <span>0</span>
              <span>+10</span>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-2 border-slate-700 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${verdict.bgColor} shadow-lg`}>
              <verdict.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Verdict</h2>
              <p className="text-slate-400 text-sm mt-1">Final outcome prediction</p>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-7xl font-bold ${verdict.color} mb-6`}>
              {verdict.text}
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700/40 rounded-lg border border-slate-600/50">
              <span className="text-slate-300 font-medium">Based on Event Score</span>
              <span className={`font-bold ${getSignalColor(result.event_score)}`}>
                {result.event_score > 0 ? '+' : ''}{result.event_score.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {scoreCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => setSelectedMetric(metricDefinitions[card.title])}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 border border-slate-700 rounded-xl p-6 shadow-lg cursor-pointer hover:border-slate-600 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} shadow-lg ${card.shadowColor}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              </div>
              <div className={`text-4xl font-bold ${getSignalColor(card.value)} mb-2`}>
                {card.value > 0 ? '+' : ''}{card.value.toFixed(1)}
              </div>
              <p className="text-slate-400 text-sm mb-4">{card.description}</p>

              {/* Heatmap */}
              <div className="space-y-2">
                <div className="relative h-2.5 rounded-full overflow-visible">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-orange-500 via-slate-500 via-cyan-500 to-emerald-500"></div>
                  <div
                    className="absolute top-1/2 h-5 w-5 bg-white rounded-full shadow-lg border-2 border-slate-800"
                    style={{
                      left: `${getHeatmapPosition(card.value)}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-3">
                  <span>-1.0</span>
                  <span>0</span>
                  <span>+1.0</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-2 border-slate-700 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">Analysis Summary</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Flip Conditions Section */}
      {state.flipConditions?.flip_conditions && state.flipConditions.flip_conditions.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/60 border-2 border-amber-600/50 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Flip Conditions</h2>
              <p className="text-slate-400 text-sm mt-1">Scenarios that could change the outcome</p>
            </div>
          </div>
          <div className="space-y-3">
            {state.flipConditions.flip_conditions.map((condition, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mt-0.5">
                  <span className="text-amber-400 text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{condition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Definition Modal */}
      {selectedMetric && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMetric(null)}
        >
          <div
            className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">{selectedMetric.title}</h2>
              <button
                onClick={() => setSelectedMetric(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-400 hover:text-white" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Definition</h3>
                <p className="text-slate-200 text-lg leading-relaxed">
                  {selectedMetric.definition}
                </p>
              </div>
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Example</h3>
                <p className="text-slate-300 leading-relaxed italic">
                  {selectedMetric.example}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
