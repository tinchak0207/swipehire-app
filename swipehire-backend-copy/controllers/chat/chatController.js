const ChatMessage = require('../../models/ChatMessage');

exports.createMessage = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { senderId, content } = req.body;

        const newMessage = await ChatMessage.create({
            matchId,
            senderId,
            content,
            timestamp: new Date()
        });

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { matchId } = req.params;
        const messages = await ChatMessage.find({ matchId })
            .sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
