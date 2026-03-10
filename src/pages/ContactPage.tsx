import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Send, CheckCircle, Linkedin } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ContactPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) return;

      const { data, error } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        if (data.full_name) setName(data.full_name);
        if (data.email) setEmail(data.email);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://hook.us2.make.com/gn5q1br65cl16au5ctx7h7cseh4r4ypr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate('/my-account');
      }, 3000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
          <p className="text-slate-400 mb-6">
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
          <button
            onClick={() => navigate('/my-account')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto p-8">
        <button
          onClick={() => navigate('/my-account')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Account
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-500" />
            Get in Touch
          </h1>
          <p className="text-slate-400">
            Have a question or need help? Fill out the form below and we'll get back to you.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              rows={8}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            or email us directly at <a href="mailto:operations@hilex.app" className="text-blue-400 hover:text-blue-300 transition-colors underline">operations@hilex.app</a>
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <a
            href="https://www.linkedin.com/search/results/all/?fetchDeterministicClustersOnly=true&heroEntityKey=urn%3Ali%3Aorganization%3A109950133&keywords=hylex%20optimized%20trends&origin=RICH_QUERY_SUGGESTION&position=0&searchId=193d177c-9b19-4dbf-b348-64d3c5bba970&sid=PLZ&spellCorrectionEnabled=false"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
          >
            <Linkedin className="w-5 h-5" />
            <span>Follow us on LinkedIn!</span>
          </a>
          <a
            href="https://x.com/HilEX_Optimized"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
          >
            <span className="w-5 h-5 flex items-center justify-center font-bold text-lg">𝕏</span>
            <span>Follow us on X!</span>
          </a>
          <a
            href="https://t.me/HilexOptimizedTrendsUpdatebot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
          >
            <Send className="w-5 h-5" />
            <span>Join our Telegram for daily updates!</span>
          </a>
        </div>
      </div>
    </div>
  );
}
