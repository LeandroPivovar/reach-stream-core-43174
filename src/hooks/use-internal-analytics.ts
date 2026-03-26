import { useCallback } from 'react';
import { api, InternalAnalyticsEvent } from '@/lib/api';

export function useInternalAnalytics() {
  const trackEvent = useCallback(async (data: InternalAnalyticsEvent) => {
    try {
      await api.trackEvent(data);
    } catch (error) {
      // Silenciosamente falha para não interromper a UX do usuário
      console.warn('Analytics tracking failed:', error);
    }
  }, []);

  const trackPageView = useCallback((pageName: string) => {
    return trackEvent({
      type: 'page_view',
      name: pageName,
      metadata: {
        url: window.location.href,
        referrer: document.referrer,
      },
    });
  }, [trackEvent]);

  const trackAction = useCallback((actionName: string, metadata?: any) => {
    return trackEvent({
      type: 'action',
      name: actionName,
      metadata,
    });
  }, [trackEvent]);

  return {
    trackPageView,
    trackAction,
  };
}
