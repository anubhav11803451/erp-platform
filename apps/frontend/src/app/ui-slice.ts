import { createAppReducer } from './create-app-slice';

// Redux Toolkit's injected feature slices augment this interface.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/consistent-type-definitions
export interface LazyLoadedSlices {}

const uiSlice = createAppReducer({}).withLazyLoadedSlices<LazyLoadedSlices>();

export default uiSlice;
