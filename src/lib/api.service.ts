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
            const path = window.location.pathname;
            const isDashboardRoute = path.startsWith('/dashboard');

            if (isDashboardRoute) {
                // Priority for User Dashboard
                try {
                    const userStorage = localStorage.getItem("user-auth-storage");
                    if (userStorage) {
                        const parsed = JSON.parse(userStorage);
                        token = parsed.state?.accessToken;
                    }
                } catch (e) {
                    console.error("Failed to parse user auth storage", e);
                }
                
                if (!token) {
                    // Fallback to admin if no user token (though unlikely on dashboard)
                    const adminStorage = localStorage.getItem("admin-auth-storage");
                    if (adminStorage) {
                        try {
                            const parsed = JSON.parse(adminStorage);
                            token = parsed.state?.accessToken;
                        } catch {
                            // ignore
                        }
                    }
                }
            } else {
                // Priority for Admin Panel
                try {
                    const adminStorage = localStorage.getItem("admin-auth-storage");
                    if (adminStorage) {
                        const parsed = JSON.parse(adminStorage);
                        token = parsed.state?.accessToken;
                    }
                } catch (e) {
                    console.error("Failed to parse admin auth storage", e);
                }

                if (!token) {
                    const userStorage = localStorage.getItem("user-auth-storage");
                    if (userStorage) {
                        try {
                            const parsed = JSON.parse(userStorage);
                            token = parsed.state?.accessToken;
                        } catch {
                            // ignore
                        }
                    }
                }
            }

            // Removed fallback to generic 'token' to prevent session contamination
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token.trim()}`;
            // Optional: for debugging
            // console.log(`[API] Authorized request to ${config.url}`);
        } else {
            // console.warn(`[API] No token found for request to ${config.url}`);
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
            console.warn(`Unauthorized (401) at ${error.config?.url}. Token present: ${!!error.config?.headers?.Authorization}`);
            
            // Only handle if in browser
            if (typeof window !== "undefined") {
                // Determine if it's admin or user context
                const isAdmin = window.location.pathname.startsWith('/admin');
                const storageKey = isAdmin ? "admin-auth-storage" : "user-auth-storage";
                const loginUrl = isAdmin ? "/admin-secure-login" : "/login";

                // Clear the relevant storage
                localStorage.removeItem(storageKey);

                // Redirect to login if not already there
                if (!window.location.pathname.includes("login")) {
                    window.location.href = loginUrl;
                }
            }
        }
        return Promise.reject(error);
    }
);

export const apiService = api;
export default api;
