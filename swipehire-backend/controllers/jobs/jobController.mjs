import Job from '../../models/Job.mjs';

export const createJob = async (req, res) => {
    try {
        const { userId } = req.params;
        const jobData = req.body;
        
        if (req.file) {
            jobData.mediaUrl = req.file.path;
        }

        const newJob = await Job.create({
            ...jobData,
            userId
        });

        res.status(201).json(newJob);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserJobs = async (req, res) => {
    try {
        const { userId } = req.params;
        const jobs = await Job.find({ userId });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateJob = async (req, res) => {
    try {
        const { userId, jobId } = req.params;
        const updates = req.body;
        
        if (req.file) {
            updates.mediaUrl = req.file.path;
        }

        const updatedJob = await Job.findOneAndUpdate(
            { _id: jobId, userId },
            updates,
            { new: true }
        );

        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const { userId, jobId } = req.params;
        await Job.findOneAndDelete({ _id: jobId, userId });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPublicJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isPublic: true });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    createJob,
    getUserJobs,
    updateJob,
    deleteJob,
    getPublicJobs
};