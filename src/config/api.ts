// Centralized API configuration
interface ApiConfig {
  baseUrl: string | undefined;
  endpoints: {
    user: string;
    resume: string;
    health: string;
    [key: string]: string; // Allow additional endpoints
  };
  getUrl: (endpoint: keyof ApiConfig['endpoints'], path?: string) => string;
}

const API_CONFIG: ApiConfig = {
  baseUrl: process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'],
  
  endpoints: {
    user: '/api/users',
    resume: '/api/resume',
    health: '/api/health',
    // Add more endpoints as needed
  },

  getUrl(endpoint, path = '') {
    if (!this.baseUrl) {
      throw new Error('NEXT_PUBLIC_CUSTOM_BACKEND_URL environment variable is not set');
    }
    return `${this.baseUrl}${this.endpoints[endpoint]}${path}`;
  }
};

export default API_CONFIG;
