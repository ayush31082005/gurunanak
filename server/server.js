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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    startReminderCron();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();
