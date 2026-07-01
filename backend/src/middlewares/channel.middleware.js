
import ServerError from '../helpers/serverError.helper.js';
import channelRepository from '../repositories/channel.repository.js';
import channelMembersRepository from '../repositories/channelMembers.repository.js';
import workspaceRepository from '../repositories/workspace.repository.js';
import workspaceMembersRepository from '../repositories/workspaceMembers.repository.js';

function channelMiddlewareFactory(valid_roles = []) {
    return async function (request, response, next){
        try {
            const user_id = request.user.id;
            const channel_id = request.params.channel_id;

            if (!channel_id) {
                throw new ServerError('Channel ID is required', 400);
            }

            const channel = await channelRepository.getById(channel_id);
            if (!channel) {
                throw new ServerError('Channel not found', 404);
            }

            const workspace_id = channel.fk_workspace_id;
            const workspace = await workspaceRepository.getById(workspace_id);
            if (!workspace) {
                throw new ServerError('Workspace not found', 404);
            }

            const workspaceMembership = await workspaceMembersRepository.findByUserIdAndWorkspaceId(user_id, workspace_id);
            if (!workspaceMembership) {
                throw new ServerError('You are not a member of this workspace', 403);
            }

            const channelMembership = await channelMembersRepository.findByChannelIdAndUserId(channel_id, user_id);
            if (!channelMembership) {
                throw new ServerError('You are not a member of this channel', 403);
            }

            const membershipRole = channelMembership.role || channelMembership.rol;
            if (valid_roles.length > 0 && !valid_roles.includes(membershipRole)) {
                throw new ServerError('You do not have permission to access this channel', 403);
            }

            request.channel = channel;
            request.channelMembership = channelMembership;
            request.workspace = workspace;
            request.membership = workspaceMembership;

            next();
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({ 
                    message: error.message,
                    ok: false,
                    status: error.status
                });
            }
            else {
                console.error('Critical error:', error);
                return response.status(500).json({ 
                    message: 'Internal Server Error',
                    ok: false,
                    status: 500
                });
            }
        }
    }   
}

export default channelMiddlewareFactory;