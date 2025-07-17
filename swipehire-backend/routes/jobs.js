import express from 'express';
import { Job } from '../models/Job.js';
import { User } from '../models/User.mjs';

const router = express.Router();

// Job routes
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ isPublic: true })
      .populate('userId', 'name companyName companyLogoUrl companyIndustry')
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('userId', 'name companyName companyLogoUrl companyIndustry companyDescription')
      .select('-__v');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    
    const populatedJob = await Job.findById(job._id)
      .populate('userId', 'name companyName companyLogoUrl companyIndustry')
      .select('-__v');
    
    res.status(201).json(populatedJob);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('userId', 'name companyName companyLogoUrl companyIndustry')
    .select('-__v');
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;