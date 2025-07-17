// Centralized API configuration
interface ApiConfig {
  baseUrl: string | undefined;
  endpoints: {
    user: string;
    resume: string;
    health: string;
    jobs: string;
    matches: string;
    chat: string;
    reviews: string;
    diary: string;
    events: string;
    notifications: string;
    followup: string;
    [key: string]: string;
  };
  getUrl: (endpoint: keyof ApiConfig['endpoints'], path?: string) => string;
}

const API_CONFIG: ApiConfig = {
  baseUrl: process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || process.env['NEXT_PUBLIC_RAILWAY_URL'] || 'https://swipehire.railway.app',

  endpoints: {
    user: '/api/users',
    resume: '/api/resume',
    health: '/api/health',
    jobs: '/api/jobs',
    matches: '/api/matches',
    chat: '/api/chat',
    reviews: '/api/reviews',
    diary: '/api/diary',
    events: '/api/events',
    notifications: '/api/notifications',
    followup: '/api/followup',
  },

  getUrl(endpoint, path = '') {
    if (!this.baseUrl) {
      throw new Error('API base URL is not set');
    }
    return `${this.baseUrl}${this.endpoints[endpoint]}${path}`;
  }
};

export default API_CONFIG;
