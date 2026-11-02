import { combineSlices } from '@reduxjs/toolkit';
import { apiSlice } from '../api/api-slice';
import uiSlice from './ui-slice';

export const rootReducer = combineSlices(apiSlice, { ui: uiSlice });
// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;
