import { ObjectId } from 'mongodb';
import { getDatabase } from '../../config/database-optimized.mjs';

export const createMessage = async (request, env) => {
    try {
        const url = new URL(request.url);
        const matchId = url.pathname.split('/')[4];
        const { senderId, content } = await request.json();

        if (!matchId || !senderId || !content) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = getDatabase();
        const newMessage = {
            matchId: new ObjectId(matchId),
            senderId: new ObjectId(senderId),
            content,
            timestamp: new Date()
        };

        const result = await db.collection('chatmessages').insertOne(newMessage);
        
        return new Response(JSON.stringify({
            _id: result.insertedId,
            ...newMessage
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Create message error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const getMessages = async (request, env) => {
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
        const messages = await db.collection('chatmessages')
            .find({ matchId: new ObjectId(matchId) })
            .sort({ timestamp: 1 })
            .toArray();

        return new Response(JSON.stringify(messages), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export default {
    createMessage,
    getMessages
};