import { createAppSlice } from '@/app/create-app-slice';
import type { RootState } from '@/app/root-reducer';
import type { User } from '@erp/db';
import type { PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {} & Omit<User, 'password_hash' | 'created_at' | 'updated_at'>;

type AuthState = {
    access_token: string | null;
    csrf_token: string | null;
    user: AuthUser | null;
    isAuthLoading: boolean;
};

const initialState: AuthState = {
    access_token: null,
    csrf_token: null,
    user: null,
    isAuthLoading: true,
};

const authSlice = createAppSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: AuthUser; csrf_token: string; access_token: string }>
        ) => {
            state.user = action.payload.user;
            state.access_token = action.payload.access_token;
            state.csrf_token = action.payload.csrf_token;
            state.isAuthLoading = false;
        },
        logOut: (state) => {
            state.user = null;
            state.access_token = null;
            state.csrf_token = null;
            state.isAuthLoading = false;
        },
        // This is a new reducer to handle just the loading state on refresh failure
        authLoadingFailed: (state) => {
            state.isAuthLoading = false;
        },
    },
    // extraReducers: (builder) => {
    //     builder
    //         // Listen for the "login" endpoint to be fulfilled
    //         .addMatcher(authApiSlice.endpoints.login.matchFulfilled, (state, action) => {
    //             // The action.payload is the AuthResponse object
    //             // Call our existing setCredentials reducer
    //             authSlice.caseReducers.setCredentials(state, action);
    //         })
    //         // Listen for the "refresh" endpoint to be fulfilled
    //         .addMatcher(authApiSlice.endpoints.refresh.matchFulfilled, (state, action) => {
    //             // Same as above
    //             authSlice.caseReducers.setCredentials(state, action);
    //         })
    //         // Listen for "logout" to be fulfilled
    //         .addMatcher(authApiSlice.endpoints.logout.matchFulfilled, (state) => {
    //             // Call our existing logOut reducer
    //             authSlice.caseReducers.logOut(state);
    //         });
    // },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice;

// --- NEW: Selectors ---
export const selectAuthState = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.access_token;
export const selectCsrfToken = (state: RootState) => state.auth.csrf_token;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.access_token;
export const selectIsAuthLoading = (state: RootState) => state.auth.isAuthLoading;
