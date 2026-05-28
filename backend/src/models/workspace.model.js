import mongoose from "mongoose";

export const WORKSPACE_COLLECTION_NAME = "Workspace";

const workspaceschema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    fecha_creacion: {
            type: Date,
            required: true,
            default: Date.now
        },
    activo: {
        type: Boolean,
        required: true,
        default: true
    },
    descripcion: {
        type: String,
        required: false
    }
});

const Workspace = mongoose.model(WORKSPACE_COLLECTION_NAME, workspaceschema);
export default Workspace;