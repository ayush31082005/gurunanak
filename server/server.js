import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.join(__dirname, ".env"),
    override: true,
});

import connectDB from "./config/db.js";
import app from "./app.js";
import { startReminderCron } from "./services/reminderCronService.js";

const DEFAULT_PORT = 5500;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;

const handleStartupError = (error) => {
    if (error?.code === "EADDRINUSE") {
        console.error(
            `Port ${PORT} is already in use. Update server/.env PORT and client/.env VITE_API_BASE_URL to a free port.`
        );
    } else {
        console.error("Server startup failed:", error);
    }

    process.exit(1);
};

const startServer = async () => {
    await connectDB();

    const server = app.listen(PORT);

    server.once("error", handleStartupError);
    server.once("listening", () => {
        console.log(`Server running on http://localhost:${PORT}`);
        startReminderCron();
    });
};

startServer().catch(handleStartupError);
