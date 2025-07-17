import { ObjectId } from 'mongodb';
import { getDatabase } from '../../config/database-optimized.mjs';

export const getUserMatches = async (request, env) => {
    try {
        const url = new URL(request.url);
        const userId = url.pathname.split('/')[4];

        if (!userId) {
            return new Response(JSON.stringify({ error: 'User ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = getDatabase();
        const matches = await db.collection('matches')
            .find({
                $or: [
                    { userId1: new ObjectId(userId) },
                    { userId2: new ObjectId(userId) }
                ]
            })
            .toArray();

        // Populate user data for each match
        const populatedMatches = await Promise.all(
            matches.map(async (match) => {
                const user1 = await db.collection('users').findOne(
                    { _id: new ObjectId(match.userId1) },
                    { projection: { password: 0 } }
                );
                const user2 = await db.collection('users').findOne(
                    { _id: new ObjectId(match.userId2) },
                    { projection: { password: 0 } }
                );
                
                return {
                    ...match,
                    user1,
                    user2
                };
            })
        );

        return new Response(JSON.stringify(populatedMatches), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Get user matches error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const archiveMatch = async (request, env) => {
    try {
        const url = new URL(request.url);
        const matchId = url.pathname.split('/')[4];

        if (!matchId) {
            return new Response(JSON.stringify({ error: 'Match ID required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = getDatabase();
        const result = await db.collection('matches').findOneAndUpdate(
            { _id: new ObjectId(matchId) },
            { $set: { isArchived: true } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return new Response(JSON.stringify({ error: 'Match not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Archive match error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export default {
    getUserMatches,
    archiveMatch
};