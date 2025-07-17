/**
 * Simple test script to verify CORS fix
 * 
 * This script tests the CORS configuration by simulating requests
 * from different origins to ensure the backend responds correctly.
 */

// Test origins
const testOrigins = [
  'http://localhost:3000',
  'http://localhost:9002',
  'https://www.swipehire.top',
  'https://swipehire.top',
  'https://example.com', // Should fallback to www.swipehire.top
];

async function testCors() {
  console.log('🔍 Testing CORS configuration...\n');

  const baseUrl = process.env.BACKEND_URL || 'https://swipehire-backend.swipehire.workers.dev';
  
  for (const origin of testOrigins) {
    try {
      console.log(`Testing origin: ${origin}`);
      
      // Test preflight (OPTIONS) request
      const optionsResponse = await fetch(`${baseUrl}/api/jobs`, {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      console.log(`  OPTIONS Status: ${optionsResponse.status}`);
      console.log(`  CORS Headers:`);
      console.log(`    Access-Control-Allow-Origin: ${optionsResponse.headers.get('Access-Control-Allow-Origin')}`);
      console.log(`    Access-Control-Allow-Methods: ${optionsResponse.headers.get('Access-Control-Allow-Methods')}`);
      console.log(`    Access-Control-Allow-Headers: ${optionsResponse.headers.get('Access-Control-Allow-Headers')}`);
      
      // Test actual GET request
      const getResponse = await fetch(`${baseUrl}/api/jobs`, {
        method: 'GET',
        headers: {
          'Origin': origin
        }
      });
      
      console.log(`  GET Status: ${getResponse.status}`);
      console.log(`  CORS Headers:`);
      console.log(`    Access-Control-Allow-Origin: ${getResponse.headers.get('Access-Control-Allow-Origin')}`);
      
      // Verify the origin is correctly handled
      const allowedOrigin = getResponse.headers.get('Access-Control-Allow-Origin');
      const expectedOrigin = origin.includes('localhost') || origin.includes('swipehire') 
        ? origin 
        : 'https://www.swipehire.top';
      
      if (allowedOrigin === expectedOrigin) {
        console.log(`  ✅ CORS correctly configured for ${origin}`);
      } else {
        console.log(`  ❌ CORS issue: expected ${expectedOrigin}, got ${allowedOrigin}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

// Run the test
if (require.main === module) {
  testCors().catch(console.error);
}

module.exports = { testCors };