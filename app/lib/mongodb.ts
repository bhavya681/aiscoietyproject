import mongoose from "mongoose";

export async function connectDB() {
    const MONGO_DB_URI = process.env.MONGODB_URI;
    if (!MONGO_DB_URI) {
        throw new Error("MONGODB_URI is not defined");
    }
    try {
        const connect = await mongoose.connect(MONGO_DB_URI);
        console.log('Mongodb Connected')
        return connect
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }

}