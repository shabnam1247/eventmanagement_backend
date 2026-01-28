const Message = require('../Models/Message');
const User = require('../Models/Users');
const Faculty = require('../Models/faculty');

exports.getMessages = async (req, res) => {
    try {
        const { userId, targetId } = req.params;

        // Fetch messages where (sender=userId AND receiver=targetId) OR (sender=targetId AND receiver=userId)
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: targetId },
                { sender: targetId, receiver: userId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRecentChats = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.query; // 'Users' or 'Faculty'

        // This is a bit more complex, we want to find unique users the current user has chatted with
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });

        const chatPartners = new Map();

        messages.forEach(msg => {
            const partnerId = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
            const partnerModel = msg.sender.toString() === userId ? msg.receiverModel : msg.senderModel;
            
            if (!chatPartners.has(partnerId)) {
                chatPartners.set(partnerId, {
                    lastMessage: msg.message,
                    timestamp: msg.createdAt,
                    partnerModel
                });
            }
        });

        const partnersList = Array.from(chatPartners.entries()).map(([id, data]) => ({
            id,
            ...data
        }));

        // Populate partner names (simplified for now, ideally we'd join)
        const populatedPartners = await Promise.all(partnersList.map(async (p) => {
            let details;
            if (p.partnerModel === 'Users') {
                details = await User.findById(p.id).select('name email');
            } else if (p.partnerModel === 'Faculty') {
                details = await Faculty.findById(p.id).select('name email');
            }
            return { ...p, name: details?.name, email: details?.email };
        }));

        res.status(200).json({
            success: true,
            chats: populatedPartners
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
