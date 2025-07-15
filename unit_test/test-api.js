// Simple test to verify API route is working
console.log('🧪 Testing Events API Route...\n');

// Create a simple test function
async function testEventsAPI() {
  try {
    console.log('Testing API route: /api/events');

    // Mock the NextRequest and NextResponse
    const mockRequest = {
      url: 'http://localhost:3000/api/events?page=1&limit=12',
      nextUrl: new URL('http://localhost:3000/api/events?page=1&limit=12'),
    };

    // Import the route handler
    const { GET } = require('./src/app/api/events/route.ts');

    // Call the API function
    const response = await GET(mockRequest);
    const data = await response.json();

    console.log('✅ API Response Status:', response.status);
    console.log('✅ Events Count:', data.events?.length || 0);
    console.log('✅ Total Count:', data.totalCount || 0);
    console.log('✅ Has More:', data.hasMore);

    if (data.events && data.events.length > 0) {
      console.log('✅ Sample Event:', data.events[0].title);
      console.log('✅ API is working correctly!');
    } else {
      console.log('❌ No events returned');
    }
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

// Run the test
testEventsAPI();
