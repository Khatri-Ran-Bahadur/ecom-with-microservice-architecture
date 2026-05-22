import axios from "axios";
import { runRedirectToLogin } from "./redirect";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials: true,
    timeout: 10000
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {
    const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/'];
    const currentPath = window.location.pathname;

    if (!publicPaths.includes(currentPath)) {
        runRedirectToLogin();
    }
}

// handle adding a new access token to queued requests
const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback);
}

// Execute queued requests after refresh
const onRefreshSuccess = () => {
    refreshSubscribers.forEach(callback => callback());
    refreshSubscribers = [];
}

// Handle API requests
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
)

//Handle API Responses
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If we're on the server, just reject the error
        if (typeof window === "undefined") {
            return Promise.reject(error);
        }


        const is401 = error?.response?.status === 401
        const isRetry = !originalRequest?._retry
        const isAuthRequired = originalRequest?.requireAuth === true;

        if (is401 && !isRetry && isAuthRequired) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(() => {
                        resolve(axiosInstance(originalRequest));
                    })
                })
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                await axiosInstance.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/api/refresh-token`, {},
                    { withCredentials: true })

                isRefreshing = false;
                onRefreshSuccess();
                return axiosInstance(originalRequest);


            } catch (error) {
                isRefreshing = false;
                refreshSubscribers = [];

                // Only redirect to login if the failed request was NOT a background user check
                if (!originalRequest.url?.includes('/api/logged-in-user')) {
                    handleLogout();
                }
                return Promise.reject(error);
            }
        }


        return Promise.reject(error);
    }
)

export default axiosInstance;