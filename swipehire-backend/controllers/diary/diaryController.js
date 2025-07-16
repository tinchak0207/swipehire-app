import DiaryPost from '../../models/DiaryPost.js';

export const uploadImage = async (req, res) => {
    try {
        const imageUrl = req.file.path;
        res.status(200).json({ imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createPost = async (req, res) => {
    try {
        const { userId, content, imageUrl } = req.body;
        const newPost = await DiaryPost.create({
            userId,
            content,
            imageUrl,
            likes: [],
            createdAt: new Date()
        });
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPosts = async (req, res) => {
    try {
        const posts = await DiaryPost.find()
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;
        
        const updatedPost = await DiaryPost.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: userId } },
            { new: true }
        );
        
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
