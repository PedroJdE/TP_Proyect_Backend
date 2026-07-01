import Message from '../models/message.model.js';

class MessageRepository {
    
    async create(
        content,
        sender,
        workspace,
        channel,
        parentMessage = null
    ) {
        const message = new Message({
            content,
            sender,
            workspace,
            channel,
            parentMessage
        });
        return await message.save();
    }

    async findByChannel(channelId) {
        return await Message.find({ channel: channelId }).sort({ createdAt: 1 }).populate('sender', 'name email');
    }

    async findAfterDate(channelId, date) {
        return await Message.find({
            channel: channelId,
            createdAt: { $gt: date }
        }).sort({ createdAt: 1 }).populate('sender', 'name email');
    }

    async update(messageId, updateData) {
        return await Message.findByIdAndUpdate(messageId, updateData, { new: true });
    }

    async delete(messageId) {
        return await Message.findByIdAndDelete(messageId);
    }

}

const messageRepository = new MessageRepository();
export default messageRepository;