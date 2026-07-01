import mongoose from "mongoose";
import { WORKSPACE_COLLECTION_NAME } from "./workspace.model.js";

const channelSchema = new mongoose.Schema({
    fk_workspace_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: WORKSPACE_COLLECTION_NAME
    },
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

const CHANNEL_COLLECTION_NAME = "Channel";
const Channel = mongoose.model(CHANNEL_COLLECTION_NAME, channelSchema);
export default Channel;