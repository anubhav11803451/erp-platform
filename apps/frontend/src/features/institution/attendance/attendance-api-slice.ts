import { apiSlice } from '@/api/api-slice';
import {
    institutionAttendanceDayResponseSchema,
    institutionAttendanceSaveRequestSchema,
    type InstitutionAttendanceDayResponse,
    type InstitutionAttendanceSaveRequest,
} from '@erp/shared';
import { parseResponse } from '@/lib/utils/api-response';

type AttendanceQueryArgs = { groupId: string; date: string; staff?: boolean };
type AttendanceSaveArgs = { payload: InstitutionAttendanceSaveRequest; staff?: boolean };

export const institutionAttendanceApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInstitutionAttendance: builder.query<
            InstitutionAttendanceDayResponse,
            AttendanceQueryArgs
        >({
            query: ({ groupId, date, staff }) => ({
                url: `${
                    staff ? '/institution/staff/groups' : '/institution/groups'
                }/${encodeURIComponent(groupId)}/attendance?date=${encodeURIComponent(date)}`,
            }),
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionAttendanceDayResponseSchema),
            providesTags: ['InstitutionAttendance'],
            keepUnusedDataFor: 0,
        }),
        saveInstitutionAttendance: builder.mutation<void, AttendanceSaveArgs>({
            query: ({ payload, staff }) => ({
                url: staff ? '/institution/staff/attendance' : '/institution/attendance',
                method: 'POST',
                body: institutionAttendanceSaveRequestSchema.parse(payload),
            }),
            invalidatesTags: ['InstitutionAttendance'],
        }),
    }),
    overrideExisting: false,
});

export const { useGetInstitutionAttendanceQuery, useSaveInstitutionAttendanceMutation } =
    institutionAttendanceApi;

export type { AttendanceQueryArgs, AttendanceSaveArgs };
