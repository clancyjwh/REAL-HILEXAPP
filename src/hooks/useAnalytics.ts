import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

// Hook to automatically track page views
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track page view whenever the route changes
    trackPageView(location.pathname + location.search);
  }, [location]);
}
