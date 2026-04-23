import crypto from "crypto";

const getCloudinaryConfig = () => {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (!cloudinaryUrl) {
        return {
            cloudName: process.env.CLOUD_NAME,
            apiKey: process.env.API_KEY,
            apiSecret: process.env.API_SECRET,
        };
    }

    const parsedUrl = new URL(cloudinaryUrl);

    return {
        cloudName: parsedUrl.hostname,
        apiKey: parsedUrl.username,
        apiSecret: parsedUrl.password,
    };
};

const ensureCloudinaryConfig = () => {
    const config = getCloudinaryConfig();

    if (!config.cloudName || config.cloudName === "your_cloud_name") {
        throw new Error("Cloudinary cloud name is missing or still using the placeholder value.");
    }

    if (!config.apiKey || !config.apiSecret) {
        throw new Error("Cloudinary API key or secret is missing.");
    }

    return config;
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
    const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig();

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

export const uploadReturnProofToCloudinary = async ({
    fileBuffer,
    fileName,
    fileType,
}) => {
    const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig();

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "gurunanak/returns";

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

export const deletePrescriptionFromCloudinary = async (publicId) => {
    if (!publicId) {
        return null;
    }

    const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = buildSignature(
        {
            public_id: publicId,
            timestamp,
        },
        apiSecret
    );

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
            method: "POST",
            body: formData,
        }
    );

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload?.error?.message || "Cloudinary delete failed");
    }

    return payload;
};

export const uploadMediaToCloudinary = async ({
    fileBuffer,
    fileName,
    fileType,
    folder,
}) => {
    const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);

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

export const deleteCloudinaryResource = async ({
    publicId,
    resourceType = "image",
} = {}) => {
    if (!publicId) {
        return null;
    }

    const { cloudName, apiKey, apiSecret } = ensureCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = buildSignature(
        {
            public_id: publicId,
            timestamp,
        },
        apiSecret
    );

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
        {
            method: "POST",
            body: formData,
        }
    );

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload?.error?.message || "Cloudinary delete failed");
    }

    return payload;
};
