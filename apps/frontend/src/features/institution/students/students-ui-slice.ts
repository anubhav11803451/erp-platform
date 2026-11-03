import { createAppSlice } from '@/app/create-app-slice';
import uiSlice from '@/app/ui-slice';
import type { RootState } from '@/app/root-reducer';
import type { PayloadAction } from '@reduxjs/toolkit';

type StudentsUiState = {
    search: string;
    showCreate: boolean;
    selectedStudentId: string | null;
    statusMessage: string;
};

const initialState: StudentsUiState = {
    search: '',
    showCreate: false,
    selectedStudentId: null,
    statusMessage: '',
};

const studentsUiSlice = createAppSlice({
    name: 'institutionStudentsUi',
    initialState,
    reducers: {
        setStudentSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
        },
        setStudentCreateOpen: (state, action: PayloadAction<boolean>) => {
            state.showCreate = action.payload;
        },
        setSelectedStudentId: (state, action: PayloadAction<string | null>) => {
            state.selectedStudentId = action.payload;
        },
        setStudentsStatusMessage: (state, action: PayloadAction<string>) => {
            state.statusMessage = action.payload;
        },
        resetStudentsUi: () => initialState,
    },
});

export const {
    setStudentSearch,
    setStudentCreateOpen,
    setSelectedStudentId,
    setStudentsStatusMessage,
    resetStudentsUi,
} = studentsUiSlice.actions;

declare module '@/app/ui-slice' {
    // Module augmentation requires an interface.
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface LazyLoadedSlices {
        institutionStudentsUi?: ReturnType<typeof studentsUiSlice.reducer>;
    }
}

uiSlice.inject(studentsUiSlice);

export const selectStudentsUi = (state: RootState) =>
    state.ui.institutionStudentsUi ?? initialState;
