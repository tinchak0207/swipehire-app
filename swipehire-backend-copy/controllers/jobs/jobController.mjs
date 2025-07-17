import { ObjectId } from 'mongodb';
import { getDatabase } from '../../config/database-optimized.mjs';

export const createJob = async (request, env) => {
    try {
        const url = new URL(request.url);
        const userId = url.pathname.split('/')[4];
        const jobData = await request.json();

        if (!userId) {
            return new Response(JSON.stringify({ error: 'User ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = getDatabase();
        const newJob = {
            ...jobData,
            userId: new ObjectId(userId),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('jobs').insertOne(newJob, { maxTimeMS: 10000 });
        const createdJob = { ...newJob, _id: result.insertedId };

        return new Response(JSON.stringify(createdJob), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Create job error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const getUserJobs = async (request, env) => {
    try {
        const url = new URL(request.url);
        const userId = url.pathname.split('/')[4];

        if (!userId) {
            return new Response(JSON.stringify({ error: 'User ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = await getDatabase();
        const jobs = await db.collection('jobs')
            .find({ userId: new ObjectId(userId) })
            .maxTimeMS(10000)
            .toArray();

        return new Response(JSON.stringify(jobs), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Get user jobs error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const updateJob = async (request, env) => {
    try {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const userId = pathParts[4];
        const jobId = pathParts[6];
        const updates = await request.json();

        if (!userId || !jobId) {
            return new Response(JSON.stringify({ error: 'User ID and Job ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = getDatabase();
        updates.updatedAt = new Date();

        const result = await db.collection('jobs').findOneAndUpdate(
            { _id: new ObjectId(jobId), userId: new ObjectId(userId) },
            { $set: updates },
            { returnDocument: 'after', maxTimeMS: 10000 }
        );

        if (!result) {
            return new Response(JSON.stringify({ error: 'Job not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Update job error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const deleteJob = async (request, env) => {
    try {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const userId = pathParts[4];
        const jobId = pathParts[6];

        if (!userId || !jobId) {
            return new Response(JSON.stringify({ error: 'User ID and Job ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = getDatabase();
        const result = await db.collection('jobs').deleteOne({
            _id: new ObjectId(jobId),
            userId: new ObjectId(userId)
        }, { maxTimeMS: 10000 });

        if (result.deletedCount === 0) {
            return new Response(JSON.stringify({ error: 'Job not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(null, {
            status: 204,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Delete job error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const getPublicJobs = async (request, env) => {
    try {
        const db = getDatabase();
        const jobs = await db.collection('jobs')
            .find({ isPublic: true })
            .toArray();

        return new Response(JSON.stringify(jobs), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Get public jobs error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export default {
    createJob,
    getUserJobs,
    updateJob,
    deleteJob,
    getPublicJobs
};