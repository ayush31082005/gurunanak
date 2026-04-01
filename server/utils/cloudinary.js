import crypto from "crypto";

const getCloudinaryConfig = () => {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (!cloudinaryUrl) {
        throw new Error("CLOUDINARY_URL is missing in environment variables");
    }

    const parsedUrl = new URL(cloudinaryUrl);

    return {
        cloudName: parsedUrl.hostname,
        apiKey: parsedUrl.username,
        apiSecret: parsedUrl.password,
    };
};

const buildSignature = (params, apiSecret) => {
    const signatureBase = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

    return crypto
        .createHash("sha1")
        .update(`${signatureBase}${apiSecret}`)
        .digest("hex");
};

export const uploadPrescriptionToCloudinary = async ({
    fileBuffer,
    fileName,
    fileType,
}) => {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

    if (!cloudName || cloudName === "your_cloud_name") {
        throw new Error("Cloudinary cloud name is missing or still using the placeholder value.");
    }

    if (!apiKey || !apiSecret) {
        throw new Error("Cloudinary API key or secret is missing.");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "gurunanak/prescriptions";

    const signature = buildSignature(
        {
            folder,
            timestamp,
        },
        apiSecret
    );

    const formData = new FormData();
    formData.append("file", new Blob([fileBuffer], { type: fileType }), fileName);
    formData.append("api_key", apiKey);
    formData.append("folder", folder);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload?.error?.message || "Cloudinary upload failed");
    }

    return payload;
};
