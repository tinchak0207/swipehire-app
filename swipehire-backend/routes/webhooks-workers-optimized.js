const crypto = require('crypto');
const { FORMSAPP_WEBHOOK_SECRET } = require('../config/constants');

// Native Workers utility functions
class WorkersUtils {
    static createJsonResponse(data, status = 200) {
        return new Response(JSON.stringify(data), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    static createErrorResponse(message, status = 500) {
        return WorkersUtils.createJsonResponse({ error: message }, status);
    }
}

// Verify Forms.app webhook signature
function verifyWebhookSignature(body, secret, signature) {
    if (!signature) return false;
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const computedSignature = hmac.digest('hex');
    
    return signature === computedSignature;
}

// Optimized Forms.app webhook handler
async function handleFormsAppWebhook(request) {
    try {
        const body = await request.text();
        let data;
        
        try {
            data = JSON.parse(body);
        } catch (e) {
            return WorkersUtils.createErrorResponse('Invalid JSON', 400);
        }
        
        // Verify webhook signature if secret is configured
        if (FORMSAPP_WEBHOOK_SECRET) {
            const signature = request.headers.get('x-formsapp-signature');
            if (!verifyWebhookSignature(body, FORMSAPP_WEBHOOK_SECRET, signature)) {
                return WorkersUtils.createErrorResponse('Invalid signature', 401);
            }
        }
        
        const { formId, submissionId, createdAt, data: formData } = data;
        
        // Validate required fields
        if (!formId || !submissionId) {
            return WorkersUtils.createErrorResponse('Missing required fields: formId or submissionId', 400);
        }
        
        // Map fields to career planning data structure
        const formattedData = {
            education: formData['highest-education-level'] || '',
            experience: formData['work-experience']?.split('\\n').filter(Boolean) || [],
            skills: formData['skills']?.split(',').map(s => s.trim()).filter(Boolean) || [],
            interests: formData['passions']?.split(',').map(s => s.trim()).filter(Boolean) || [],
            values: formData['job-values']?.split(',').map(s => s.trim()).filter(Boolean) || [],
            careerExpectations: formData['career-goals'] || ''
        };

        // Log successful processing
        console.log(`Received forms.app submission ${submissionId} for form ${formId}`);
        
        // TODO: Store in database when database connection is available
        
        // Return success response
        return WorkersUtils.createJsonResponse({
            success: true,
            formId,
            submissionId,
            processedAt: new Date().toISOString(),
            processed: {
                education: formattedData.education,
                experienceCount: formattedData.experience.length,
                skillsCount: formattedData.skills.length,
                interestsCount: formattedData.interests.length,
                valuesCount: formattedData.values.length,
                hasCareerGoals: !!formattedData.careerExpectations
            }
        });
        
    } catch (error) {
        console.error('Error processing forms.app webhook:', error);
        return WorkersUtils.createErrorResponse('Failed to process webhook', 500);
    }
}

// Route handler mapping
const webhookRoutes = {
    '/api/webhooks/formsapp': handleFormsAppWebhook
};

// Main optimized handler function for webhook requests
async function handleWebhookRequest(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    
    // Only handle POST requests for webhooks
    if (method !== 'POST') {
        return WorkersUtils.createErrorResponse('Method not allowed for webhooks', 405);
    }
    
    // Find matching webhook route
    const handler = webhookRoutes[pathname];
    if (!handler) {
        return WorkersUtils.createErrorResponse('Webhook route not found', 404);
    }
    
    // Call the specific webhook handler
    return await handler(request);
}

module.exports = handleWebhookRequest;