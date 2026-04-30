const PRODUCTION_API_BASE_URL = "https://gurunanak.onrender.com/api";
const DEVELOPMENT_API_BASE_URL = "http://localhost:5500/api";

const isLocalApiUrl = (value = "") =>
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value);

export const getApiBaseUrl = () => {
    const configuredUrl =
        import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
    const normalizedUrl = configuredUrl.trim().replace(/\/+$/, "");

    if (import.meta.env.PROD) {
        return normalizedUrl && !isLocalApiUrl(normalizedUrl)
            ? normalizedUrl
            : PRODUCTION_API_BASE_URL;
    }

    return normalizedUrl || DEVELOPMENT_API_BASE_URL;
};

export const getApiOrigin = () => getApiBaseUrl().replace(/\/api\/?$/, "");
