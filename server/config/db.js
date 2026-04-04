// import mongoose from "mongoose";

// const cleanupLegacyUserIndexes = async () => {
//     const usersCollection = mongoose.connection.collection("users");
//     const indexes = await usersCollection.indexes();
//     const hasLegacyMobileIndex = indexes.some((index) => index.name === "mobile_1");

//     if (hasLegacyMobileIndex) {
//         await usersCollection.dropIndex("mobile_1");
//         console.log("Dropped legacy users.mobile_1 index");
//     }
// };

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI);
//         await cleanupLegacyUserIndexes();
//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error("MongoDB Error:", error.message);
//         process.exit(1);
//     }
// };

// export default connectDB;


import mongoose from "mongoose";
import dns from "node:dns";

const getDbUris = () => {
    const primary = process.env.MONGO_URI || process.env.MONGODB_URI;
    const fallback = process.env.MONGO_URI_FALLBACK || process.env.MONGODB_URI_FALLBACK;

    if (!primary) {
        throw new Error(
            "MongoDB connection string (MONGO_URI or MONGODB_URI) is missing in environment variables."
        );
    }

    return { primary, fallback };
};

const shouldTryFallback = (err, uri) => {
    const msg = String(err?.message || "");
    return (
        typeof uri === "string" &&
        uri.startsWith("mongodb+srv://") &&
        (msg.includes("querySrv") ||
            msg.includes("ENOTFOUND") ||
            msg.includes("EAI_AGAIN") ||
            msg.includes("ECONNREFUSED"))
    );
};

const applyDnsServersIfConfigured = () => {
    const raw = process.env.DNS_SERVERS;
    if (!raw) return false;

    const servers = raw
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);

    if (servers.length === 0) return false;

    dns.setServers(servers);
    return true;
};

const applyDefaultDnsServersForSrv = () => {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
};

const connectOnce = async (dbUri) =>
    mongoose.connect(dbUri, {
        family: 4,
        serverSelectionTimeoutMS: 10000,
    });

const connectDB = async () => {
    const { primary, fallback } = getDbUris();

    applyDnsServersIfConfigured();

    try {
        const conn = await connectOnce(primary);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
    } catch (err) {
        if (shouldTryFallback(err, primary) && !process.env.DNS_SERVERS) {
            try {
                applyDefaultDnsServersForSrv();
                const conn = await connectOnce(primary);
                console.log(`MongoDB Connected (dns retry): ${conn.connection.host}`);
                return;
            } catch {
                // fall through to fallback / final error logging
            }
        }

        const canFallback = Boolean(fallback) && shouldTryFallback(err, primary);

        if (canFallback) {
            try {
                const conn = await connectOnce(fallback);
                console.log(`MongoDB Connected (fallback): ${conn.connection.host}`);
                return;
            } catch (fallbackErr) {
                console.error("MongoDB connection error (fallback):", fallbackErr?.message || fallbackErr);
            }
        }

        console.error("MongoDB connection error:", err?.message || err);

        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
    }
};

export default connectDB;
