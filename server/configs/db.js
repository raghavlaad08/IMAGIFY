import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/quickgpt`);

        mongoose.connection.on(`connected`, () => console.log("Database connected"));
        mongoose.connection.on('error', (err) => console.error("MongoDB connection error:", err)); // Handle connection errors

    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

export default connectDB;