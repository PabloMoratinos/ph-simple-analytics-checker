
/**
 * Utility for generating mock analytics data for development
 */
import { AnalyticsData } from '@/hooks/useAnalyticsDetection';

/**
 * Generates random analytics data for development/testing
 * @returns Analytics data with random values
 */
export const generateMockAnalyticsData = (): AnalyticsData => {
  const hasGTM = Math.random() > 0.3;
  const hasGA4 = Math.random() > 0.3;
  const hasAdobe = Math.random() > 0.3;
  const hasAmplitude = Math.random() > 0.3;
  
  const gtmIds = hasGTM ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
    (_, i) => `GTM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`) : [];
  
  const ga4Ids = hasGA4 ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
    (_, i) => `G-${Math.random().toString(36).substring(2, 10).toUpperCase()}`) : [];
  
  const adobeIds = hasAdobe ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
    (_, i) => `${Math.random() > 0.5 ? 'launch-' : ''}${Math.random().toString(36).substring(2, 10).toUpperCase()}`) : [];
  
  const amplitudeIds = hasAmplitude ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
    (_, i) => `${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('').toUpperCase()}`) : [];
  
  return {
    gtm: { detected: hasGTM, ids: gtmIds },
    ga4: { detected: hasGA4, ids: ga4Ids },
    adobe: { detected: hasAdobe, ids: adobeIds },
    amplitude: { detected: hasAmplitude, ids: amplitudeIds },
    isLoading: false
  };
};
