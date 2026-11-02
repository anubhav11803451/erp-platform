import type { RootState } from '@/app/root-reducer';
import uiSlice from '@/app/ui-slice';
import { createAppSlice } from '@/app/create-app-slice';
import type { PayloadAction } from '@reduxjs/toolkit';

type OwnerSetupState = {
    activeDialog: 'legal-entity' | 'institution' | null;
    selectedLegalEntityId: string | null;
    directoryFilter: string;
    directoryPage: number;
    directoryPageSize: number;
    institutionCreationUnconfirmed: boolean;
    notice: string | null;
};

const initialState: OwnerSetupState = {
    activeDialog: null,
    selectedLegalEntityId: null,
    directoryFilter: '',
    directoryPage: 1,
    directoryPageSize: 10,
    institutionCreationUnconfirmed: false,
    notice: null,
};

const ownerSetupSlice = createAppSlice({
    name: 'ownerSetup',
    initialState,
    reducers: {
        openLegalEntityDialog: (state) => {
            state.activeDialog = 'legal-entity';
            state.selectedLegalEntityId = null;
            state.notice = null;
        },
        openInstitutionDialog: (state, action: PayloadAction<string>) => {
            state.activeDialog = 'institution';
            state.selectedLegalEntityId = action.payload;
            state.notice = null;
        },
        closeOwnerSetupDialog: (state) => {
            state.activeDialog = null;
            state.selectedLegalEntityId = null;
        },
        setDirectoryFilter: (state, action: PayloadAction<string>) => {
            state.directoryFilter = action.payload;
            state.directoryPage = 1;
        },
        setDirectoryPage: (state, action: PayloadAction<number>) => {
            state.directoryPage = action.payload;
        },
        setDirectoryPageSize: (state, action: PayloadAction<number>) => {
            state.directoryPageSize = action.payload;
            state.directoryPage = 1;
        },
        resetOwnerSetupState: () => initialState,
        setInstitutionCreationUnconfirmed: (state, action: PayloadAction<boolean>) => {
            state.institutionCreationUnconfirmed = action.payload;
        },
        setOwnerSetupNotice: (state, action: PayloadAction<string | null>) => {
            state.notice = action.payload;
        },
    },
});

export const {
    openLegalEntityDialog,
    openInstitutionDialog,
    closeOwnerSetupDialog,
    setDirectoryFilter,
    setDirectoryPage,
    setDirectoryPageSize,
    resetOwnerSetupState,
    setInstitutionCreationUnconfirmed,
    setOwnerSetupNotice,
} = ownerSetupSlice.actions;

declare module '@/app/ui-slice' {
    // Module augmentation requires an interface.
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface LazyLoadedSlices {
        ownerSetup?: ReturnType<typeof ownerSetupSlice.reducer>;
    }
}

uiSlice.inject(ownerSetupSlice);

export default ownerSetupSlice;

export const selectOwnerSetupState = (state: RootState) => state.ui.ownerSetup ?? initialState;
export const selectOwnerSetupDialog = (state: RootState) =>
    selectOwnerSetupState(state).activeDialog;
export const selectSelectedLegalEntityId = (state: RootState) =>
    selectOwnerSetupState(state).selectedLegalEntityId;
export const selectOwnerDirectoryFilter = (state: RootState) =>
    selectOwnerSetupState(state).directoryFilter;
export const selectOwnerDirectoryPage = (state: RootState) =>
    selectOwnerSetupState(state).directoryPage;
export const selectOwnerDirectoryPageSize = (state: RootState) =>
    selectOwnerSetupState(state).directoryPageSize;
export const selectInstitutionCreationUnconfirmed = (state: RootState) =>
    selectOwnerSetupState(state).institutionCreationUnconfirmed;
export const selectOwnerSetupNotice = (state: RootState) => selectOwnerSetupState(state).notice;
