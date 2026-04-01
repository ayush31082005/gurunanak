import mongoose from "mongoose";

const cleanupLegacyUserIndexes = async () => {
    const usersCollection = mongoose.connection.collection("users");
    const indexes = await usersCollection.indexes();
    const hasLegacyMobileIndex = indexes.some((index) => index.name === "mobile_1");

    if (hasLegacyMobileIndex) {
        await usersCollection.dropIndex("mobile_1");
        console.log("Dropped legacy users.mobile_1 index");
    }
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        await cleanupLegacyUserIndexes();
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB Error:", error.message);
        process.exit(1);
    }
};

export default connectDB;
