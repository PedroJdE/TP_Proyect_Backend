

/* 
Ruta: /api/workspace
    controlador: workspaceController
        post() Debe estar con el authMiddleware
            Validar nombre y descripcion (opcional)
            Crear un espacio de trabajo
            Crear una membresia de role tipo 'dueño' a nombre del id del cliente consultante.
            
            body: {
                nombre,
                descripcion
            }
*/
import { MEMBER_WORKSPACE_ROLES, MEMBER_CHANNEL_ROLES, normalizeWorkspaceRole } from "../src/constants/memberRoles.constant.js";
import ServerError from "../src/helpers/serverError.helper.js";
import { buildWorkspaceInvitationEmail } from "../src/helpers/emailTemplates.helper.js";
import workspaceRepository from "../src/repositories/workspace.repository.js";
import workspaceMemberRepository from "../src/repositories/workspaceMembers.repository.js";
import userRepository from "../src/repositories/user.repository.js";
import channelRepository from "../src/repositories/channel.repository.js";
import channelMembersRepository from "../src/repositories/channelMembers.repository.js";
import mailer_transport from "../src/config/mailer.config.js";
import ENVIRONMENT from "../src/config/environment.js";



class WorkspaceController {
    async create(request, response) {
        try {
            const { nombre, descripcion } = request.body;
            
            //Para que esto funcione se debe ejecutar previamente el authMiddleware
            const user_id = request.user.id; 

            if (!nombre || nombre.trim() === '') {
                throw new ServerError("El nombre del espacio de trabajo es obligatorio", 400);
            }

            //crea el espacio de trabajo
            const newWorkspace = await workspaceRepository.create(
                nombre, 
                descripcion || '' 
            );

            //creamos la membresia del dueño
            await workspaceMemberRepository.create(
                newWorkspace._id,
                user_id, 
                MEMBER_WORKSPACE_ROLES.OWNER
            );

            const generalChannel = await channelRepository.create(
                newWorkspace._id,
                'General',
                'Canal general del workspace'
            );

            await channelMembersRepository.create(
                generalChannel._id,
                user_id,
                MEMBER_CHANNEL_ROLES.OWNER
            );

            return response.status(201).json({
                ok: true,
                message: "Espacio de trabajo creado con éxito",
                data: {
                    workspace: newWorkspace
                }
            });

        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message
                });
            } else {
                console.error("Error crítico:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor"
                });
            }
        }
    }

    async getAllByUser(request, response) {
        try {
            const user_id = request.user.id;

            //Quiero obtener la lista de membresias de un usuario
            //Y cada membresia traera consigo la info del espacio de trabajo asociado
            const workspaces = await workspaceMemberRepository.getByUserId(user_id);

            return response.status(200).json({
                ok: true,
                message: "Espacios de trabajo obtenidos",
                data: { 
                    workspaces 
                }
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(500).json({ ok: false, message: "Error interno" });
            }
            console.error(error);
        }
    }

    async deleteById(request, response) {
        try {
            const workspace_id = request.params.workspace_id;
            const deletedWorkspace = await workspaceRepository.deleteById(workspace_id);

            return response.status(200).json({
                ok: true,
                message: "Espacio de trabajo eliminado con éxito",
                data: { workspace: deletedWorkspace },
                status: 200
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message,
                    status: error.status
                });
            } else {
                console.error("Error crítico:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor",
                    status: 500
                });
            }
        }
    }

    async updateById(request, response) {
        try {
            const workspace_id = request.params.workspace_id;
            const { nombre, descripcion } = request.body;
            const updateData = {};

            if(!nombre && !descripcion) {
                throw new ServerError("Al menos un campo (nombre o descripcion) debe ser proporcionado para la actualización", 400);
            }
            if(nombre){
                if(nombre.length < 2) {
                    throw new ServerError("El nombre del espacio de trabajo debe tener al menos 2 caracteres", 400);
                }
                updateData.nombre = nombre;
            }
            if(descripcion){
                updateData.descripcion = descripcion;
            }
            const updatedWorkspace = await workspaceRepository.updateById(workspace_id, updateData);

            const workspace_after_update = await workspaceRepository.getById(workspace_id);
            return response.status(200).json({
                ok: true,
                message: "Espacio de trabajo actualizado con éxito",
                data: { workspace: workspace_after_update },
                status: 200
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message,
                    status: error.status
                });
            } else {
                console.error("Error crítico:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor",
                    status: 500
                });
            }
        }
    }

    async getWorkspaceChannels(request, response) {
        try {
            const workspace_id = request.params.workspace_id;
            const channels = await channelRepository.findByWorkspaceId(workspace_id);

            return response.status(200).json({
                ok: true,
                message: "Canales obtenidos con éxito",
                data: { channels },
                status: 200
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message,
                    status: error.status
                });
            } else {
                console.error("Error crítico:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor",
                    status: 500
                });
            }
        }
    }

    async createChannel(request, response) {
        try {
            const workspace_id = request.params.workspace_id;
            const { nombre, descripcion, memberIds = [] } = request.body;

            if (!nombre || nombre.trim() === '') {
                throw new ServerError("El nombre del canal es obligatorio", 400);
            }

            const newChannel = await channelRepository.create(
                workspace_id,
                nombre,
                descripcion || ''
            );

            const workspaceMembers = await workspaceMemberRepository.getByWorkspaceId(workspace_id);
            const workspaceMemberIds = workspaceMembers.map(member => member.user_id?.toString()).filter(Boolean);
            const selectedMemberIds = Array.isArray(memberIds)
                ? memberIds.filter(memberId => workspaceMemberIds.includes(memberId.toString()))
                : [];

            const addMemberToChannel = async (userId) => {
                const existingMember = await channelMembersRepository.findByChannelIdAndUserId(newChannel._id, userId);
                if (!existingMember) {
                    await channelMembersRepository.create(newChannel._id, userId, MEMBER_CHANNEL_ROLES.MEMBER);
                }
            };

            await addMemberToChannel(request.user.id);
            for (const memberId of selectedMemberIds) {
                await addMemberToChannel(memberId);
            }

            return response.status(201).json({
                ok: true,
                message: "Canal creado con éxito",
                data: { channel: newChannel },
                status: 201
            });

        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message,
                    status: error.status
                });
            } else {
                console.error("Error crítico:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor",
                    status: 500
                });
            }
        }
    }
    async getWorkspaceMembers(request, response) {
        try {
            const workspace_id = request.params.workspace_id;
            const members = await workspaceMemberRepository.getByWorkspaceId(workspace_id);

            return response.status(200).json({
                ok: true,
                message: "Miembros del workspace obtenidos con éxito",
                data: { members },
                status: 200
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message,
                    status: error.status
                });
            }

            console.error("Error crítico:", error);
            return response.status(500).json({
                ok: false,
                message: "Error interno del servidor",
                status: 500
            });
        }
    }

    async getChannelMembers(request, response) {
        try {
            const { workspace_id, channel_id } = request.params;
            const workspaceMembers = await workspaceMemberRepository.getByWorkspaceId(workspace_id);
            const channelMembers = await channelMembersRepository.findByChannelId(channel_id);
            const channelMemberIds = new Set(channelMembers.map(member => member.fk_user_id?.toString()));

            const members = workspaceMembers.map(member => ({
                ...member,
                hasAccess: channelMemberIds.has(member.user_id?.toString())
            }));

            return response.status(200).json({
                ok: true,
                message: "Miembros del canal obtenidos con éxito",
                data: { members },
                status: 200
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message,
                    status: error.status
                });
            }

            console.error("Error crítico:", error);
            return response.status(500).json({
                ok: false,
                message: "Error interno del servidor",
                status: 500
            });
        }
    }

    async inviteMember(request, response) {
        try {
            const workspace_id = request.params.workspace_id;
            const { email, rol } = request.body;
            const membership = await workspaceMemberRepository.getMembership(
                workspace_id,
                request.user.id
            );
            const membershipRole = membership?.rol || membership?.role;

            if (!membership || (membershipRole !== MEMBER_WORKSPACE_ROLES.OWNER && membershipRole !== MEMBER_WORKSPACE_ROLES.ADMIN)) {
                throw new ServerError(
                    "No tienes permisos para invitar miembros",
                    403
                );
            }
            if (!email || email.trim() === '') {
                throw new ServerError("El email del usuario a invitar es obligatorio", 400);
            }
            const normalizedRole = normalizeWorkspaceRole(rol);
            if (normalizedRole && !Object.values(MEMBER_WORKSPACE_ROLES).includes(normalizedRole)) {
                throw new ServerError("El rol proporcionado no es válido", 400);
            }

            const userToInvite = await userRepository.getByEmail(email.trim());
            if (!userToInvite) {
                throw new ServerError("No existe un usuario con ese email", 404);
            }

            const invitedMember = await workspaceMemberRepository.inviteMember(
                workspace_id,
                userToInvite._id,
                normalizedRole || MEMBER_WORKSPACE_ROLES.USER
            );

            try {
                const workspace = await workspaceRepository.getById(workspace_id);
                const mailTemplate = buildWorkspaceInvitationEmail({
                    recipientEmail: userToInvite.email,
                    workspaceName: workspace?.nombre || 'un workspace',
                    inviterName: request.user?.nombre || 'Alguien',
                    workspaceUrl: `${ENVIRONMENT.FRONTEND_URL}/workspaces/${workspace_id}`
                });

                await mailer_transport.sendMail({
                    from: ENVIRONMENT.EMAIL_USER || ENVIRONMENT.GMAIL_USERNAME,
                    to: mailTemplate.to,
                    subject: mailTemplate.subject,
                    html: mailTemplate.html
                });
            } catch (mailError) {
                console.error('Error enviando invitación por mail:', mailError);
            }

            const generalChannel = await channelRepository.findByWorkspaceId(workspace_id);
            const defaultChannel = generalChannel.find(channel => channel.nombre?.toLowerCase() === 'general');
            if (defaultChannel) {
                const existingChannelMember = await channelMembersRepository.findByChannelIdAndUserId(defaultChannel._id, userToInvite._id);
                if (!existingChannelMember) {
                    await channelMembersRepository.create(defaultChannel._id, userToInvite._id, MEMBER_CHANNEL_ROLES.MEMBER);
                }
            }

            return response.status(200).json({
                ok: true,
                message: "Invitación enviada con éxito",
                data: { invitedMember },
                status: 200
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message,
                    status: error.status
                });
            } else {
                console.error("Error crítico:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor",
                    status: 500
                });
            }
        }
    }

    async acceptInvitation(request, response) {
        try {
            const workspace_member_id = request.params.workspace_member_id;
            await workspaceMemberRepository.acceptInvitation(workspace_member_id);
            return response.status(200).json({
                ok: true,
                message: "Invitación aceptada con éxito",
                status: 200
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message,
                    status: error.status
                });
            } else {
                console.error("Error crítico:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor",
                    status: 500
                });
            }
        }
    }

    async rejectInvitation(request, response) {
        try {
            const workspace_member_id = request.params.workspace_member_id;
            await workspaceMemberRepository.rejectInvitation(workspace_member_id);
            return response.status(200).json({
                ok: true,
                message: "Invitación rechazada con éxito",
                status: 200
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message,
                    status: error.status
                });
            } else {
                console.error("Error crítico:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor",
                    status: 500
                });
            }
        }
    }

    async updateChannel(request, response) {
    try {
        const channel_id = request.params.channel_id;
        const { nombre, descripcion, memberIds } = request.body;

        const updateData = {};

        if (!nombre && !descripcion) {
            throw new ServerError(
                "Al menos un campo (nombre o descripcion) debe ser proporcionado para la actualización",
                400
            );
        }

        if (nombre) {
            if (nombre.length < 2) {
                throw new ServerError(
                    "El nombre del canal debe tener al menos 2 caracteres",
                    400
                );
            }
            updateData.nombre = nombre;
        }

        if (descripcion) {
            updateData.descripcion = descripcion;
        }

        const updatedChannel = await channelRepository.updateById(
            channel_id,
            updateData
        );

        if (!updatedChannel) {
            throw new ServerError("Canal no encontrado", 404);
        }

        if (memberIds !== undefined) {
            const workspaceMembers = await workspaceMemberRepository.getByWorkspaceId(request.params.workspace_id);
            const validMemberIds = new Set(workspaceMembers.map(member => member.user_id?.toString()).filter(Boolean));
            const desiredMemberIds = Array.isArray(memberIds)
                ? memberIds.filter(memberId => validMemberIds.has(memberId.toString()))
                : [];
            const currentMembers = await channelMembersRepository.findByChannelId(channel_id);
            const currentMemberIds = new Set(currentMembers.map(member => member.fk_user_id?.toString()));
            const desiredSet = new Set(desiredMemberIds.map(memberId => memberId.toString()));

            for (const memberId of desiredSet) {
                if (!currentMemberIds.has(memberId)) {
                    await channelMembersRepository.create(channel_id, memberId, MEMBER_CHANNEL_ROLES.MEMBER);
                }
            }

            for (const member of currentMembers) {
                const memberUserId = member.fk_user_id?.toString();
                if (memberUserId && !desiredSet.has(memberUserId)) {
                    await channelMembersRepository.delete(channel_id, memberUserId);
                }
            }
        }

        return response.status(200).json({
            ok: true,
            message: "Canal actualizado con éxito",
            data: {
                channel: updatedChannel
            },
            status: 200
        });

        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message,
                    status: error.status
                });
            } else {
                console.error("Error crítico:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor",
                    status: 500
                });
            }
        }
    }
}

const workspaceController = new WorkspaceController();
export default workspaceController;