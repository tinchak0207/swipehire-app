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
  ].filter(Boolean)
};
