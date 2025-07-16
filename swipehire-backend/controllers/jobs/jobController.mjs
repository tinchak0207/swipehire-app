import { ObjectId } from 'mongodb';
import { getDatabase } from '../../index.mjs';

export const createJob = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ error: 'Database service unavailable' });
        }
        
        const { userId } = req.params;
        const jobData = req.body;
        
        if (req.file) {
            jobData.mediaUrl = req.file.path;
        }

        const newJob = {
            ...jobData,
            userId: new ObjectId(userId),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database insert timeout')), 5000);
        });
        
        const insertPromise = db.collection('jobs').insertOne(newJob);
        const result = await Promise.race([insertPromise, timeoutPromise]);
        const createdJob = { ...newJob, _id: result.insertedId };

        res.status(201).json(createdJob);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserJobs = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ error: 'Database service unavailable' });
        }
        
        const { userId } = req.params;
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database query timeout')), 5000);
        });
        
        const queryPromise = db.collection('jobs').find(
            { userId: new ObjectId(userId) },
            { maxTimeMS: 4000 }
        ).toArray();
        
        const jobs = await Promise.race([queryPromise, timeoutPromise]);
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateJob = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            throw new Error('Database not connected');
        }
        
        const { userId, jobId } = req.params;
        const updates = req.body;
        
        if (req.file) {
            updates.mediaUrl = req.file.path;
        }

        updates.updatedAt = new Date();

        const result = await db.collection('jobs').findOneAndUpdate(
            { _id: new ObjectId(jobId), userId: new ObjectId(userId) },
            { $set: updates },
            { returnDocument: 'after' }
        );

        res.status(200).json(result.value);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const db = getDatabase();
        if (!db) {
            throw new Error('Database not connected');
        }
        
        const { userId, jobId } = req.params;
        await db.collection('jobs').deleteOne({ _id: new ObjectId(jobId), userId: new ObjectId(userId) });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPublicJobs = async (req, res) => {
    try {
        console.log('getPublicJobs called');
        
        const db = getDatabase();
        if (!db) {
            return res.status(503).json({ error: 'Database service unavailable' });
        }
        
        console.log('Database available, fetching jobs');
        
        // Use shorter timeout for Workers (5 seconds)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database query timeout')), 5000);
        });
        
        const queryPromise = db.collection('jobs').find(
            { isPublic: true },
            {
                maxTimeMS: 4000, // MongoDB server-side timeout
                readPreference: 'primary'
            }
        ).toArray();
        
        const jobs = await Promise.race([queryPromise, timeoutPromise]);
        
        console.log('Found jobs:', jobs.length);
        res.status(200).json(jobs);
    } catch (error) {
        console.error('getPublicJobs error:', error);
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