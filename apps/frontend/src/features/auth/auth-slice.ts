import type { RootState } from '@/app/root-reducer';
import uiSlice from '@/app/ui-slice';
import { createAppSlice } from '@/app/create-app-slice';
import type { WorkspaceSessionResponse, WorkspaceIdentityResponse } from '@erp/shared';
import type { PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
    access_token: string | null;
    csrf_token: string | null;
    account: WorkspaceIdentityResponse['account'] | null;
    currentUser: WorkspaceIdentityResponse | null;
    isAuthLoading: boolean;
};

const initialState: AuthState = {
    access_token: null,
    csrf_token: null,
    account: null,
    currentUser: null,
    isAuthLoading: true,
};

const authSlice = createAppSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<WorkspaceSessionResponse>) => {
            state.account = action.payload.identity.account;
            state.access_token = action.payload.access_token;
            state.csrf_token = action.payload.csrf_token;
            state.currentUser = action.payload.identity;
            state.isAuthLoading = false;
        },
        setCsrfToken: (state, action: PayloadAction<string>) => {
            state.csrf_token = action.payload;
        },
        logOut: (state) => {
            state.account = null;
            state.access_token = null;
            state.csrf_token = null;
            state.currentUser = null;
            state.isAuthLoading = false;
        },
    },
});

export const { setCredentials, setCsrfToken, logOut } = authSlice.actions;
export default authSlice;

declare module '@/app/ui-slice' {
    // Module augmentation requires an interface.
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface LazyLoadedSlices {
        auth?: ReturnType<typeof authSlice.reducer>;
    }
}

uiSlice.inject(authSlice);

export const selectAuthState = (state: RootState) => state.ui.auth ?? initialState;
export const selectCurrentAccount = (state: RootState) => selectAuthState(state).account;
export const selectCurrentUser = (state: RootState) => selectAuthState(state).currentUser;
export const selectAccessToken = (state: RootState) => selectAuthState(state).access_token;
export const selectCsrfToken = (state: RootState) => selectAuthState(state).csrf_token;
export const selectIsAuthenticated = (state: RootState) =>
    Boolean(selectAuthState(state).access_token && selectAuthState(state).currentUser);
export const selectIsAuthLoading = (state: RootState) => selectAuthState(state).isAuthLoading;
