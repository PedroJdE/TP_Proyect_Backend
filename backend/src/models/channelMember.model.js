import mongoose from "mongoose";

const channelMemberSchema = new mongoose.Schema({
    fk_channel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
        required: true
    },
    fk_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        required: false,
        default: "member"
    }
});

const ChannelMember = mongoose.model("ChannelMember", channelMemberSchema);
export default ChannelMember;