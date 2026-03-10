import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Newspaper, ExternalLink } from 'lucide-react';

export default function AINewsfeedToolResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { input, type } = location.state || {};
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!input || !type) {
      navigate('/tools/ai-newsfeed');
      return;
    }

    if (hasCalledRef.current) {
      return;
    }

    hasCalledRef.current = true;
    fetchNews();
  }, [input, type]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && progress < 95) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + (95 - prev) * 0.01;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isLoading, progress]);

  const fetchNews = async () => {
    try {
      const webhookResponse = await fetch('https://hook.us2.make.com/1jceva12y0wt6vsgeqh0b1acwcatr8ak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input,
          type: type,
        }),
      });

      const data = await webhookResponse.text();
      setProgress(100);
      setResponse(data);
      setSources(extractSources(data));
    } catch (err) {
      setProgress(100);
      setError('Failed to fetch news. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractSources = (text: string) => {
    const extractedSources: string[] = [];

    const urlRegex = /(https?:\/\/[^\s\)]+)/g;
    const lines = text.split('\n');
    let inSourcesSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('sources:') || line.toLowerCase().trim() === 'sources') {
        inSourcesSection = true;
        continue;
      }

      if (inSourcesSection) {
        const matches = line.match(urlRegex);
        if (matches) {
          matches.forEach(url => {
            const cleanUrl = url.replace(/[.,;!?\)]$/, '');
            if (!extractedSources.includes(cleanUrl)) {
              extractedSources.push(cleanUrl);
            }
          });
        }
      }
    }

    return extractedSources;
  };

  const formatContent = (text: string) => {
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
    const sections = cleanText.split('\n\n');

    return sections.map((section, idx) => {
      if (section.toLowerCase().includes('sources:') || section.toLowerCase().startsWith('sources')) {
        return null;
      }

      const lines = section.split('\n');
      return (
        <div key={idx} className="mb-6">
          {lines.map((line, lineIdx) => {
            if (!line.trim()) return null;

            if (line.startsWith('–') || line.startsWith('-')) {
              return (
                <div key={lineIdx} className="flex gap-3 mb-2 ml-4">
                  <span className="text-cyan-400 flex-shrink-0">•</span>
                  <span className="text-slate-200 leading-relaxed">{line.substring(1).trim()}</span>
                </div>
              );
            }

            const isHeading = line.endsWith(':') && line.length < 50;
            if (isHeading) {
              return (
                <h3 key={lineIdx} className="text-lg font-bold text-white mt-6 mb-3">
                  {line.replace(/:/g, '')}
                </h3>
              );
            }

            return (
              <p key={lineIdx} className="text-slate-200 leading-relaxed mb-3">
                {line}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto p-8">
        <button
          onClick={() => navigate('/tools/ai-newsfeed')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to AI Newsfeed
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Newspaper className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">News Analysis</h1>
              <p className="text-slate-400">
                {type === 'quick' ? 'Quick Search' : type === 'balanced' ? 'Balanced Search' : 'Deep Search'}
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-slate-300 font-medium">
                  Analyzing news sources and generating insights...
                </span>
                <span className="text-white font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-500 transition-all duration-300 ease-out animate-pulse"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-500"></div>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-slate-300">{error}</p>
          </div>
        )}

        {!isLoading && !error && response && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                Analysis Results
              </h2>
            </div>
            <div className="p-8">
              <div className="prose prose-invert max-w-none">
                {formatContent(response)}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-700">
                {sources.length > 0 ? (
                  <div className="flex justify-center">
                    <button
                      onClick={() => navigate('/sources', { state: { sources } })}
                      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Sources ({sources.length})
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center italic">
                    No sources cited: information synthesized from standard market coverage practices.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
