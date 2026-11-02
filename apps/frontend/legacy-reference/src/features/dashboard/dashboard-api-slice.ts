import { apiSlice } from '@/api/api-slice';
import type { DashboardStatsResponse, RecentActivityResponse } from '@erp/shared';

export const dashboardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query<DashboardStatsResponse, void>({
            query: () => '/features/dashboard/stats',
            providesTags: ['Student', 'Batch', 'Payment'], // This query depends on all these
        }),
        getRecentActivity: builder.query<RecentActivityResponse, void>({
            query: () => '/features/dashboard/activity',
            providesTags: ['Payment', 'Enrollment'],
        }),
    }),
});

export const { useGetDashboardStatsQuery, useGetRecentActivityQuery } = dashboardApiSlice;
