module.exports = {
  PORT: process.env.PORT || 5000,
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  NEXTJS_APP_URL: process.env.NEXTJS_INTERNAL_APP_URL || 'http://localhost:3000',
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME || 'YOUR_GCS_BUCKET_NAME_HERE',
  FORMSAPP_WEBHOOK_SECRET: process.env.FORMSAPP_WEBHOOK_SECRET,
  USE_REDIS_ADAPTER: process.env.USE_REDIS_ADAPTER === 'true',
  
  allowedOrigins: [
    process.env.FRONTEND_URL_PRIMARY,
    process.env.FRONTEND_URL_SECONDARY,
    process.env.FRONTEND_URL_TERTIARY,
    process.env.FRONTEND_URL_QUATERNARY,
    'http://localhost:3000',
    'http://localhost:9002',
    'https://6000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    'https://swipehire.top',
    'http://swipehire.top',
    'https://www.swipehire.top',
    'http://www.swipehire.top'
  ].filter(Boolean),

  corsOptions: {
    origin: function (origin, callback) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[CORS Check] Request origin: ${origin}`);
      }
      const isAllowed = !origin || module.exports.allowedOrigins.includes(origin) || 
                       (process.env.NODE_ENV !== 'production' && origin && origin.startsWith('http://localhost:'));
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin: ${origin}. Allowed origins: ${module.exports.allowedOrigins ? module.exports.allowedOrigins.join(', ') : 'none configured'}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-HTTP-Method-Override', 'X-Firebase-AppCheck', 'X-Firebase-Auth'],
    credentials: true
  }
};
