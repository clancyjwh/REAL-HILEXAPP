import { supabase } from '../lib/supabase';

// Generate or retrieve session ID from localStorage
export function getSessionId(): string {
  let sessionId = localStorage.getItem('analytics_session_id');

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('analytics_session_id', sessionId);
  }

  return sessionId;
}

// Track page view
export async function trackPageView(
  pagePath: string,
  pageTitle?: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getSessionId();

    let userEmail = null;
    let userName = null;

    if (user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, display_name, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        userEmail = profile.email;
        userName = profile.display_name || profile.full_name;
      }
    }

    await supabase.from('analytics_page_views').insert({
      user_id: user?.id || null,
      session_id: sessionId,
      page_path: pagePath,
      page_title: pageTitle || document.title,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      user_email: userEmail,
      user_name: userName,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

// Track custom event
export async function trackEvent(
  eventName: string,
  eventData?: Record<string, any>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getSessionId();

    let userEmail = null;
    let userName = null;

    if (user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, display_name, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        userEmail = profile.email;
        userName = profile.display_name || profile.full_name;
      }
    }

    await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      session_id: sessionId,
      event_name: eventName,
      event_data: eventData || null,
      page_path: window.location.pathname,
      user_email: userEmail,
      user_name: userName,
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Predefined event tracking functions for common actions
export const analyticsEvents = {
  // Navigation
  clickLink: (linkText: string, destination: string) =>
    trackEvent('link_click', { linkText, destination }),

  // Search
  search: (query: string, resultsCount?: number) =>
    trackEvent('search', { query, resultsCount }),

  // Tool usage
  useTool: (toolName: string, parameters?: Record<string, any>) =>
    trackEvent('tool_used', { toolName, ...parameters }),

  // User actions
  signup: () => trackEvent('user_signup'),
  login: () => trackEvent('user_login'),
  logout: () => trackEvent('user_logout'),

  // Premium features
  upgradeToPremium: () => trackEvent('upgrade_to_premium'),
  viewPremiumFeature: (featureName: string) =>
    trackEvent('premium_feature_viewed', { featureName }),

  // Watchlist
  addToWatchlist: (assetName: string) =>
    trackEvent('watchlist_add', { assetName }),
  removeFromWatchlist: (assetName: string) =>
    trackEvent('watchlist_remove', { assetName }),

  // Content interaction
  viewAnalysis: (assetName: string, analysisType: string) =>
    trackEvent('analysis_viewed', { assetName, analysisType }),
  viewArticle: (articleTitle: string) =>
    trackEvent('article_viewed', { articleTitle }),

  // General clicks
  buttonClick: (buttonName: string, location: string) =>
    trackEvent('button_click', { buttonName, location }),
};
