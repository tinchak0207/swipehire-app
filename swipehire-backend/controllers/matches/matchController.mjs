import Match from '../../models/Match.js';

export const getUserMatches = async (req, res) => {
    try {
        const { userId } = req.params;
        const matches = await Match.find({ 
            $or: [
                { userId1: userId },
                { userId2: userId }
            ]
        }).populate('userId1 userId2');
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const archiveMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const updatedMatch = await Match.findByIdAndUpdate(
            matchId,
            { isArchived: true },
            { new: true }
        );
        res.status(200).json(updatedMatch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    getUserMatches,
    archiveMatch
};