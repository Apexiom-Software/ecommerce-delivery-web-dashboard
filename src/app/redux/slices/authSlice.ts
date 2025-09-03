import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { PayloadAction } from "@reduxjs/toolkit";

// ----------------------
// Types
// ----------------------
export interface User {
  userId: number;
  firstname: string;
  lastname: string;
  email: string;
  gender: string;
  phoneNumber: string;
  role: string;
  verified: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  currentUserEmail: string | null;
  currentUser: User | null;
  isGuest: boolean;
}

// ----------------------
// Initial State
// ----------------------
const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  currentUserEmail: null,
  currentUser: null,
  isGuest: false,
};

// ----------------------
// Slice
// ----------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // CHANGED: reducer is now PURE (no AsyncStorage writes here).
    // Callers should persist tokens themselves after dispatching.
    setAuthTokens: (
      state,
      action: PayloadAction<{
        accessToken: string | null;
        refreshToken: string | null;
        email?: string | null;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.currentUserEmail = action.payload.email ?? null;
    },

    // CHANGED: pure reducer; if you want to persist guest flag,
    // do it where you dispatch this (e.g., bootstrap or UI).
    setGuestStatus: (state, action: PayloadAction<boolean>) => {
      state.isGuest = action.payload;
    },

    // CHANGED: pure reducer; no storage writes here.
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },

    // CHANGED: pure reducer; storage cleanup is handled in your logOut() service.
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.currentUserEmail = null;
      state.currentUser = null;
      state.isGuest = false;
    },
  },
});

// ----------------------
// Exports
// ----------------------
export const { setAuthTokens, setCurrentUser, logout, setGuestStatus } =
  authSlice.actions;

// Selectors
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectIsGuest = (state: RootState) => state.auth.isGuest;

export default authSlice.reducer;

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { RootState } from "../store"; // Import RootState to define the selector

// // Define the User interface
// export interface User {
//   userId: number;
//   firstname: string;
//   lastname: string;
//   email: string;
//   gender: string;
//   phoneNumber: string;
//   role: string;
//   verified: boolean;
// }

// // Define the AuthState interface
// interface AuthState {
//   accessToken: string | null;
//   refreshToken: string | null;
//   currentUserEmail: string | null;
//   currentUser: User | null;
//   isGuest: boolean;
// }

// // Initial state for the auth slice
// const initialState: AuthState = {
//   accessToken: null,
//   refreshToken: null,
//   currentUserEmail: null,
//   currentUser: null,
//   isGuest: false,
// };

// // Create the auth slice
// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setAuthTokens: (
//       state,
//       action: PayloadAction<{
//         accessToken: string;
//         refreshToken: string;
//         email?: string;
//       }>
//     ) => {
//       state.accessToken = action.payload.accessToken;
//       state.refreshToken = action.payload.refreshToken;
//       state.currentUserEmail = action.payload.email || null; // Store email if available
//       // Save tokens to AsyncStorage
//       AsyncStorage.setItem("accessToken", action.payload.accessToken);
//       AsyncStorage.setItem("refreshToken", action.payload.refreshToken);
//       if (action.payload.email) {
//         AsyncStorage.setItem("currentUserEmail", action.payload.email);
//       }
//     },

//     // Ajoutez cette action dans vos reducers
//     setGuestStatus: (state, action: PayloadAction<boolean>) => {
//       state.isGuest = action.payload;
//       AsyncStorage.setItem("isGuest", action.payload ? "true" : "false");
//     },

//     setCurrentUser: (state, action: PayloadAction<User>) => {
//       state.currentUser = action.payload; // Set the current user
//       AsyncStorage.setItem("currentUser", JSON.stringify(action.payload)); // Save to AsyncStorage
//     },

//     logout: (state) => {
//       state.accessToken = null;
//       state.refreshToken = null;
//       state.currentUserEmail = null;
//       state.currentUser = null;
//       // Clear tokens from AsyncStorage
//       AsyncStorage.removeItem("accessToken");
//       AsyncStorage.removeItem("refreshToken");
//       AsyncStorage.removeItem("currentUserEmail");
//       AsyncStorage.removeItem("currentUser");
//       AsyncStorage.removeItem("isGuest");
//     },
//   },
// });

// // Export actions
// export const { setAuthTokens, setCurrentUser, logout,setGuestStatus } = authSlice.actions;

// // Export the selector
// export const selectAccessToken = (state: RootState) => state.auth.accessToken;
// export const selectCurrentUser = (state: RootState) => state.auth.currentUser; // Selector for currentUser
// // Export the reducer
// export default authSlice.reducer;
