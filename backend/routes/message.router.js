import express from 'express';

import authMiddleware from '../src/middlewares/auth.middleware.js';
import channelMiddlewareFactory from '../src/middlewares/channel.middleware.js';
import messageController from '../controllers/message.controller.js';

const messageRouter = express.Router();

messageRouter.use(authMiddleware);

messageRouter.get(
    '/:channel_id/messages',
    channelMiddlewareFactory([]),
    messageController.getMessages
);

// Polling: trae mensajes nuevos desde ?after=<ISO date>
messageRouter.get(
    '/:channel_id/messages/new',
    channelMiddlewareFactory([]),
    messageController.getNewMessages
);

messageRouter.post(
    '/:channel_id/messages',
    channelMiddlewareFactory([]),
    messageController.createMessage
);

messageRouter.put(
    '/:channel_id/messages/:messageId',
    channelMiddlewareFactory([]),
    messageController.updateMessage
);

messageRouter.delete(
    '/:channel_id/messages/:messageId',
    channelMiddlewareFactory([]),
    messageController.deleteMessage
);

export default messageRouter;