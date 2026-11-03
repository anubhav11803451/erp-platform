import { createAppSlice } from '@/app/create-app-slice';
import uiSlice from '@/app/ui-slice';
import type { RootState } from '@/app/root-reducer';
import type { PayloadAction } from '@reduxjs/toolkit';

type GroupsUiState = {
    selectedGroupId: string | null;
    statusMessage: string;
};

const initialState: GroupsUiState = {
    selectedGroupId: null,
    statusMessage: '',
};

const groupsUiSlice = createAppSlice({
    name: 'institutionGroupsUi',
    initialState,
    reducers: {
        setSelectedGroupId: (state, action: PayloadAction<string | null>) => {
            state.selectedGroupId = action.payload;
        },
        setGroupsStatusMessage: (state, action: PayloadAction<string>) => {
            state.statusMessage = action.payload;
        },
        resetGroupsUi: () => initialState,
    },
});

export const { setSelectedGroupId, setGroupsStatusMessage, resetGroupsUi } = groupsUiSlice.actions;

declare module '@/app/ui-slice' {
    // Module augmentation requires an interface.
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface LazyLoadedSlices {
        institutionGroupsUi?: ReturnType<typeof groupsUiSlice.reducer>;
    }
}

uiSlice.inject(groupsUiSlice);

export const selectGroupsUi = (state: RootState) => state.ui.institutionGroupsUi ?? initialState;
