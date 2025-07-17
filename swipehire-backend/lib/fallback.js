// Fallback data for when database is unavailable
// Compatible with Cloudflare Workers CommonJS environment

const fallbackJobs = [
    {
        _id: 'fallback-job-1',
        title: 'Software Engineer - Frontend',
        company: 'TechCorp Inc',
        location: 'Remote',
        description: 'We are looking for a skilled frontend developer to join our team...',
        requirements: ['React', 'TypeScript', 'Node.js'],
        salary: '$80,000 - $120,000',
        type: 'Full-time',
        category: 'Engineering',
        skills: ['React', 'JavaScript', 'CSS', 'HTML'],
        postedDate: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        remote: true,
        experienceLevel: 'Mid-level',
        companyLogo: 'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=Tech',
        featured: true
    },
    {
        _id: 'fallback-job-2',
        title: 'Product Designer',
        company: 'Design Studio',
        location: 'San Francisco, CA',
        description: 'Join our creative team as a product designer...',
        requirements: ['Figma', 'UI/UX Design', 'Prototyping'],
        salary: '$70,000 - $100,000',
        type: 'Full-time',
        category: 'Design',
        skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research'],
        postedDate: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        remote: false,
        experienceLevel: 'Mid-level',
        companyLogo: 'https://via.placeholder.com/100x100/10B981/FFFFFF?text=DS',
        featured: false
    },
    {
        _id: 'fallback-job-3',
        title: 'Marketing Manager',
        company: 'StartupX',
        location: 'Remote',
        description: 'Looking for a marketing manager to lead growth initiatives...',
        requirements: ['Digital Marketing', 'SEO', 'Content Strategy'],
        salary: '$60,000 - $90,000',
        type: 'Full-time',
        category: 'Marketing',
        skills: ['SEO', 'Content Marketing', 'Social Media', 'Analytics'],
        postedDate: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        remote: true,
        experienceLevel: 'Senior',
        companyLogo: 'https://via.placeholder.com/100x100/F59E0B/FFFFFF?text=SX',
        featured: true
    }
];

const fallbackUsers = [
    {
        _id: 'fallback-user-1',
        firebaseUid: 'NxyUyIkfrzLTVWWZHAwDfbDozVN2',
        email: 'anewaccfordc@gmail.com',
        name: 'Demo User',
        role: 'candidate',
        profileComplete: true,
        preferences: {
            jobTypes: ['Full-time', 'Remote'],
            industries: ['Technology', 'Design'],
            locations: ['Remote', 'San Francisco']
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

/**
 * Get fallback jobs when database is unavailable
 * @returns {Array} Array of fallback job objects
 */
function getFallbackJobs() {
    return fallbackJobs.map(job => ({
        ...job,
        id: job._id,
        createdAt: job.postedDate,
        isFallback: true
    }));
}

/**
 * Get fallback user data when database is unavailable
 * @param {string} firebaseUid - The Firebase UID to match
 * @returns {Object|null} Fallback user object or null
 */
function getFallbackUser(firebaseUid) {
    const user = fallbackUsers.find(u => u.firebaseUid === firebaseUid);
    if (user) {
        return {
            ...user,
            id: user._id,
            isFallback: true
        };
    }
    return null;
}

/**
 * Create a graceful fallback response
 * @param {string} endpoint - The endpoint being requested
 * @param {Object} params - Request parameters
 * @returns {Object} Fallback response
 */
function createFallbackResponse(endpoint, params = {}) {
    console.log(`Using fallback data for ${endpoint}`);
    
    switch (endpoint) {
        case '/api/jobs':
            return {
                jobs: getFallbackJobs(),
                total: fallbackJobs.length,
                isFallback: true,
                message: 'Using cached job data - database temporarily unavailable'
            };
        
        case '/api/users':
            if (params.firebaseUid) {
                const user = getFallbackUser(params.firebaseUid);
                return user || { error: 'User not found', isFallback: true };
            }
            return {
                users: fallbackUsers,
                total: fallbackUsers.length,
                isFallback: true
            };
        
        default:
            return {
                data: [],
                message: 'Endpoint not implemented in fallback',
                isFallback: true
            };
    }
}

// CommonJS exports
module.exports = {
    getFallbackJobs,
    getFallbackUser,
    createFallbackResponse,
    fallbackJobs,
    fallbackUsers
};