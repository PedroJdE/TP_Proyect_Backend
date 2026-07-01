import ServerError from '../helpers/serverError.helper.js';
import workspaceRepository from '../repositories/workspace.repository.js';
import workspaceMembersRepository from '../repositories/workspaceMembers.repository.js';

function workspaceMiddlewareFactory(valid_roles = []) {
    return async function (request, response, next){
        try {
            const user_id = request.user.id;
            const workspace_id = request.params.workspace_id;
            
            if (!workspace_id) {
                throw new ServerError('Workspace ID is required', 400);
            }

            const workspace = await workspaceRepository.getById(workspace_id);
            if (!workspace) {
                throw new ServerError('Workspace not found', 404);
            }

            const membership = await workspaceMembersRepository.findByUserIdAndWorkspaceId(user_id, workspace_id);
            if (!membership) {
                throw new ServerError('You are not a member of this workspace', 403);
            }

            const membershipRole = membership.rol || membership.role;
            if (valid_roles.length > 0 && !valid_roles.includes(membershipRole)) {
                throw new ServerError('You do not have permission to access this workspace', 403);
            }

            request.workspace = workspace;
            request.membership = membership;

            return next();

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

export default workspaceMiddlewareFactory;
