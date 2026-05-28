import mongoose from "mongoose";
import environment from "./environment.js";

const connectMongoDB = async () => {
    try {
        await mongoose.connect(environment.MONGO_DB_CONNECTION_STRING + "/" + environment.MONGO_DB_NAME);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

export default connectMongoDB;