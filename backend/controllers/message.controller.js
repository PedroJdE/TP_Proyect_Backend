
import ServerError from '../src/helpers/serverError.helper.js';
import messageRepository from '../src/repositories/message.repository.js';

class MessageController {

    async createMessage(req, res) {
        try {
            const { channel_id } = req.params;
            const { content, parentMessage } = req.body;
            const sender = req.user.id;
            const workspace = req.workspace._id;

            if (!content || !content.trim()) {
                throw new ServerError('El contenido del mensaje es obligatorio', 400);
            }

            let message = await messageRepository.create(
                content.trim(),
                sender,
                workspace,
                channel_id,
                parentMessage || null
            );

            message = await message.populate('sender', 'username');

            res.status(201).json({ ok: true, data: { message } });
        }
        catch (error) {
            handleError(res, error);
        }
    }

    async getMessages(req, res) {
        try {
            const { channel_id } = req.params;
            const messages = await messageRepository.findByChannel(channel_id);
            res.json({ ok: true, data: { messages } });
        }
        catch (error) {
            handleError(res, error);
        }
    }

    // Usado por el front para polling: trae solo los mensajes posteriores a "after"
    async getNewMessages(req, res) {
        try {
            const { channel_id } = req.params;
            const { after } = req.query;

            if (!after) {
                throw new ServerError('El parámetro "after" es obligatorio', 400);
            }

            const afterDate = new Date(after);
            if (isNaN(afterDate.getTime())) {
                throw new ServerError('El parámetro "after" no es una fecha válida', 400);
            }

            const messages = await messageRepository.findAfterDate(channel_id, afterDate);
            res.json({ ok: true, data: { messages } });
        }
        catch (error) {
            handleError(res, error);
        }
    }

    async updateMessage(req, res) {
        try {
            const { messageId } = req.params;
            const { content } = req.body;

            if (!content || !content.trim()) {
                throw new ServerError('El contenido del mensaje es obligatorio', 400);
            }

            const updatedMessage = await messageRepository.update(messageId, {
                content: content.trim(),
                edited: true
            });

            if (!updatedMessage) {
                throw new ServerError('Mensaje no encontrado', 404);
            }

            res.json({ ok: true, data: { message: updatedMessage } });
        }
        catch (error) {
            handleError(res, error);
        }
    }

    async deleteMessage(req, res) {
        try {
            const { messageId } = req.params;
            const deleted = await messageRepository.delete(messageId);

            if (!deleted) {
                throw new ServerError('Mensaje no encontrado', 404);
            }

            res.status(204).send();
        }
        catch (error) {
            handleError(res, error);
        }
    }

}

// Mismo formato de error que usan channel.middleware.js y workspace.middleware.js
function handleError(res, error) {
    if (error instanceof ServerError) {
        return res.status(error.status).json({
            message: error.message,
            ok: false,
            status: error.status
        });
    }
    console.error('Critical error:', error);
    return res.status(500).json({
        message: 'Internal Server Error',
        ok: false,
        status: 500
    });
}

const messageController = new MessageController();
export default messageController;