import { apiSlice } from '@/api/api-slice';

import type {
    AttendanceMarkPayload,
    AttendanceMarkResponse,
    AttendanceQueryPayload,
    BatchAttendanceResponse,
} from '@erp/shared';

// This is the type returned by our backend service
// This is the payload for our query
export type GetAttendanceQuery = AttendanceQueryPayload & {
    batchId: string;
};

// This is the payload for our mutation

export const attendanceApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAttendanceForBatch: builder.query<BatchAttendanceResponse[], GetAttendanceQuery>({
            query: ({ batchId, date }) => ({
                url: `/features/attendance/batch/${batchId}`,
                params: { date },
            }),
            providesTags: (_result, _error, { batchId, date }) => [
                { type: 'Attendance', id: `${batchId}-${date}` },
            ],
        }),
        markAttendance: builder.mutation<AttendanceMarkResponse, AttendanceMarkPayload>({
            query: (body) => ({
                url: '/features/attendance/mark',
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { batchId, date }) => [
                { type: 'Attendance', id: `${batchId}-${date.split('T')[0]}` },
            ],
        }),
    }),
});

export const { useGetAttendanceForBatchQuery, useMarkAttendanceMutation } = attendanceApiSlice;
