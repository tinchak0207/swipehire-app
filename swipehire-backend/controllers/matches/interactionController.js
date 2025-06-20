const Match = require('../../models/Match');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

const interactionController = {
  /**
   * Like a user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async likeProfile(req, res) {
    try {
      const { likerId, likedId } = req.body;

      // Check if match already exists
      const existingMatch = await Match.findOne({
        $or: [
          { user1: likerId, user2: likedId },
          { user1: likedId, user2: likerId }
        ]
      });

      if (existingMatch) {
        return res.status(400).json({ message: 'Match already exists' });
      }

      // Create new match
      const newMatch = new Match({
        user1: likerId,
        user2: likedId,
        status: 'matched'
      });

      await newMatch.save();

      // Create notification for the liked user
      const liker = await User.findById(likerId);
      const notification = new Notification({
        recipient: likedId,
        sender: likerId,
        type: 'match',
        message: `${liker.name} liked your profile!`,
        read: false
      });
      await notification.save();

      res.status(201).json(newMatch);
    } catch (error) {
      console.error('Error liking profile:', error);
      res.status(500).json({ message: 'Error liking profile' });
    }
  },

  /**
   * Pass on a candidate
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async passCandidate(req, res) {
    try {
      const { userId, candidateId } = req.params;

      // Add candidate to user's passed list
      await User.findByIdAndUpdate(userId, {
        $addToSet: { passedCandidates: candidateId }
      });

      res.status(200).json({ message: 'Candidate passed successfully' });
    } catch (error) {
      console.error('Error passing candidate:', error);
      res.status(500).json({ message: 'Error passing candidate' });
    }
  },

  /**
   * Pass on a company
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async passCompany(req, res) {
    try {
      const { userId, companyId } = req.params;

      // Add company to user's passed list
      await User.findByIdAndUpdate(userId, {
        $addToSet: { passedCompanies: companyId }
      });

      res.status(200).json({ message: 'Company passed successfully' });
    } catch (error) {
      console.error('Error passing company:', error);
      res.status(500).json({ message: 'Error passing company' });
    }
  },

  /**
   * Retrieve a previously passed candidate
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async retrieveCandidate(req, res) {
    try {
      const { userId, candidateId } = req.params;

      // Remove candidate from user's passed list
      await User.findByIdAndUpdate(userId, {
        $pull: { passedCandidates: candidateId }
      });

      res.status(200).json({ message: 'Candidate retrieved successfully' });
    } catch (error) {
      console.error('Error retrieving candidate:', error);
      res.status(500).json({ message: 'Error retrieving candidate' });
    }
  },

  /**
   * Retrieve a previously passed company
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async retrieveCompany(req, res) {
    try {
      const { userId, companyId } = req.params;

      // Remove company from user's passed list
      await User.findByIdAndUpdate(userId, {
        $pull: { passedCompanies: companyId }
      });

      res.status(200).json({ message: 'Company retrieved successfully' });
    } catch (error) {
      console.error('Error retrieving company:', error);
      res.status(500).json({ message: 'Error retrieving company' });
    }
  }
};

module.exports = interactionController;
