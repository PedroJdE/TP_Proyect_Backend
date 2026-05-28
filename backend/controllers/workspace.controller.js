

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
import { MEMBER_WORKSPACE_ROLES } from "../src/constants/memberRoles.constant.js";
import ServerError from "../src/helpers/serverError.helper.js";
import workspaceRepository from "../src/repositories/workspace.repository.js";
import workspaceMemberRepository from "../src/repositories/workspaceMembers.repository.js";


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
                user_id, 
                newWorkspace._id, 
                MEMBER_WORKSPACE_ROLES.OWNER
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
}

const workspaceController = new WorkspaceController();
export default workspaceController;