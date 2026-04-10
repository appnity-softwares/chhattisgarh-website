import axios from "axios";
import apiConfig from "./api.config";

const api = axios.create({
    baseURL: apiConfig.baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor for Auth Token
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle Unauthorized - maybe redirect to login or refresh token
        }
        return Promise.reject(error);
    }
);

export const apiService = {
    get: api.get,
    post: api.post,
    put: api.put,
    delete: api.delete,
};

export default apiService;
