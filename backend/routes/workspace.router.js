import express from 'express';

import authMiddleware from '../src/middlewares/auth.middleware.js';
import workspaceController from '../controllers/workspace.controller.js';
import workspaceMiddleware from '../src/middlewares/workspace.middleware.js';
import { MEMBER_WORKSPACE_ROLES } from '../src/constants/memberRoles.constant.js';


const workspaceRouter = express.Router();

workspaceRouter.use(authMiddleware);

workspaceRouter.post('/', workspaceController.create);

workspaceRouter.get('/', workspaceController.getAllByUser);

// Invitar miembro a workspace
workspaceRouter.get(
    '/:workspace_id/members',
    workspaceMiddleware([]),
    workspaceController.getWorkspaceMembers
);

workspaceRouter.get(
    '/:workspace_id/channels/:channel_id/members',
    workspaceMiddleware([]),
    workspaceController.getChannelMembers
);

workspaceRouter.get(
    '/:workspace_id/channels',
    workspaceMiddleware([]),
    workspaceController.getWorkspaceChannels
);

workspaceRouter.post(
    '/:workspace_id/channels',
    workspaceMiddleware([]),
    workspaceController.createChannel
);

// NUEVO: editar un canal existente
workspaceRouter.put(
    '/:workspace_id/channels/:channel_id',
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.ADMIN, MEMBER_WORKSPACE_ROLES.OWNER]),
    workspaceController.updateChannel
);

workspaceRouter.post('/:workspace_id/invite', workspaceController.inviteMember);

workspaceRouter.delete(
    '/:workspace_id', 
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER]),
    workspaceController.deleteById
);

workspaceRouter.put(
    '/:workspace_id', 
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.ADMIN, MEMBER_WORKSPACE_ROLES.OWNER]),
    workspaceController.updateById
);

export default workspaceRouter;