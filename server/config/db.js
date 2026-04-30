import mongoose from "mongoose";
import dns from "node:dns";

const RETRY_DELAY_MS = Number(process.env.MONGO_RETRY_DELAY_MS) || 15000;
const SERVER_SELECTION_TIMEOUT_MS = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000;

let reconnectTimer = null;
let reconnectInFlight = false;
let listenersAttached = false;
let disconnectedNoticeShown = false;

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
            msg.includes("ECONNREFUSED") ||
            msg.includes("ECONNRESET") ||
            msg.includes("ETIMEDOUT"))
    );
};

const isRetryableConnectionError = (err) => {
    const msg = String(err?.message || "");
    return (
        msg.includes("ENOTFOUND") ||
        msg.includes("EAI_AGAIN") ||
        msg.includes("ECONNREFUSED") ||
        msg.includes("ECONNRESET") ||
        msg.includes("ETIMEDOUT") ||
        msg.includes("Server selection timed out") ||
        msg.includes("ReplicaSetNoPrimary")
    );
};

const applyDnsServersIfConfigured = () => {
    const raw = process.env.DNS_SERVERS;
    if (!raw) {
        return false;
    }

    const servers = raw
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);

    if (servers.length === 0) {
        return false;
    }

    dns.setServers(servers);
    return true;
};

const applyDefaultDnsServersForSrv = () => {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
};

const connectOnce = async (dbUri) =>
    mongoose.connect(dbUri, {
        family: 4,
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    });

const clearReconnectTimer = () => {
    if (!reconnectTimer) {
        return;
    }

    clearTimeout(reconnectTimer);
    reconnectTimer = null;
};

const scheduleReconnect = (reason = "temporary network issue") => {
    if (reconnectTimer || reconnectInFlight || mongoose.connection.readyState === 1) {
        return;
    }

    console.warn(`MongoDB unavailable (${reason}). Retrying in ${Math.round(RETRY_DELAY_MS / 1000)}s.`);

    reconnectTimer = setTimeout(async () => {
        reconnectTimer = null;
        await connectDB({ fromRetryTimer: true });
    }, RETRY_DELAY_MS);

    reconnectTimer.unref?.();
};

const attachConnectionListeners = () => {
    if (listenersAttached) {
        return;
    }

    listenersAttached = true;

    mongoose.connection.on("connected", () => {
        disconnectedNoticeShown = false;
        clearReconnectTimer();
    });

    mongoose.connection.on("reconnected", () => {
        disconnectedNoticeShown = false;
        clearReconnectTimer();
        console.log(`MongoDB reconnected: ${mongoose.connection.host}`);
    });

    mongoose.connection.on("disconnected", () => {
        if (!disconnectedNoticeShown) {
            console.warn("MongoDB disconnected. The API will stay up and keep retrying in the background.");
            disconnectedNoticeShown = true;
        }

        scheduleReconnect("connection lost");
    });

    mongoose.connection.on("error", (error) => {
        const message = error?.message || String(error);

        if (isRetryableConnectionError(error)) {
            console.warn(`MongoDB transient error: ${message}`);
            scheduleReconnect(message);
            return;
        }

        console.error(`MongoDB error: ${message}`);
    });
};

const tryConnectWithStrategies = async () => {
    const { primary, fallback } = getDbUris();

    applyDnsServersIfConfigured();

    try {
        const conn = await connectOnce(primary);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (primaryError) {
        if (shouldTryFallback(primaryError, primary) && !process.env.DNS_SERVERS) {
            try {
                applyDefaultDnsServersForSrv();
                const dnsRetryConn = await connectOnce(primary);
                console.log(`MongoDB Connected (dns retry): ${dnsRetryConn.connection.host}`);
                return dnsRetryConn;
            } catch (dnsRetryError) {
                if (fallback && shouldTryFallback(dnsRetryError, primary)) {
                    try {
                        const fallbackConn = await connectOnce(fallback);
                        console.log(`MongoDB Connected (fallback): ${fallbackConn.connection.host}`);
                        return fallbackConn;
                    } catch (fallbackError) {
                        console.error("MongoDB connection error (fallback):", fallbackError?.message || fallbackError);
                        throw fallbackError;
                    }
                }

                throw dnsRetryError;
            }
        }

        if (fallback && shouldTryFallback(primaryError, primary)) {
            try {
                const fallbackConn = await connectOnce(fallback);
                console.log(`MongoDB Connected (fallback): ${fallbackConn.connection.host}`);
                return fallbackConn;
            } catch (fallbackError) {
                console.error("MongoDB connection error (fallback):", fallbackError?.message || fallbackError);
                throw fallbackError;
            }
        }

        throw primaryError;
    }
};

const connectDB = async ({ fromRetryTimer = false } = {}) => {
    attachConnectionListeners();

    if (mongoose.connection.readyState === 1) {
        return true;
    }

    if (mongoose.connection.readyState === 2) {
        return false;
    }

    reconnectInFlight = true;

    try {
        await tryConnectWithStrategies();
        clearReconnectTimer();
        return true;
    } catch (error) {
        const message = error?.message || String(error);

        if (!fromRetryTimer) {
            console.error(`MongoDB connection error: ${message}`);
        } else {
            console.warn(`MongoDB retry failed: ${message}`);
        }

        if (isRetryableConnectionError(error)) {
            scheduleReconnect(message);
            return false;
        }

        throw error;
    } finally {
        reconnectInFlight = false;
    }
};

export default connectDB;
