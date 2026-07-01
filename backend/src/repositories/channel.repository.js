import channelModel from "../models/channel.model.js";

class ChannelRepository {

    async create(workspace_id, nombre, descripcion) {
        return await channelModel.create({
            fk_workspace_id: workspace_id,
            nombre: nombre,
            descripcion: descripcion
        });
    }

    async getAll() {
        return await channelModel.find({ activo: true });
    }

    async getById(channel_id) {
        return await channelModel.findById(channel_id);
    }

    async deleteById(channel_id) {
        return await channelModel.findByIdAndUpdate(
            channel_id,
            { activo: false },
            { new: true }
        );
    }

    async updateById(channel_id, updateData) {
        await channelModel.findByIdAndUpdate(channel_id, updateData);
    }

    async findByWorkspaceId(workspace_id) {
        return await channelModel.find({ fk_workspace_id: workspace_id, activo: true });
    }

}

const channelRepository = new ChannelRepository();
export default channelRepository;