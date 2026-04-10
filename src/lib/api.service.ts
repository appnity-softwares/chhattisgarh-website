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
        let token = null;
        if (typeof window !== "undefined") {
            const storage = localStorage.getItem("admin-auth-storage");
            if (storage) {
                try {
                    const parsed = JSON.parse(storage);
                    token = parsed.state?.accessToken;
                } catch (e) {
                    console.error("Failed to parse auth storage", e);
                }
            }
            if (!token) {
                token = localStorage.getItem("token");
            }
        }
        
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
