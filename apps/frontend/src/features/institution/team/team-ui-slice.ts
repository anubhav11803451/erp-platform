import { createAppSlice } from '@/app/create-app-slice';
import uiSlice from '@/app/ui-slice';
import type { RootState } from '@/app/root-reducer';
import type { PayloadAction } from '@reduxjs/toolkit';

type TeamUiState = {
    dialogOpen: boolean;
    replacementInvitationId: string | null;
    statusMessage: string;
};

const initialState: TeamUiState = {
    dialogOpen: false,
    replacementInvitationId: null,
    statusMessage: '',
};

const teamUiSlice = createAppSlice({
    name: 'institutionTeamUi',
    initialState,
    reducers: {
        openTeamInvitationDialog: (state, action: PayloadAction<string | null>) => {
            state.dialogOpen = true;
            state.replacementInvitationId = action.payload;
            state.statusMessage = '';
        },
        closeTeamInvitationDialog: (state) => {
            state.dialogOpen = false;
            state.replacementInvitationId = null;
        },
        setTeamStatusMessage: (state, action: PayloadAction<string>) => {
            state.statusMessage = action.payload;
        },
        resetTeamUi: () => initialState,
    },
});

export const {
    openTeamInvitationDialog,
    closeTeamInvitationDialog,
    setTeamStatusMessage,
    resetTeamUi,
} = teamUiSlice.actions;

declare module '@/app/ui-slice' {
    // Module augmentation requires an interface.
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface LazyLoadedSlices {
        institutionTeamUi?: ReturnType<typeof teamUiSlice.reducer>;
    }
}

uiSlice.inject(teamUiSlice);

export const selectTeamUi = (state: RootState) => state.ui.institutionTeamUi ?? initialState;
