module.exports = {
  PORT: process.env.PORT || 5000,
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  NEXTJS_APP_URL: process.env.NEXTJS_INTERNAL_APP_URL || 'http://localhost:3000',
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME || 'YOUR_GCS_BUCKET_NAME_HERE',
  FORMSAPP_WEBHOOK_SECRET: process.env.FORMSAPP_WEBHOOK_SECRET,
  USE_REDIS_ADAPTER: process.env.USE_REDIS_ADAPTER === 'true',
  
  allowedOrigins: [
    // Environment-based origins
    process.env.FRONTEND_URL_PRIMARY,
    process.env.FRONTEND_URL_SECONDARY,
    process.env.FRONTEND_URL_TERTIARY,
    process.env.FRONTEND_URL_QUATERNARY,
    
    // Development origins
    'http://localhost:3000',
    'http://localhost:9002',
    
    // Cloud Workstation origins
    'https://6000-firebase-studio-1748064333696.cluster-iktsryn7xnhpexlu6255bftka4.cloudworkstations.dev',
    
    // Production origins - SwipeHire
    'https://swipehire.top',
    'http://swipehire.top',
    'https://www.swipehire.top',
    'http://www.swipehire.top',
    
    // Additional production origins (if needed)
    'https://swipehire.vercel.app',
    'https://swipehire-app.vercel.app'
  ].filter(Boolean),

  corsOptions: {
    origin: function (origin, callback) {
      // Enhanced logging for production debugging
      console.log(`[CORS Check] Request origin: ${origin}`);
      console.log(`[CORS Check] NODE_ENV: ${process.env.NODE_ENV}`);
      console.log(`[CORS Check] Allowed origins: ${module.exports.allowedOrigins.join(', ')}`);
      
      const isAllowed = !origin || 
                       module.exports.allowedOrigins.includes(origin) || 
                       (process.env.NODE_ENV !== 'production' && origin && origin.startsWith('http://localhost:'));
      
      if (isAllowed) {
        console.log(`[CORS Allowed] Origin: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin: ${origin}. Allowed origins: ${module.exports.allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'X-HTTP-Method-Override', 
      'X-Firebase-AppCheck', 
      'X-Firebase-Auth',
      'Accept',
      'Origin',
      'User-Agent',
      'Cache-Control'
    ],
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
    preflightContinue: false
  }
};