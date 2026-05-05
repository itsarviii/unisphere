import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const AUTH_URLS = ["users/sign-in", "users/sign-up"];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  const isAuthEndpoint = AUTH_URLS.some((u) => config.url.includes(u));

  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Refresh token on 401, redirect to login if refresh also fails
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const isAuthEndpoint = AUTH_URLS.some((u) => original.url?.includes(u));
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}users/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccess = res.data.access;
        localStorage.setItem("access_token", newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;

        return api(original);
      } catch {
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

function redirectToLogin() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/sign-in";
}

export default api;
