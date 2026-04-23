import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname) || ".jpg";
        const safeBaseName = path
            .basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9-_]/g, "-")
            .toLowerCase();

        callback(null, `${Date.now()}-${safeBaseName}${extension}`);
    },
});

const createUpload = (allowedMimeTypes) =>
    multer({
        storage,
        fileFilter: (_req, file, callback) => {
            if (!allowedMimeTypes.includes(file.mimetype)) {
                callback(new Error("Unsupported file type"));
                return;
            }

            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    });

const createMemoryUpload = (allowedMimeTypes) =>
    multer({
        storage: multer.memoryStorage(),
        fileFilter: (_req, file, callback) => {
            if (!allowedMimeTypes.includes(file.mimetype)) {
                callback(new Error("Unsupported file type"));
                return;
            }

            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    });

const imageMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
const documentMimeTypes = [...imageMimeTypes, "application/pdf"];

const upload = createUpload(imageMimeTypes);

export const mrDocumentUpload = createUpload(documentMimeTypes);
export const imageMemoryUpload = createMemoryUpload(imageMimeTypes);
export const documentMemoryUpload = createMemoryUpload(documentMimeTypes);

export default upload;
