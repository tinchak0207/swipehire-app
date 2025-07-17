#!/usr/bin/env node

/**
 * Simple deployment test script
 * Tests key endpoints to verify the backend is working
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://swipehire-backend.swipehire.workers.dev';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`Testing ${description}...`);
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${description}: OK (${response.status})`);
      return true;
    } else {
      console.log(`❌ ${description}: FAILED (${response.status}) - ${data.error || data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description}: ERROR - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Running deployment tests...\n');
  
  const tests = [
    ['/health', 'Health check endpoint'],
    ['/api/jobs/public', 'Public jobs endpoint'],
    ['/api/users/profiles/jobseekers', 'Jobseeker profiles endpoint']
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const [endpoint, description] of tests) {
    const result = await testEndpoint(endpoint, description);
    if (result) passed++;
  }
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is ready for production.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the logs above.');
    process.exit(1);
  }
}

runTests();