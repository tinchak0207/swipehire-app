// Simple Workers-compatible webhook handler

// Native Workers utility functions
class WorkersUtils {
    static createJsonResponse(data, status = 200) {
        return new Response(JSON.stringify(data), {
            status,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'https://www.swipehire.top',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    }
    
    static createErrorResponse(message, status = 500) {
        return WorkersUtils.createJsonResponse({ error: message }, status);
    }
}

// Simplified webhook handler
async function handleFormsAppWebhook(request) {
    try {
        const body = await request.text();
        let data;
        
        try {
            data = JSON.parse(body);
        } catch (e) {
            return WorkersUtils.createErrorResponse('Invalid JSON', 400);
        }
        
        const { formId, submissionId, createdAt, data: formData } = data;
        
        // Validate required fields
        if (!formId || !submissionId) {
            return WorkersUtils.createErrorResponse('Missing required fields: formId or submissionId', 400);
        }
        
        // Log successful processing
        console.log(`Received forms.app submission ${submissionId} for form ${formId}`);
        
        // Return success response
        return WorkersUtils.createJsonResponse({
            success: true,
            message: 'Webhook received successfully',
            formId,
            submissionId,
            processedAt: new Date().toISOString(),
            note: 'Full processing requires database connection'
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

// Main handler function for webhook requests
export default async function handleWebhookRequest(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    
    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://www.swipehire.top',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    }
    
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