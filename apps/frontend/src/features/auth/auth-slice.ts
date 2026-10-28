import type { RootState } from '@/app/root-reducer';
import { createAppSlice } from '@/app/create-app-slice';
import type { PlatformOwnerAccountResponse, PlatformOwnerSignInResponse } from '@erp/shared';
import type { PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
    access_token: string | null;
    account: PlatformOwnerAccountResponse | null;
    isAuthLoading: boolean;
};

const initialState: AuthState = {
    access_token: null,
    account: null,
    isAuthLoading: true,
};

const authSlice = createAppSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<PlatformOwnerSignInResponse>) => {
            state.account = action.payload.account;
            state.access_token = action.payload.access_token;
            state.isAuthLoading = false;
        },
        logOut: (state) => {
            state.account = null;
            state.access_token = null;
            state.isAuthLoading = false;
        },
    },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice;

export const selectAuthState = (state: RootState) => state.auth;
export const selectCurrentAccount = (state: RootState) => state.auth.account;
export const selectCurrentUser = selectCurrentAccount;
export const selectAccessToken = (state: RootState) => state.auth.access_token;
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.access_token);
export const selectIsAuthLoading = (state: RootState) => state.auth.isAuthLoading;
