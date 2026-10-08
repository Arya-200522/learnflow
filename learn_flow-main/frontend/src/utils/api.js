import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const code = error.response?.data?.code;

    const logoutCodes = [
      "ACCESS_EXPIRED",
      "SESSION_REPLACED",
      "INVALID_SESSION",
      "USER_NOT_FOUND",
    ];

    if (logoutCodes.includes(code)) {
      const message =
        error.response?.data?.message ||
        "Your session has ended. Please sign in again.";

      sessionStorage.setItem(
        "learnflow_auth_message",
        message,
      );

      localStorage.removeItem("learnflow_user");

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default api;