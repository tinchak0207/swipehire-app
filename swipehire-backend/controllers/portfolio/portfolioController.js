const mongoose = require('mongoose');
const Portfolio = require('../../models/Portfolio');
const User = require('../../models/User');
const { GCS_BUCKET_NAME } = require('../../config/constants');
const { Storage } = require('@google-cloud/storage');

const storageGCS = new Storage();

// Simple authentication middleware function
const extractUserFromAuth = async (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // For testing, create or find a test user
            let testUser = await User.findOne({ firebaseUid: 'mock-user-id-123' });
            if (!testUser) {
                testUser = new User({
                    name: 'Test User',
                    email: 'test@example.com',
                    firebaseUid: 'mock-user-id-123',
                    selectedRole: 'jobseeker'
                });
                await testUser.save();
            }
            return testUser._id.toString();
        }
        
        // Extract the user ID from the token
        const firebaseUid = authHeader.substring(7);  // Remove 'Bearer '
        
        if (!firebaseUid) {
            return null;
        }
        
        // Find user by firebaseUid and return their MongoDB _id
        const user = await User.findOne({ firebaseUid });
        return user ? user._id.toString() : null;
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
};

// Helper function to generate unique URL slug
const generateUniqueSlug = async (title, userId) => {
    const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await Portfolio.findOne({ url: slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
};

// Helper function to select specific fields from a portfolio object
const selectPortfolioFields = (portfolioObject) => {
    if (!portfolioObject) return null;
    
    return {
        _id: portfolioObject._id,
        userId: portfolioObject.userId,
        title: portfolioObject.title,
        description: portfolioObject.description,
        projects: portfolioObject.projects,
        layout: portfolioObject.layout,
        tags: portfolioObject.tags,
        isPublished: portfolioObject.isPublished,
        visibility: portfolioObject.visibility,
        url: portfolioObject.url,
        theme: portfolioObject.theme,
        customCss: portfolioObject.customCss,
        seoTitle: portfolioObject.seoTitle,
        seoDescription: portfolioObject.seoDescription,
        socialImage: portfolioObject.socialImage,
        stats: portfolioObject.stats,
        projectCount: portfolioObject.projectCount,
        publishedProjectCount: portfolioObject.publishedProjectCount,
        createdAt: portfolioObject.createdAt,
        updatedAt: portfolioObject.updatedAt
    };
};

// Create a new portfolio
const createPortfolio = async (req, res) => {
    try {
        const userId = await extractUserFromAuth(req);
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User authentication required' 
            });
        }

        const { 
            title, 
            description, 
            projects = [], 
            layout = 'grid',
            tags = [],
            isPublished = false,
            visibility = 'private',
            theme = 'default',
            customCss = '',
            seoTitle,
            seoDescription,
            socialImage
        } = req.body;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Portfolio title is required' 
            });
        }

        // Generate unique URL slug
        const url = await generateUniqueSlug(title, userId);

        // Create portfolio with processed projects
        const processedProjects = projects.map((project, index) => ({
            ...project,
            order: project.order !== undefined ? project.order : index,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        const portfolioData = {
            userId: new mongoose.Types.ObjectId(userId),
            title: title.trim(),
            description: description?.trim() || '',
            projects: processedProjects,
            layout,
            tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
            isPublished,
            visibility,
            url,
            theme,
            customCss,
            seoTitle: seoTitle?.trim() || title.trim(),
            seoDescription: seoDescription?.trim() || description?.trim() || '',
            socialImage: socialImage?.trim() || ''
        };

        const portfolio = new Portfolio(portfolioData);
        await portfolio.save();

        const responsePortfolio = selectPortfolioFields(portfolio.toObject());

        res.status(201).json({
            success: true,
            message: 'Portfolio created successfully',
            data: responsePortfolio
        });

    } catch (error) {
        console.error('Error creating portfolio:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({ 
                success: false, 
                message: 'Portfolio URL already exists. Please try a different title.' 
            });
        }
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Failed to create portfolio' 
        });
    }
};

// Get all portfolios for a user
const getUserPortfolios = async (req, res) => {
    try {
        const { userId: paramUserId } = req.params;
        const { includePrivate = 'true', page = 1, limit = 10 } = req.query;
        
        const requesterId = await extractUserFromAuth(req);
        if (!requesterId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        // If no userId in params (using /portfolios/my route), use authenticated user's ID
        const userId = paramUserId || requesterId;
        
        // Validate that userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid User ID format'
            });
        }

        const isOwner = requesterId === userId;
        const shouldIncludePrivate = includePrivate === 'true' && isOwner;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const portfolios = await Portfolio.findByUser(userId, shouldIncludePrivate)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'name profileAvatarUrl')
            .lean();

        const totalCount = await Portfolio.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            ...(shouldIncludePrivate ? {} : { 
                isPublished: true, 
                visibility: { $in: ['public', 'unlisted'] } 
            })
        });

        const responsePortfolios = portfolios.map(selectPortfolioFields);

        res.json({
            success: true,
            data: responsePortfolios,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalCount,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching user portfolios:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch portfolios' 
        });
    }
};

// Get a specific portfolio by ID
const getPortfolioById = async (req, res) => {
    try {
        const { id } = req.params;
        const { incrementViews = 'false' } = req.query;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid portfolio ID' 
            });
        }

        const portfolio = await Portfolio.findById(id)
            .populate('userId', 'name profileAvatarUrl email')
            .lean();

        if (!portfolio) {
            return res.status(404).json({ 
                success: false, 
                message: 'Portfolio not found' 
            });
        }

        // Check if user has permission to view this portfolio
        const requesterId = await extractUserFromAuth(req);
        const isOwner = requesterId === portfolio.userId.toString();
        const isPublicAccess = portfolio.isPublished && 
            ['public', 'unlisted'].includes(portfolio.visibility);

        if (!isOwner && !isPublicAccess) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied to this portfolio' 
            });
        }

        // Increment view count if requested and not the owner
        if (incrementViews === 'true' && !isOwner) {
            await Portfolio.findByIdAndUpdate(id, {
                $inc: { 'stats.views': 1 },
                $set: { 'stats.lastViewed': new Date() }
            });
            portfolio.stats.views += 1;
        }

        const responsePortfolio = selectPortfolioFields(portfolio);

        res.json({
            success: true,
            data: responsePortfolio
        });

    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch portfolio' 
        });
    }
};

// Get portfolio by URL slug
const getPortfolioByUrl = async (req, res) => {
    try {
        const { url } = req.params;
        const { incrementViews = 'false' } = req.query;
        
        if (!url) {
            return res.status(400).json({ 
                success: false, 
                message: 'Portfolio URL is required' 
            });
        }

        const portfolio = await Portfolio.findOne({ url })
            .populate('userId', 'name profileAvatarUrl email')
            .lean();

        if (!portfolio) {
            return res.status(404).json({ 
                success: false, 
                message: 'Portfolio not found' 
            });
        }

        // Check if user has permission to view this portfolio
        const requesterId = await extractUserFromAuth(req);
        const isOwner = requesterId === portfolio.userId.toString();
        const isPublicAccess = portfolio.isPublished && 
            ['public', 'unlisted'].includes(portfolio.visibility);

        if (!isOwner && !isPublicAccess) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied to this portfolio' 
            });
        }

        // Increment view count if requested and not the owner
        if (incrementViews === 'true' && !isOwner) {
            await Portfolio.findOneAndUpdate({ url }, {
                $inc: { 'stats.views': 1 },
                $set: { 'stats.lastViewed': new Date() }
            });
            portfolio.stats.views += 1;
        }

        const responsePortfolio = selectPortfolioFields(portfolio);

        res.json({
            success: true,
            data: responsePortfolio
        });

    } catch (error) {
        console.error('Error fetching portfolio by URL:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch portfolio' 
        });
    }
};

// Update a portfolio
const updatePortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid portfolio ID' 
            });
        }

        const portfolio = await Portfolio.findById(id);
        
        if (!portfolio) {
            return res.status(404).json({ 
                success: false, 
                message: 'Portfolio not found' 
            });
        }

        // Check ownership
        const requesterId = await extractUserFromAuth(req);
        const isOwner = requesterId === portfolio.userId.toString();
        if (!isOwner) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only update your own portfolios.' 
            });
        }

        // Handle URL slug update if title changed
        if (updateData.title && updateData.title !== portfolio.title) {
            updateData.url = await generateUniqueSlug(updateData.title, portfolio.userId);
        }

        // Process projects if provided
        if (updateData.projects) {
            updateData.projects = updateData.projects.map((project, index) => ({
                ...project,
                order: project.order !== undefined ? project.order : index,
                updatedAt: new Date(),
                createdAt: project.createdAt || new Date()
            }));
        }

        // Limit tags to 10
        if (updateData.tags && Array.isArray(updateData.tags)) {
            updateData.tags = updateData.tags.slice(0, 10);
        }

        Object.assign(portfolio, updateData);
        await portfolio.save();

        const responsePortfolio = selectPortfolioFields(portfolio.toObject());

        res.json({
            success: true,
            message: 'Portfolio updated successfully',
            data: responsePortfolio
        });

    } catch (error) {
        console.error('Error updating portfolio:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({ 
                success: false, 
                message: 'Portfolio URL already exists. Please try a different title.' 
            });
        }
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Failed to update portfolio' 
        });
    }
};

// Delete a portfolio
const deletePortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid portfolio ID' 
            });
        }

        const portfolio = await Portfolio.findById(id);
        
        if (!portfolio) {
            return res.status(404).json({ 
                success: false, 
                message: 'Portfolio not found' 
            });
        }

        // Check ownership
        const requesterId = await extractUserFromAuth(req);
        const isOwner = requesterId === portfolio.userId.toString();
        if (!isOwner) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only delete your own portfolios.' 
            });
        }

        await Portfolio.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Portfolio deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting portfolio:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete portfolio' 
        });
    }
};

// Toggle portfolio like
const togglePortfolioLike = async (req, res) => {
    try {
        const { id } = req.params;
        const { increment = true } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid portfolio ID' 
            });
        }

        const portfolio = await Portfolio.findById(id);
        
        if (!portfolio) {
            return res.status(404).json({ 
                success: false, 
                message: 'Portfolio not found' 
            });
        }

        // Check if portfolio is accessible
        const isOwner = req.user?.uid === portfolio.userId.toString();
        const isPublicAccess = portfolio.isPublished && 
            ['public', 'unlisted'].includes(portfolio.visibility);

        if (!isOwner && !isPublicAccess) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied to this portfolio' 
            });
        }

        await portfolio.toggleLike(increment);

        res.json({
            success: true,
            message: increment ? 'Portfolio liked' : 'Portfolio unliked',
            data: { likes: portfolio.stats.likes }
        });

    } catch (error) {
        console.error('Error toggling portfolio like:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to toggle portfolio like' 
        });
    }
};

// Get public portfolios (for discovery)
const getPublicPortfolios = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12, 
            tags, 
            sortBy = 'updatedAt',
            sortOrder = 'desc' 
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let query = { 
            isPublished: true, 
            visibility: 'public' 
        };

        // Filter by tags if provided
        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(',');
            query.tags = { $in: tagArray };
        }

        // Build sort options
        const sortOptions = {};
        if (sortBy === 'views') {
            sortOptions['stats.views'] = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'likes') {
            sortOptions['stats.likes'] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        const portfolios = await Portfolio.find(query)
            .populate('userId', 'name profileAvatarUrl')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const totalCount = await Portfolio.countDocuments(query);

        const responsePortfolios = portfolios.map(selectPortfolioFields);

        res.json({
            success: true,
            data: responsePortfolios,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalCount,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching public portfolios:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch public portfolios' 
        });
    }
};

module.exports = {
    createPortfolio,
    getUserPortfolios,
    getPortfolioById,
    getPortfolioByUrl,
    updatePortfolio,
    deletePortfolio,
    togglePortfolioLike,
    getPublicPortfolios
};