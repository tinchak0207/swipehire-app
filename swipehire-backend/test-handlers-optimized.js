// Test script for optimized Workers-compatible route handlers
const handleApiRequest = require('./routes/api-workers-optimized');
const handleWebhookRequest = require('./routes/webhooks-workers-optimized');
const handleAdminRequest = require('./routes/admin-workers-optimized');

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

// Performance test function
async function performanceTest(handler, request, testName) {
    const start = performance.now();
    const response = await handler(request, mockEnv);
    const end = performance.now();
    
    console.log(`${testName}: ${(end - start).toFixed(2)}ms`);
    return response;
}

// Test cases
async function runOptimizedTests() {
    console.log('🚀 Testing Optimized Workers Route Handlers...\n');
    
    try {
        // Test 1: API Route - Get Public Jobs
        console.log('📋 Test 1: GET /api/jobs (Public Jobs) - Optimized');
        const request1 = createMockRequest('GET', 'https://api.example.com/api/jobs');
        
        try {
            const response1 = await performanceTest(handleApiRequest, request1, 'API Performance');
            console.log(`   Status: ${response1.status}`);
            console.log(`   Content-Type: ${response1.headers.get('content-type')}`);
            
            if (response1.status === 500) {
                const errorText = await response1.text();
                console.log(`   Error: ${errorText.substring(0, 100)}...`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Test 2: API Route - Create User with validation
        console.log('\n👤 Test 2: POST /api/users (Create User) - Optimized');
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            selectedRole: 'jobseeker',
            firebaseUid: 'test-uid-123'
        };
        const request2 = createMockRequest('POST', 'https://api.example.com/api/users', userData);
        
        try {
            const response2 = await performanceTest(handleApiRequest, request2, 'API Performance');
            console.log(`   Status: ${response2.status}`);
            
            if (response2.status === 500) {
                const errorText = await response2.text();
                console.log(`   Error: ${errorText.substring(0, 100)}...`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Test 3: Enhanced Webhook Test
        console.log('\n🪝 Test 3: POST /api/webhooks/formsapp (Enhanced Webhook) - Optimized');
        const webhookData = {
            formId: 'test-form-123',
            submissionId: 'submission-456',
            createdAt: new Date().toISOString(),
            data: {
                'highest-education-level': 'Master\'s Degree',
                'work-experience': 'Senior Software Engineer at Tech Corp\\nFull-stack Developer at StartupXYZ',
                'skills': 'JavaScript, Python, React, Node.js, MongoDB',
                'passions': 'Machine Learning, Open Source, Mentoring',
                'job-values': 'Work-life balance, Remote work, Innovation, Growth opportunities',
                'career-goals': 'Lead a development team and architect scalable systems'
            }
        };
        const request3 = createMockRequest('POST', 'https://api.example.com/api/webhooks/formsapp', webhookData);
        
        try {
            const response3 = await performanceTest(handleWebhookRequest, request3, 'Webhook Performance');
            console.log(`   Status: ${response3.status}`);
            const responseText = await response3.text();
            const responseData = JSON.parse(responseText);
            console.log(`   Success: ${responseData.success}`);
            console.log(`   Processed: ${JSON.stringify(responseData.processed)}`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Test 4: Admin Route with Parameters
        console.log('\n⚙️ Test 4: PUT /api/admin/diary-posts/post123/status (Admin Update) - Optimized');
        const statusData = { status: 'approved' };
        const request4 = createMockRequest('PUT', 'https://api.example.com/api/admin/diary-posts/post123/status', statusData);
        
        try {
            const response4 = await performanceTest(handleAdminRequest, request4, 'Admin Performance');
            console.log(`   Status: ${response4.status}`);
            const responseText = await response4.text();
            const responseData = JSON.parse(responseText);
            console.log(`   Success: ${responseData.success}`);
            console.log(`   Post ID: ${responseData.postId}`);
            console.log(`   New Status: ${responseData.status}`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Test 5: Error handling - Invalid webhook
        console.log('\n❌ Test 5: POST /api/webhooks/invalid (Invalid Route) - Optimized');
        const request5 = createMockRequest('POST', 'https://api.example.com/api/webhooks/invalid', {});
        
        try {
            const response5 = await performanceTest(handleWebhookRequest, request5, 'Error Performance');
            console.log(`   Status: ${response5.status}`);
            const errorText = await response5.text();
            console.log(`   Error: ${errorText}`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Test 6: Method validation
        console.log('\n🚫 Test 6: GET /api/webhooks/formsapp (Invalid Method) - Optimized');
        const request6 = createMockRequest('GET', 'https://api.example.com/api/webhooks/formsapp');
        
        try {
            const response6 = await performanceTest(handleWebhookRequest, request6, 'Method Validation');
            console.log(`   Status: ${response6.status}`);
            const errorText = await response6.text();
            console.log(`   Error: ${errorText}`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        console.log('\n✅ All optimized tests completed!');
        
    } catch (error) {
        console.error('🚨 Optimized test suite failed:', error);
    }
}

// Run the tests
if (require.main === module) {
    runOptimizedTests();
}

module.exports = { runOptimizedTests, createMockRequest };