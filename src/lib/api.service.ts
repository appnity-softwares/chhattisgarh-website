import axios from "axios";
import apiConfig from "./api.config";

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

const api = axios.create({
    baseURL: apiConfig.baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000, // 15 second timeout
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

// Response Interceptor for handling errors with retry logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Don't retry if no original request or already retried
        if (!originalRequest || originalRequest._retry) {
            return handleErrorResponse(error);
        }

        // Check if we should retry
        const shouldRetry = RETRY_STATUS_CODES.includes(error.response?.status) || 
                           error.code === 'ECONNABORTED' || 
                           error.code === 'NETWORK_ERROR';

        if (shouldRetry && !originalRequest._retryCount) {
            originalRequest._retry = true;
            originalRequest._retryCount = 0;
        }

        if (shouldRetry && originalRequest._retryCount < MAX_RETRIES) {
            originalRequest._retryCount++;
            
            // Wait before retrying with exponential backoff
            await new Promise(resolve => 
                setTimeout(resolve, RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1))
            );
            
            try {
                return await api(originalRequest);
            } catch (retryError) {
                return handleErrorResponse(retryError);
            }
        }

        return handleErrorResponse(error);
    }
);

// Handle different error responses
function handleErrorResponse(error: any) {
    if (error.response?.status === 401) {
        // Handle unauthorized - clear storage and redirect
        if (typeof window !== "undefined") {
            const isAdmin = window.location.pathname.startsWith('/admin');
            const storageKey = isAdmin ? "admin-auth-storage" : "user-auth-storage";
            const loginUrl = isAdmin ? "/admin-secure-login" : "/login";

            localStorage.removeItem(storageKey);

            if (!window.location.pathname.includes("login")) {
                window.location.href = loginUrl;
            }
        }
        return Promise.reject(createUserFriendlyError('Session expired. Please login again.'));
    }

    if (error.response?.status === 403) {
        return Promise.reject(createUserFriendlyError('Access denied. You don\'t have permission to perform this action.'));
    }

    if (error.response?.status === 429) {
        return Promise.reject(createUserFriendlyError('Too many requests. Please try again later.'));
    }

    if (error.code === 'ECONNABORTED') {
        return Promise.reject(createUserFriendlyError('Request timed out. Please check your connection and try again.'));
    }

    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        return Promise.reject(createUserFriendlyError('Network error. Please check your internet connection.'));
    }

    // Generic server error
    if (error.response?.status >= 500) {
        return Promise.reject(createUserFriendlyError('Server error. Please try again later.'));
    }

    // Return original error for client errors (400, etc.)
    return Promise.reject(error);
}

// Create user-friendly error objects
function createUserFriendlyError(message: string) {
    const error = new Error(message) as any;
    error.isUserFriendly = true;
    return error;
}

export const apiService = api;
export default api;
