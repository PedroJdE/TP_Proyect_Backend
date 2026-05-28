import mongoose from "mongoose";

const chanelSchema = new mongoose.Schema({
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

CHANEL_COLLECTION_NAME = "Chanel";
const Chanel = mongoose.model('CHANEL_COLLECTION_NAME', chanelSchema);
export default Chanel;