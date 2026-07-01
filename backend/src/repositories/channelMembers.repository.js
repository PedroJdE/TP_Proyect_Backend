
import channelMembersModel from '../models/channelMember.model.js';
import ServerError from '../helpers/serverError.helper.js';

class ChannelMembersRepository {

    async create(channel_id, user_id, role) {

        const exists = await channelMembersModel.findOne({
            fk_channel_id: channel_id,
            fk_user_id: user_id
        });

        if (exists) {
            throw new ServerError("El usuario ya pertenece al canal", 400);
        }

        return await channelMembersModel.create({
            fk_channel_id: channel_id,
            fk_user_id: user_id,
            role
        });
    }

    async findByChannelId(channel_id) {
        return await channelMembersModel.find({ fk_channel_id: channel_id });
    }

    async findByUserId(user_id) {
        return await channelMembersModel.find({ fk_user_id: user_id });
    }

    async findByChannelIdAndUserId(channel_id, user_id) {
        return await channelMembersModel.findOne({ fk_channel_id: channel_id, fk_user_id: user_id });
    }

    async delete(channel_id, user_id) {
        const result = await channelMembersModel.deleteOne({ fk_channel_id: channel_id, fk_user_id: user_id });
        if (result.deletedCount === 0) {
            throw new ServerError("No se encontró el miembro del canal para eliminar", 404);
        }
        return result;
    }

    async updateRole(channel_id, user_id, newRole) {
        const member = await channelMembersModel.findOne({ fk_channel_id: channel_id, fk_user_id: user_id });
        if (!member) {
            throw new ServerError("No se encontró el miembro del canal para actualizar", 404);
        }
        member.role = newRole;
        return await member.save();
    }
}

const channelMembersRepository = new ChannelMembersRepository();
export default channelMembersRepository;