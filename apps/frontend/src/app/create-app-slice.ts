import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';

// `buildCreateSlice` allows us to create a slice with async thunks.
export const createAppSlice = buildCreateSlice({
    creators: { asyncThunk: asyncThunkCreator },
});

export type AppSlice = ReturnType<typeof createAppSlice>;

export type AppSliceState = ReturnType<AppSlice['reducer']>;
