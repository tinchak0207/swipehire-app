module.exports = async () => {
  // Global setup for all tests
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-domain';
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-bucket';
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test-sender-id';
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';

  // Set up any global test database or services here
  console.log('🧪 Setting up global test environment...');
};
