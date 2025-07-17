import CompanyReview from '../../models/CompanyReview.js';

export const createCompanyReview = async (req, res) => {
    try {
        const { companyUserId, reviewerId, rating, comment } = req.body;
        const newReview = await CompanyReview.create({
            companyUserId,
            reviewerId,
            rating,
            comment,
            createdAt: new Date()
        });
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCompanyReviews = async (req, res) => {
    try {
        const { companyUserId } = req.params;
        const reviews = await CompanyReview.find({ companyUserId })
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCompanyReviewSummary = async (req, res) => {
    try {
        const { companyUserId } = req.params;
        const reviews = await CompanyReview.find({ companyUserId });
        
        const summary = {
            averageRating: 0,
            totalReviews: reviews.length,
            ratingDistribution: [0, 0, 0, 0, 0]
        };

        if (reviews.length > 0) {
            const total = reviews.reduce((sum, review) => sum + review.rating, 0);
            summary.averageRating = total / reviews.length;
            
            reviews.forEach(review => {
                if (review.rating >= 1 && review.rating <= 5) {
                    summary.ratingDistribution[review.rating - 1]++;
                }
            });
        }

        res.status(200).json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
