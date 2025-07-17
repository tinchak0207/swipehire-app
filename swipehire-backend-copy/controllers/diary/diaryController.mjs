import { ObjectId } from 'mongodb';
import { getDatabase } from '../../config/database-optimized.mjs';

export const createPost = async (request, env) => {
    try {
        const { userId, content, imageUrl } = await request.json();

        if (!userId || !content) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = getDatabase();
        const newPost = {
            userId: new ObjectId(userId),
            content,
            imageUrl: imageUrl || null,
            likes: [],
            createdAt: new Date()
        };

        const result = await db.collection('diaryposts').insertOne(newPost);
        
        return new Response(JSON.stringify({
            _id: result.insertedId,
            ...newPost
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Create post error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const getPosts = async (request, env) => {
    try {
        const db = getDatabase();
        const posts = await db.collection('diaryposts')
            .find({})
            .sort({ createdAt: -1 })
            .limit(20)
            .toArray();

        return new Response(JSON.stringify(posts), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Get posts error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const likePost = async (request, env) => {
    try {
        const url = new URL(request.url);
        const postId = url.pathname.split('/')[4];
        const { userId } = await request.json();

        if (!postId || !userId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = getDatabase();
        const result = await db.collection('diaryposts').findOneAndUpdate(
            { _id: new ObjectId(postId) },
            { $addToSet: { likes: new ObjectId(userId) } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return new Response(JSON.stringify({ error: 'Post not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Like post error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export default {
    createPost,
    getPosts,
    likePost
};