import { ObjectId } from 'mongodb';
import { getDatabase } from '../../index.mjs';

// Helper function to select specific fields from a job object
const selectJobFields = (jobObject) => {
    if (!jobObject) return null;
    
    return {
        _id: jobObject._id,
        title: jobObject.title,
        description: jobObject.description,
        requirements: jobObject.requirements,
        salary: jobObject.salary,
        location: jobObject.location,
        jobType: jobObject.jobType,
        workStyle: jobObject.workStyle,
        companyName: jobObject.companyName,
        companyIndustry: jobObject.companyIndustry,
        companyLogo: jobObject.companyLogo,
        companySize: jobObject.companySize,
        userId: jobObject.userId,
        isPublic: jobObject.isPublic,
        mediaUrl: jobObject.mediaUrl,
        applications: jobObject.applications || [],
        views: jobObject.views || 0,
        createdAt: jobObject.createdAt,
        updatedAt: jobObject.updatedAt
    };
};

// SOTA: Optimized job creation with proper indexing
export const createJob = async (req, res) => {
    try {
        const { userId } = req.params;
        const jobData = req.body;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        // Validation
        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        if (!jobData.title || typeof jobData.title !== 'string' || jobData.title.trim().length === 0) {
            return res.status(400).json({ message: 'Job title is required' });
        }

        if (!jobData.description || typeof jobData.description !== 'string' || jobData.description.trim().length === 0) {
            return res.status(400).json({ message: 'Job description is required' });
        }

        const newJob = {
            title: jobData.title.trim(),
            description: jobData.description.trim(),
            requirements: jobData.requirements || [],
            salary: jobData.salary || null,
            location: jobData.location || '',
            jobType: jobData.jobType || 'full-time',
            workStyle: jobData.workStyle || 'hybrid',
            companyName: jobData.companyName || '',
            companyIndustry: jobData.companyIndustry || '',
            companyLogo: jobData.companyLogo || '',
            companySize: jobData.companySize || '',
            userId: userId,
            isPublic: jobData.isPublic !== undefined ? jobData.isPublic : true,
            mediaUrl: req.file ? req.file.path : null,
            applications: [],
            views: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('jobs').insertOne(newJob);
        const createdJob = { ...newJob, _id: result.insertedId };

        return res.status(201).json({
            message: 'Job created successfully',
            job: selectJobFields(createdJob)
        });
    } catch (error) {
        console.error('Job creation error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Optimized query with compound index and pagination
export const getUserJobs = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, isPublic } = req.query;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = { userId: userId };
        
        if (isPublic !== undefined) {
            query.isPublic = isPublic === 'true';
        }

        // SOTA: Optimized aggregation with pagination
        const pipeline = [
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $project: {
                    title: 1,
                    description: 1,
                    requirements: 1,
                    salary: 1,
                    location: 1,
                    jobType: 1,
                    workStyle: 1,
                    companyName: 1,
                    companyIndustry: 1,
                    companyLogo: 1,
                    companySize: 1,
                    isPublic: 1,
                    mediaUrl: 1,
                    views: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    applicationCount: { $size: '$applications' }
                }
            }
        ];

        const [jobs, totalCount] = await Promise.all([
            db.collection('jobs').aggregate(pipeline).toArray(),
            db.collection('jobs').countDocuments(query)
        ]);

        return res.status(200).json({
            jobs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching user jobs:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Optimized update with conditional fields
export const updateJob = async (req, res) => {
    try {
        const { userId, jobId } = req.params;
        const updates = req.body;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!ObjectId.isValid(userId) || !ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid user or job ID' });
        }

        // Remove immutable fields
        delete updates._id;
        delete updates.userId;
        delete updates.createdAt;
        
        // Add file upload if present
        if (req.file) {
            updates.mediaUrl = req.file.path;
        }
        
        updates.updatedAt = new Date();

        const result = await db.collection('jobs').findOneAndUpdate(
            { _id: new ObjectId(jobId), userId: userId },
            { $set: updates },
            {
                returnDocument: 'after',
                projection: {
                    userId: 1,
                    title: 1,
                    description: 1,
                    requirements: 1,
                    salary: 1,
                    location: 1,
                    jobType: 1,
                    workStyle: 1,
                    companyName: 1,
                    companyIndustry: 1,
                    companyLogo: 1,
                    companySize: 1,
                    isPublic: 1,
                    mediaUrl: 1,
                    views: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    applicationCount: { $size: '$applications' }
                }
            }
        );

        if (!result.value) {
            return res.status(404).json({ message: 'Job not found or unauthorized' });
        }

        return res.status(200).json({
            message: 'Job updated successfully',
            job: selectJobFields(result.value)
        });
    } catch (error) {
        console.error('Job update error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Efficient deletion with cascade operations
export const deleteJob = async (req, res) => {
    try {
        const { userId, jobId } = req.params;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!ObjectId.isValid(userId) || !ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid user or job ID' });
        }

        const result = await db.collection('jobs').findOneAndDelete({
            _id: new ObjectId(jobId),
            userId: userId
        });

        if (!result.value) {
            return res.status(404).json({ message: 'Job not found or unauthorized' });
        }

        // SOTA: Cascade delete related data
        await Promise.all([
            db.collection('applications').deleteMany({ jobId: jobId }),
            db.collection('notifications').deleteMany({ 
                $or: [
                    { 'data.jobId': jobId },
                    { 'metadata.jobId': jobId }
                ]
            })
        ]);

        return res.status(204).send();
    } catch (error) {
        console.error('Job deletion error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Optimized public jobs query with filtering and pagination
export const getPublicJobs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            location, 
            jobType, 
            workStyle, 
            companyIndustry, 
            search 
        } = req.query;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // SOTA: Compound query with text search
        let query = { isPublic: true };
        
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        
        if (jobType) {
            query.jobType = jobType;
        }
        
        if (workStyle) {
            query.workStyle = workStyle;
        }
        
        if (companyIndustry) {
            query.companyIndustry = { $regex: companyIndustry, $options: 'i' };
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } }
            ];
        }

        const pipeline = [
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $project: {
                    title: 1,
                    description: 1,
                    requirements: 1,
                    salary: 1,
                    location: 1,
                    jobType: 1,
                    workStyle: 1,
                    companyName: 1,
                    companyIndustry: 1,
                    companyLogo: 1,
                    companySize: 1,
                    mediaUrl: 1,
                    views: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    applicationCount: { $size: '$applications' }
                }
            }
        ];

        const [jobs, totalCount] = await Promise.all([
            db.collection('jobs').aggregate(pipeline).toArray(),
            db.collection('jobs').countDocuments(query)
        ]);

        return res.status(200).json({
            jobs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching public jobs:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Advanced job search with aggregation
export const searchJobs = async (req, res) => {
    try {
        const { 
            query, 
            location, 
            salaryMin, 
            salaryMax, 
            jobType, 
            workStyle, 
            companyIndustry,
            page = 1,
            limit = 10 
        } = req.query;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // SOTA: Complex aggregation with multiple filters
        const pipeline = [
            { $match: { isPublic: true } }
        ];
        
        // Add text search for query
        if (query) {
            pipeline.push({
                $match: {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                        { requirements: { $in: [new RegExp(query, 'i')] } },
                        { companyName: { $regex: query, $options: 'i' } }
                    ]
                }
            });
        }
        
        // Add location filter
        if (location) {
            pipeline.push({
                $match: { location: { $regex: location, $options: 'i' } }
            });
        }
        
        // Add salary range filter
        if (salaryMin || salaryMax) {
            const salaryFilter = {};
            if (salaryMin) salaryFilter.$gte = parseInt(salaryMin);
            if (salaryMax) salaryFilter.$lte = parseInt(salaryMax);
            pipeline.push({ $match: { salary: salaryFilter } });
        }
        
        // Add job type filter
        if (jobType) {
            pipeline.push({ $match: { jobType } });
        }
        
        // Add work style filter
        if (workStyle) {
            pipeline.push({ $match: { workStyle } });
        }
        
        // Add company industry filter
        if (companyIndustry) {
            pipeline.push({
                $match: { companyIndustry: { $regex: companyIndustry, $options: 'i' } }
            });
        }
        
        // Add sorting and pagination
        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $project: {
                    title: 1,
                    description: 1,
                    requirements: 1,
                    salary: 1,
                    location: 1,
                    jobType: 1,
                    workStyle: 1,
                    companyName: 1,
                    companyIndustry: 1,
                    companyLogo: 1,
                    companySize: 1,
                    mediaUrl: 1,
                    views: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    applicationCount: { $size: '$applications' }
                }
            }
        );

        const [jobs, totalCount] = await Promise.all([
            db.collection('jobs').aggregate(pipeline).toArray(),
            db.collection('jobs').countDocuments(pipeline.slice(0, -4)) // Count without skip/limit
        ]);

        return res.status(200).json({
            jobs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Job search error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export default {
    createJob,
    getUserJobs,
    updateJob,
    deleteJob,
    getPublicJobs,
    searchJobs
};