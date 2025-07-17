const mongoose = require('mongoose');
const User = require('../../models/User');
const Job = require('../../models/Job');
const Match = require('../../models/Match');
const CacheService = require('../../services/cacheService');

const userController = {
  /**
   * Get jobseeker profiles with optimized pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getJobseekerProfiles(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        skills,
        location,
        experienceLevel,
        jobType,
        salaryMin,
        salaryMax,
        search
      } = req.query;

      // Generate cache key
      const queryHash = Buffer.from(JSON.stringify({
        page, limit, skills, location, experienceLevel, jobType, salaryMin, salaryMax, search
      })).toString('base64');
      const cacheKey = `jobseekers:${queryHash}`;

      // Check cache
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 100); // Max 100 per page
      const skip = (pageNum - 1) * limitNum;

      // Build optimized query
      const query = {
        selectedRole: 'jobseeker',
        profileVisibility: { $ne: 'hidden' }
      };

      // Add filters efficiently
      if (skills) {
        const skillArray = Array.isArray(skills) ? skills : skills.split(',');
        query.profileSkills = { $in: skillArray.map(s => s.trim()) };
      }

      if (location) {
        query.country = { $regex: location, $options: 'i' };
      }

      if (experienceLevel) {
        query.profileWorkExperienceLevel = experienceLevel;
      }

      if (jobType) {
        query.profileJobTypePreference = jobType;
      }

      if (salaryMin || salaryMax) {
        query.$and = query.$and || [];
        if (salaryMin) {
          query.$and.push({ profileSalaryExpectationMin: { $gte: parseInt(salaryMin) } });
        }
        if (salaryMax) {
          query.$and.push({ profileSalaryExpectationMax: { $lte: parseInt(salaryMax) } });
        }
      }

      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
          { name: searchRegex },
          { profileHeadline: searchRegex },
          { profileSkills: searchRegex }
        ];
      }

      // Use projection to limit returned fields
      const projection = {
        _id: 1,
        name: 1,
        email: 1,
        profileAvatarUrl: 1,
        profileHeadline: 1,
        profileExperienceSummary: 1,
        profileSkills: 1,
        country: 1,
        profileWorkExperienceLevel: 1,
        profileJobTypePreference: 1,
        profileSalaryExpectationMin: 1,
        profileSalaryExpectationMax: 1,
        createdAt: 1,
        updatedAt: 1
      };

      // Execute optimized query with pagination
      const [profiles, total] = await Promise.all([
        User.find(query)
          .select(projection)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        User.countDocuments(query)
      ]);

      const result = {
        profiles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      };

      // Cache for 2 minutes
      await CacheService.set(cacheKey, result, 120);

      res.json(result);
    } catch (error) {
      console.error('Error getting jobseeker profiles:', error);
      res.status(500).json({ error: 'Failed to fetch jobseeker profiles' });
    }
  },

  /**
   * Get recruiter profiles with optimized filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRecruiterProfiles(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        industry,
        companyScale,
        location,
        search
      } = req.query;

      const queryHash = Buffer.from(JSON.stringify({
        page, limit, industry, companyScale, location, search
      })).toString('base64');
      const cacheKey = `recruiters:${queryHash}`;

      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 100);
      const skip = (pageNum - 1) * limitNum;

      const query = {
        selectedRole: 'recruiter',
        profileVisibility: { $ne: 'hidden' }
      };

      if (industry) {
        query.companyIndustry = industry;
      }

      if (companyScale) {
        query.companyScale = companyScale;
      }

      if (location) {
        query.country = { $regex: location, $options: 'i' };
      }

      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        query.$or = [
          { companyName: searchRegex },
          { companyDescription: searchRegex }
        ];
      }

      const projection = {
        _id: 1,
        name: 1,
        email: 1,
        companyName: 1,
        companyIndustry: 1,
        companyScale: 1,
        companyAddress: 1,
        companyWebsite: 1,
        companyDescription: 1,
        companyLogoUrl: 1,
        createdAt: 1,
        updatedAt: 1
      };

      const [profiles, total] = await Promise.all([
        User.find(query)
          .select(projection)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        User.countDocuments(query)
      ]);

      const result = {
        profiles,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      };

      await CacheService.set(cacheKey, result, 120);

      res.json(result);
    } catch (error) {
      console.error('Error getting recruiter profiles:', error);
      res.status(500).json({ error: 'Failed to fetch recruiter profiles' });
    }
  },

  /**
   * Get user by ID with optimized data loading
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const cacheKey = `user:${userId}`;
      const cached = await CacheService.getUser(userId);
      if (cached) {
        return res.json(cached);
      }

      const user = await User.findById(userId)
        .select('-password -firebaseUid -__v')
        .lean();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Cache for 5 minutes
      await CacheService.setUser(userId, user, 300);

      res.json(user);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  /**
   * Update user profile with cache invalidation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password -firebaseUid -__v');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Invalidate cache
      await CacheService.invalidateUser(userId);

      res.json(user);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  },

  /**
   * Get user dashboard data with optimized queries
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserDashboard(req, res) {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const cacheKey = `dashboard:${userId}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Execute all dashboard queries in parallel
      const [user, matchCount, jobCount, recentJobs] = await Promise.all([
        User.findById(userId).select('name selectedRole').lean(),
        Match.countDocuments({
          $or: [{ userA_Id: userId }, { userB_Id: userId }],
          status: 'active'
        }),
        req.user.selectedRole === 'recruiter' 
          ? Job.countDocuments({ userId })
          : Job.countDocuments({ isPublic: true }),
        req.user.selectedRole === 'recruiter'
          ? Job.find({ userId })
              .select('title createdAt')
              .sort({ createdAt: -1 })
              .limit(5)
              .lean()
          : Job.find({ isPublic: true })
              .select('title companyName createdAt')
              .sort({ createdAt: -1 })
              .limit(5)
              .lean()
      ]);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const dashboardData = {
        user: {
          name: user.name,
          role: user.selectedRole
        },
        stats: {
          activeMatches: matchCount,
          totalJobs: jobCount
        },
        recentJobs
      };

      // Cache for 5 minutes
      await CacheService.set(cacheKey, dashboardData, 300);

      res.json(dashboardData);
    } catch (error) {
      console.error('Error getting user dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  }
};

module.exports = userController;