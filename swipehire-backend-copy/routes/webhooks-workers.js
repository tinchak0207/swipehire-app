const crypto = require('crypto');
const { FORMSAPP_WEBHOOK_SECRET } = require('../config/constants');

// Verify Forms.app webhook signature
function verifyWebhookSignature(body, secret, signature) {
    if (!signature) return false;
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const computedSignature = hmac.digest('hex');
    
    return signature === computedSignature;
}

// Main handler function for webhook requests
async function handleWebhookRequest(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Handle Forms.app webhook
    if (pathname === '/api/webhooks/formsapp' && request.method === 'POST') {
        try {
            const body = await request.text();
            let data;
            
            try {
                data = JSON.parse(body);
            } catch (e) {
                return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // Verify webhook if secret is configured
            if (FORMSAPP_WEBHOOK_SECRET) {
                const signature = request.headers.get('x-formsapp-signature');
                if (!verifyWebhookSignature(body, FORMSAPP_WEBHOOK_SECRET, signature)) {
                    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
                        status: 401,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
            
            const { formId, submissionId, createdAt, data: formData } = data;
            
            // Map fields to our career planning data structure
            const formattedData = {
                education: formData['highest-education-level'] || '',
                experience: formData['work-experience']?.split('\\n').filter(Boolean) || [],
                skills: formData['skills']?.split(',').map(s => s.trim()).filter(Boolean) || [],
                interests: formData['passions']?.split(',').map(s => s.trim()).filter(Boolean) || [],
                values: formData['job-values']?.split(',').map(s => s.trim()).filter(Boolean) || [],
                careerExpectations: formData['career-goals'] || ''
            };

            // Store in database - this is a conceptual example
            console.log(`Received forms.app submission ${submissionId} for form ${formId}`);
            
            // Return success response
            return new Response(JSON.stringify({
                success: true,
                formId,
                submissionId,
                processedAt: new Date().toISOString()
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            
        } catch (error) {
            console.error('Error processing forms.app webhook:', error);
            return new Response(JSON.stringify({ error: 'Failed to process webhook' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
    
    // Route not found
    return new Response(JSON.stringify({ error: 'Webhook route not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}

module.exports = handleWebhookRequest;