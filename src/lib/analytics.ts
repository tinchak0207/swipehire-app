export interface EventProperties {
  [key: string]: any;
}

export function logAnalyticsEvent(eventName: string, properties?: EventProperties): void {
  console.log(`[ANALYTICS EVENT]: ${eventName}`, properties || '');
  // In a real application, this would send data to an analytics service
  // For example:
  // if (typeof window !== 'undefined' && window.gtag) {
  //   window.gtag('event', eventName, properties);
  // } else if (typeof window !== 'undefined' && window.amplitude) {
  //   window.amplitude.getInstance().logEvent(eventName, properties);
  // }
}
