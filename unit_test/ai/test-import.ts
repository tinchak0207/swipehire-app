// Simple test to verify Mistral AI imports work correctly
import { Mistral } from '@mistralai/mistralai';

// Test that we can create a client instance
function testImport() {
  try {
    const client = new Mistral({ 
      apiKey: 'test-key' 
    });
    console.log('✅ Mistral import successful');
    console.log('Client type:', typeof client);
    console.log('Has chat method:', typeof client.chat);
    return true;
  } catch (error) {
    console.error('❌ Mistral import failed:', error);
    return false;
  }
}

export { testImport };