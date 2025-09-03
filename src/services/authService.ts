import axios, { isAxiosError } from "axios";
import { store } from "../app/redux/store";
import {
  logout,
  setAuthTokens,
  setCurrentUser,
} from "../../src/app/redux/slices/authSlice";
import { SERVER_IP } from "../../constants/constants";
import { setTokenMemorySafe } from "../utils/authStorage";

/* -------------------------------------------------------
   Axios instance with credentials
------------------------------------------------------- */
const api = axios.create({
  baseURL: SERVER_IP,
  withCredentials: true, // important → envoie cookies sécurisés
});

api.interceptors.request.use(
  (config) => {
    const accessToken = store.getState().auth.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* -------------------------------------------------------
   Response interceptor to handle auth errors
------------------------------------------------------- */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentative de rafraîchissement du token
        await refreshAccessToken();

        // Répéter la requête originale
        const accessToken = store.getState().auth.accessToken;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        await logOut();
        window.location.href = "/login"; // Redirection forcée
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
/* -------------------------------------------------------
   Auth flows
------------------------------------------------------- */

// Authenticate User
export const authenticateUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/api/v1/auth/authenticate", {
      email,
      password,
    });

    const { access_token } = response.data;

    // Stockage en mémoire Redux
    store.dispatch(
      setAuthTokens({ accessToken: access_token, refreshToken: null, email })
    );

    // ✅ Stockage temporaire sécurisé pour navigation
    setTokenMemorySafe(access_token);

    return { access_token };
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw error.response?.data || { message: "Authentication failed" };
    }
    throw { message: "Unexpected error" };
  }
};


// WhoAmI
export const whoAmI = async () => {
  try {
    const accessToken = store.getState().auth.accessToken;
    if (!accessToken) throw new Error("No access token found. Please log in.");

    const response = await api.get("/api/v1/users/whoami", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = response.data;
    store.dispatch(setCurrentUser(user));
    return user;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw error.response?.data || { message: "Something went wrong" };
    }
    throw { message: "Unexpected error" };
  }
};

// Refresh Token
export const refreshAccessToken = async () => {
  try {
    const response = await api.post("/api/v1/auth/refresh-token");
    const { access_token } = response.data;

    store.dispatch(
      setAuthTokens({ accessToken: access_token, refreshToken: null })
    );

    // ✅ Mise à jour sessionStorage
    setTokenMemorySafe(access_token);

    return { accessToken: access_token };
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        await logOut();
      }
      throw error.response?.data || { message: "Token refresh failed" };
    }
    throw { message: "Unexpected error" };
  }
};


// Logout
export const logOut = async () => {
  try {
    await api.post("/api/v1/auth/logout");

    store.dispatch(logout());
  } catch (error: unknown) {
    console.error("Logout error", error);
    store.dispatch(logout());
  }
};
