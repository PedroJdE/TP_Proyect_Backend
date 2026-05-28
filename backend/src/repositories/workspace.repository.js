import Workspace from "../models/workspace.model.js";

class WorkspaceRepository {
    async getAll() {
        return await Workspace.find({activo: true});
    }
    async getById(workspace_id) {
        return await Workspace.findById(workspace_id);
    }
    async create(nombre, descripcion) {
        return await Workspace.create({
            nombre: nombre,     
            descripcion: descripcion
        });
    }
    async updateById(workspace_id, updateData) {
        await Workspace.findByIdAndUpdate(workspace_id, updateData);
    }
    async deleteById(workspace_id) {
        return await Workspace.findByIdAndUpdate(
            workspace_id, 
            { activo: false }, 
            { new: true }
        );
    }
    async findByUserIdAndWorkspaceId(user_id, workspace_id) {
        return await Workspace.findOne({ _id: workspace_id, user_id: user_id, activo: true });
    }
}

const workspaceRepository = new WorkspaceRepository();
export default workspaceRepository;