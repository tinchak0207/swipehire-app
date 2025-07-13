const Match = require('../../models/Match');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const Like = require('../../models/Like');

const interactionController = {
  /**
   * Like a user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async likeProfile(req, res) {
    try {
      const {
        likingUserId,
        likedProfileId,
        likedProfileType,
        likingUserRole,
        likingUserRepresentsCandidateId,
        likingUserRepresentsCompanyId,
        jobOpeningTitle
      } = req.body;

      // Validate required fields
      if (!likingUserId || !likedProfileId || !likedProfileType || !likingUserRole) {
        return res.status(400).json({ 
          success: false,
          message: 'Missing required fields: likingUserId, likedProfileId, likedProfileType, likingUserRole' 
        });
      }

      // Check if like already exists
      const existingLike = await Like.findOne({
        likingUserId,
        likedProfileId
      });

      if (existingLike) {
        return res.status(200).json({
          success: true,
          message: 'Like already recorded',
          matchMade: false
        });
      }

      // Create new like
      const likeData = {
        likingUserId,
        likedProfileId,
        likedProfileType,
        likingUserRole
      };

      // Only add optional fields if they're valid (not placeholder values)
      if (likingUserRepresentsCandidateId && !likingUserRepresentsCandidateId.includes('placeholder')) {
        likeData.likingUserRepresentsCandidateId = likingUserRepresentsCandidateId;
      }
      
      if (likingUserRepresentsCompanyId && !likingUserRepresentsCompanyId.includes('placeholder')) {
        likeData.likingUserRepresentsCompanyId = likingUserRepresentsCompanyId;
      }
      
      if (jobOpeningTitle) {
        likeData.jobOpeningTitle = jobOpeningTitle;
      }

      const newLike = new Like(likeData);

      await newLike.save();

      // Check if there's a mutual like (reverse like exists)
      const mutualLike = await Like.findOne({
        likingUserId: likedProfileId,
        likedProfileId: likingUserId
      });

      let matchMade = false;
      let matchDetails = null;

      if (mutualLike) {
        // Check if match already exists
        const existingMatch = await Match.findOne({
          $or: [
            { user1: likingUserId, user2: likedProfileId },
            { user1: likedProfileId, user2: likingUserId }
          ]
        });

        if (!existingMatch) {
          // Create new match
          const newMatch = new Match({
            user1: likingUserId,
            user2: likedProfileId,
            status: 'matched'
          });

          matchDetails = await newMatch.save();
          matchMade = true;

          // Create notifications for both users
          const liker = await User.findById(likingUserId);
          const liked = await User.findById(likedProfileId);

          if (liker && liked) {
            // Notification for the person who was just liked
            const notification1 = new Notification({
              recipient: likedProfileId,
              sender: likingUserId,
              type: 'match',
              message: `You have a new match with ${liker.name || liker.email}!`,
              read: false
            });

            // Notification for the person who just liked
            const notification2 = new Notification({
              recipient: likingUserId,
              sender: likedProfileId,
              type: 'match',
              message: `You have a new match with ${liked.name || liked.email}!`,
              read: false
            });

            await Promise.all([notification1.save(), notification2.save()]);
          }
        } else {
          matchDetails = existingMatch;
          matchMade = false; // Match already existed
        }
      }

      res.status(201).json({
        success: true,
        message: matchMade ? 'Like recorded and match created!' : 'Like recorded successfully',
        matchMade,
        matchDetails
      });
    } catch (error) {
      console.error('Error liking profile:', error);
      
      // Handle duplicate key error (like already exists)
      if (error.code === 11000) {
        return res.status(200).json({
          success: true,
          message: 'Like already recorded',
          matchMade: false
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Error liking profile' 
      });
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
