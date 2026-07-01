import mongoose from "mongoose";
import { USER_COLLECTION_NAME } from "./user.model.js";

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 4000
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true
        },

        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
            required: true
        },

        edited: {
            type: Boolean,
            default: false
        },

        deleted: {
            type: Boolean,
            default: false
        },

        parentMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Message", messageSchema);
