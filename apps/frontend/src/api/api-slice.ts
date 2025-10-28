import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
    reducerPath: 'api',
    // Note: Assumes your NestJS backend is running on port 3000
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL }),
    // Tag types are used for caching and invalidation
    tagTypes: ['Student', 'Batch', 'Payment', 'Attendance'],
    endpoints: () => ({
        // Endpoints will be "injected" from other files
    }),
});
