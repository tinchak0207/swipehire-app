import { ObjectId } from 'mongodb';
import { getDatabase } from '../../index.mjs';

// Helper function to select specific fields from a review object
const selectReviewFields = (reviewObject) => {
    if (!reviewObject) return null;
    
    return {
        _id: reviewObject._id,
        companyUserId: reviewObject.companyUserId,
        reviewerId: reviewObject.reviewerId,
        rating: reviewObject.rating,
        comment: reviewObject.comment,
        createdAt: reviewObject.createdAt,
        updatedAt: reviewObject.updatedAt
    };
};

// SOTA: Optimized review creation with validation and indexing
export const createCompanyReview = async (req, res) => {
    try {
        const { companyUserId, reviewerId, rating, comment } = req.body;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        // Validation
        if (!companyUserId || !ObjectId.isValid(companyUserId)) {
            return res.status(400).json({ message: 'Invalid company user ID' });
        }

        if (!reviewerId || !ObjectId.isValid(reviewerId)) {
            return res.status(400).json({ message: 'Invalid reviewer ID' });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
            return res.status(400).json({ message: 'Comment is required' });
        }

        // SOTA: Check if company exists
        const companyExists = await db.collection('users').findOne({
            _id: new ObjectId(companyUserId),
            selectedRole: 'recruiter'
        });

        if (!companyExists) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // SOTA: Check for existing review from this reviewer for this company
        const existingReview = await db.collection('companyreviews').findOne({
            companyUserId: companyUserId,
            reviewerId: reviewerId
        });

        if (existingReview) {
            return res.status(409).json({ 
                message: 'You have already reviewed this company',
                review: selectReviewFields(existingReview)
            });
        }

        const newReview = {
            companyUserId: companyUserId,
            reviewerId: reviewerId,
            rating: rating,
            comment: comment.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('companyreviews').insertOne(newReview);
        const createdReview = { ...newReview, _id: result.insertedId };

        // SOTA: Update company rating statistics
        await updateCompanyRating(companyUserId, db);

        return res.status(201).json({
            message: 'Company review created successfully',
            review: selectReviewFields(createdReview)
        });
    } catch (error) {
        console.error('Review creation error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Optimized aggregation for company reviews
export const getCompanyReviews = async (req, res) => {
    try {
        const { companyUserId } = req.params;
        const { page = 1, limit = 10, sortBy = 'newest' } = req.query;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!companyUserId || !ObjectId.isValid(companyUserId)) {
            return res.status(400).json({ message: 'Invalid company user ID' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // SOTA: Optimized aggregation pipeline
        const pipeline = [
            { $match: { companyUserId: companyUserId } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'reviewerId',
                    foreignField: '_id',
                    as: 'reviewerInfo'
                }
            },
            { $unwind: '$reviewerInfo' },
            {
                $project: {
                    _id: 1,
                    companyUserId: 1,
                    reviewerId: 1,
                    rating: 1,
                    comment: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    reviewerName: '$reviewerInfo.name',
                    reviewerAvatar: '$reviewerInfo.profileAvatarUrl',
                    reviewerRole: '$reviewerInfo.selectedRole'
                }
            },
            {
                $sort: sortBy === 'oldest' 
                    ? { createdAt: 1 } 
                    : sortBy === 'highest' 
                        ? { rating: -1, createdAt: -1 }
                        : sortBy === 'lowest'
                            ? { rating: 1, createdAt: -1 }
                            : { createdAt: -1 }
            },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ];

        const [reviews, totalCount] = await Promise.all([
            db.collection('companyreviews').aggregate(pipeline).toArray(),
            db.collection('companyreviews').countDocuments({ companyUserId: companyUserId })
        ]);

        return res.status(200).json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching company reviews:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Advanced aggregation for review summary with real-time statistics
export const getCompanyReviewSummary = async (req, res) => {
    try {
        const { companyUserId } = req.params;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!companyUserId || !ObjectId.isValid(companyUserId)) {
            return res.status(400).json({ message: 'Invalid company user ID' });
        }

        // SOTA: Advanced aggregation pipeline for comprehensive statistics
        const pipeline = [
            { $match: { companyUserId: companyUserId } },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    totalRating: { $sum: '$rating' },
                    ratingDistribution: {
                        $push: {
                            rating: '$rating',
                            count: 1
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalReviews: 1,
                    averageRating: { $round: ['$averageRating', 2] },
                    totalRating: 1,
                    ratingDistribution: {
                        $arrayToObject: {
                            $map: {
                                input: [{ k: '1', v: 0 }, { k: '2', v: 0 }, { k: '3', v: 0 }, { k: '4', v: 0 }, { k: '5', v: 0 }],
                                as: 'default',
                                in: {
                                    k: '$$default.k',
                                    v: {
                                        $sum: {
                                            $map: {
                                                input: '$ratingDistribution',
                                                as: 'dist',
                                                in: {
                                                    $cond: [
                                                        { $eq: ['$$dist.rating', { $toInt: '$$default.k' }] },
                                                        1,
                                                        0
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ];

        const [summary] = await db.collection('companyreviews').aggregate(pipeline).toArray();

        if (!summary) {
            return res.status(200).json({
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
            });
        }

        // Convert rating distribution to array format for compatibility
        const ratingArray = [
            summary.ratingDistribution['1'] || 0,
            summary.ratingDistribution['2'] || 0,
            summary.ratingDistribution['3'] || 0,
            summary.ratingDistribution['4'] || 0,
            summary.ratingDistribution['5'] || 0
        ];

        return res.status(200).json({
            ...summary,
            ratingDistribution: ratingArray
        });
    } catch (error) {
        console.error('Error fetching review summary:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Helper function to update company rating statistics
const updateCompanyRating = async (companyUserId, db) => {
    try {
        const pipeline = [
            { $match: { companyUserId: companyUserId } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ];

        const [result] = await db.collection('companyreviews').aggregate(pipeline).toArray();
        
        if (result) {
            await db.collection('users').updateOne(
                { _id: new ObjectId(companyUserId) },
                {
                    $set: {
                        averageRating: Math.round(result.averageRating * 100) / 100,
                        totalReviews: result.totalReviews,
                        updatedAt: new Date()
                    }
                }
            );
        }
    } catch (error) {
        console.error('Error updating company rating:', error);
    }
};

// SOTA: Get reviews by rating filter
export const getReviewsByRating = async (req, res) => {
    try {
        const { companyUserId } = req.params;
        const { rating, page = 1, limit = 10 } = req.query;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!companyUserId || !ObjectId.isValid(companyUserId)) {
            return res.status(400).json({ message: 'Invalid company user ID' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let query = { companyUserId: companyUserId };
        if (rating) {
            query.rating = parseInt(rating);
        }

        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'users',
                    localField: 'reviewerId',
                    foreignField: '_id',
                    as: 'reviewerInfo'
                }
            },
            { $unwind: '$reviewerInfo' },
            {
                $project: {
                    _id: 1,
                    companyUserId: 1,
                    reviewerId: 1,
                    rating: 1,
                    comment: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    reviewerName: '$reviewerInfo.name',
                    reviewerAvatar: '$reviewerInfo.profileAvatarUrl',
                    reviewerRole: '$reviewerInfo.selectedRole'
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ];

        const [reviews, totalCount] = await Promise.all([
            db.collection('companyreviews').aggregate(pipeline).toArray(),
            db.collection('companyreviews').countDocuments(query)
        ]);

        return res.status(200).json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching reviews by rating:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Update review (for moderation or editing)
export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!reviewId || !ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }

        const updateData = { updatedAt: new Date() };
        if (rating !== undefined) updateData.rating = rating;
        if (comment !== undefined) updateData.comment = comment.trim();

        const result = await db.collection('companyreviews').findOneAndUpdate(
            { _id: new ObjectId(reviewId) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Update company rating statistics
        await updateCompanyRating(result.value.companyUserId, db);

        return res.status(200).json({
            message: 'Review updated successfully',
            review: selectReviewFields(result.value)
        });
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// SOTA: Delete review with cascade updates
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ message: 'Database service unavailable' });
        }

        if (!reviewId || !ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }

        const result = await db.collection('companyreviews').findOneAndDelete({
            _id: new ObjectId(reviewId)
        });

        if (!result.value) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Update company rating statistics
        await updateCompanyRating(result.value.companyUserId, db);

        return res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export default {
    createCompanyReview,
    getCompanyReviews,
    getCompanyReviewSummary,
    getReviewsByRating,
    updateReview,
    deleteReview
};