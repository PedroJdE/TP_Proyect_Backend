import serverError from '../helpers/serverError.helper.js';
import Workspace from '../models/workspace.model.js';
import WorkspaceMember from '../models/workspaceMembers.model.js';
import workspaceRepository from '../repositories/workspace.repository.js';
import workspaceMembersRepository from '../repositories/workspaceMembers.repository.js';


function workspaceMiddlewareFactory(valid_roles = []) {
    return async function (request, response, next){
        try {
            const user_id = request.user.id;
            const workspace_id = request.params.workspace_id;
            
            if (!workspace_id) {
                throw new serverError(400, 'Workspace ID is required');
            }

            const workspace = await workspaceRepository.findById(workspace_id);
            if (!workspace) {
                throw new serverError(404, 'Workspace not found');
            }

            const membership = await workspaceMembersRepository.findByUserIdAndWorkspaceId(user_id, workspace_id);
            if (!membership) {
                throw new serverError(403, 'You are not a member of this workspace');
            }

            if (valid_roles.length > 0 && !valid_roles.includes(membership.role)) {
                throw new serverError(403, 'You do not have permission to access this workspace');
            }

            request.workspace = workspace;
            request.membership = membership;

            return next();

        } catch (error) {
            if (error instanceof serverError) {
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
