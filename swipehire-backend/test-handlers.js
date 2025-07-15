// Test script for Workers-compatible route handlers
const handleApiRequest = require('./routes/api-workers');
const handleWebhookRequest = require('./routes/webhooks-workers');
const handleAdminRequest = require('./routes/admin-workers');

// Mock environment object
const mockEnv = {};

// Helper to create a mock Request object
function createMockRequest(method, url, body = null, headers = {}) {
    const mockHeaders = new Map();
    Object.entries(headers).forEach(([key, value]) => {
        mockHeaders.set(key.toLowerCase(), value);
    });
    
    const request = {
        method,
        url,
        headers: {
            get: (name) => mockHeaders.get(name.toLowerCase()),
            entries: () => mockHeaders.entries()
        }
    };
    
    if (body) {
        if (typeof body === 'object') {
            request.json = async () => body;
            request.text = async () => JSON.stringify(body);
            mockHeaders.set('content-type', 'application/json');
        } else {
            request.text = async () => body;
        }
    }
    
    return request;
}

// Test cases
async function runTests() {
    console.log('🧪 Testing Workers Route Handlers...\n');
    
    try {
        // Test 1: API Route - Get Public Jobs
        console.log('📋 Test 1: GET /api/jobs (Public Jobs)');
        const request1 = createMockRequest('GET', 'https://api.example.com/api/jobs');
        
        try {
            const response1 = await handleApiRequest(request1, mockEnv);
            console.log(`   Status: ${response1.status}`);
            console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response1.headers.entries()))}`);
            
            if (response1.status === 500) {
                const errorText = await response1.text();
                console.log(`   Error: ${errorText.substring(0, 200)}...`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Test 2: API Route - Create User (POST with body)
        console.log('\n👤 Test 2: POST /api/users (Create User)');
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            selectedRole: 'jobseeker',
            firebaseUid: 'test-uid-123'
        };
        const request2 = createMockRequest('POST', 'https://api.example.com/api/users', userData);
        
        try {
            const response2 = await handleApiRequest(request2, mockEnv);
            console.log(`   Status: ${response2.status}`);
            
            if (response2.status === 500) {
                const errorText = await response2.text();
                console.log(`   Error: ${errorText.substring(0, 200)}...`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Test 3: API Route with Parameters
        console.log('\n🔍 Test 3: GET /api/users/test-123 (Get User by ID)');
        const request3 = createMockRequest('GET', 'https://api.example.com/api/users/test-123');
        
        try {
            const response3 = await handleApiRequest(request3, mockEnv);
            console.log(`   Status: ${response3.status}`);
            
            if (response3.status === 500) {
                const errorText = await response3.text();
                console.log(`   Error: ${errorText.substring(0, 200)}...`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Test 4: Webhook Route
        console.log('\n🪝 Test 4: POST /api/webhooks/formsapp (Webhook)');
        const webhookData = {
            formId: 'test-form',
            submissionId: 'test-submission',
            createdAt: new Date().toISOString(),
            data: {
                'highest-education-level': 'Bachelor',
                'work-experience': 'Software Engineer at Company A',
                'skills': 'JavaScript, Node.js, React',
                'passions': 'Technology, Innovation',
                'job-values': 'Work-life balance, Growth',
                'career-goals': 'Become a senior developer'
            }
        };
        const request4 = createMockRequest('POST', 'https://api.example.com/api/webhooks/formsapp', webhookData);
        
        try {
            const response4 = await handleWebhookRequest(request4, mockEnv);
            console.log(`   Status: ${response4.status}`);
            const responseText = await response4.text();
            console.log(`   Response: ${responseText.substring(0, 200)}...`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Test 5: Admin Route
        console.log('\n⚙️ Test 5: GET /api/admin/users (Admin Users)');
        const request5 = createMockRequest('GET', 'https://api.example.com/api/admin/users');
        
        try {
            const response5 = await handleAdminRequest(request5, mockEnv);
            console.log(`   Status: ${response5.status}`);
            const responseText = await response5.text();
            console.log(`   Response: ${responseText.substring(0, 200)}...`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Test 6: Route Not Found
        console.log('\n❌ Test 6: GET /api/nonexistent (Route Not Found)');
        const request6 = createMockRequest('GET', 'https://api.example.com/api/nonexistent');
        
        try {
            const response6 = await handleApiRequest(request6, mockEnv);
            console.log(`   Status: ${response6.status}`);
            const responseText = await response6.text();
            console.log(`   Response: ${responseText}`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('🚨 Test suite failed:', error);
    }
}

// Run the tests
if (require.main === module) {
    runTests();
}

module.exports = { runTests, createMockRequest };