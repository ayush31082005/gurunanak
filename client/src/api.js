import axios from "axios";
import { getApiBaseUrl } from "./config/apiBaseUrl";

const API_BASE_URL = getApiBaseUrl();

const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default API;
