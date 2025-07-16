export const PORT = process.env.PORT || 5000;
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
export const NEXTJS_APP_URL = process.env.NEXTJS_INTERNAL_APP_URL || 'http://localhost:3000';
export const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'YOUR_GCS_BUCKET_NAME_HERE';
export const FORMSAPP_WEBHOOK_SECRET = process.env.FORMSAPP_WEBHOOK_SECRET;
export const USE_REDIS_ADAPTER = process.env.USE_REDIS_ADAPTER === 'true';

export const allowedOrigins = [
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
].filter(Boolean);

export default {
    PORT,
    REDIS_URL,
    NEXTJS_APP_URL,
    GCS_BUCKET_NAME,
    FORMSAPP_WEBHOOK_SECRET,
    USE_REDIS_ADAPTER,
    allowedOrigins
};