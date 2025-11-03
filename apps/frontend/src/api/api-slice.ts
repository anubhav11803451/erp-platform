import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query';

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
    reducerPath: 'api',
    //  wrapper function that handles automatic re-authentication on top of baseQuery
    baseQuery: baseQueryWithReauth,
    // Tag types are used for caching and invalidation
    tagTypes: ['User', 'Student', 'Batch', 'Payment', 'Attendance'],
    endpoints: () => ({
        // Endpoints will be "injected" from other files
    }),
});
