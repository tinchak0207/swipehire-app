const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { FORMSAPP_WEBHOOK_SECRET } = require('../config/constants');

// Verify Forms.app webhook signature
function verifyWebhookSignature(req, secret) {
    const signature = req.header('x-formsapp-signature');
    if (!signature) return false;
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(req.body));
    const computedSignature = hmac.digest('hex');
    
    return signature === computedSignature;
}

// Webhook endpoint for Forms.app submissions
router.post('/formsapp', express.json({limit: '1mb'}), async (req, res) => {
    // Verify webhook if secret is configured
    if (FORMSAPP_WEBHOOK_SECRET && !verifyWebhookSignature(req, FORMSAPP_WEBHOOK_SECRET)) {
        return res.status(401).json({error: 'Invalid signature'});
    }

    try {
        const { formId, submissionId, createdAt, data } = req.body;
        
        // Map fields to our career planning data structure
        const formattedData = {
            education: data['highest-education-level'] || '',
            experience: data['work-experience']?.split('\\n').filter(Boolean) || [],
            skills: data['skills']?.split(',').map(s => s.trim()).filter(Boolean) || [],
            interests: data['passions']?.split(',').map(s => s.trim()).filter(Boolean) || [],
            values: data['job-values']?.split(',').map(s => s.trim()).filter(Boolean) || [],
            careerExpectations: data['career-goals'] || ''
        };

        // Store in database - this is a conceptual example
        console.log(`Received forms.app submission ${submissionId} for form ${formId}`);
        
        // Return success response
        res.json({
            success: true,
            formId,
            submissionId,
            processedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing forms.app webhook:', error);
        res.status(500).json({error: 'Failed to process webhook'});
    }
});

module.exports = router;
