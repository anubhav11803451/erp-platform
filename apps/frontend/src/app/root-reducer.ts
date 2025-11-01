import { combineSlices } from '@reduxjs/toolkit';
import { apiSlice } from '../api/api-slice';
import authSlice from '@/features/auth/auth-slice';

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
export const rootReducer = combineSlices(apiSlice, authSlice);
// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;
