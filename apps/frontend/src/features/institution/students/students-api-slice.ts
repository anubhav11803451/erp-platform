import { apiSlice } from '@/api/api-slice';
import {
    institutionStudentArchiveRequestSchema,
    institutionStudentCreateRequestSchema,
    institutionStudentGroupMembershipUpdateRequestSchema,
    institutionStudentListResponseSchema,
    institutionStudentResponseSchema,
    institutionStudentUpdateRequestSchema,
    type InstitutionStudentCreateRequest,
    type InstitutionStudentListResponse,
    type InstitutionStudentResponse,
    type InstitutionStudentUpdateRequest,
} from '@erp/shared';
import { parseResponse, searchSuffix } from '@/lib/utils/api-response';

type SearchArgs = { search?: string };
type GroupStudentsArgs = SearchArgs & { groupId: string };
type StudentMutationArgs = {
    studentId: string;
    payload: InstitutionStudentUpdateRequest;
    staff?: boolean;
};

export const institutionStudentsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInstitutionStudents: builder.query<InstitutionStudentListResponse, SearchArgs>({
            query: ({ search }) => `/institution/students${searchSuffix(search)}`,
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionStudentListResponseSchema),
            providesTags: ['InstitutionStudents'],
        }),
        getInstitutionGroupStudents: builder.query<
            InstitutionStudentListResponse,
            GroupStudentsArgs
        >({
            query: ({ groupId, search }) =>
                `/institution/groups/${encodeURIComponent(groupId)}/students${searchSuffix(search)}`,
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionStudentListResponseSchema),
            providesTags: ['InstitutionStudents'],
        }),
        getStaffGroupStudents: builder.query<InstitutionStudentListResponse, GroupStudentsArgs>({
            query: ({ groupId, search }) =>
                `/institution/staff/groups/${encodeURIComponent(groupId)}/students${searchSuffix(search)}`,
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionStudentListResponseSchema),
            providesTags: ['InstitutionStudents'],
            keepUnusedDataFor: 0,
        }),
        createInstitutionStudent: builder.mutation<
            InstitutionStudentResponse,
            InstitutionStudentCreateRequest
        >({
            query: (payload) => ({
                url: '/institution/students',
                method: 'POST',
                body: institutionStudentCreateRequestSchema.parse(payload),
            }),
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionStudentResponseSchema),
            invalidatesTags: ['InstitutionStudents', 'InstitutionGroups'],
        }),
        updateInstitutionStudent: builder.mutation<InstitutionStudentResponse, StudentMutationArgs>(
            {
                query: ({ studentId, payload, staff }) => ({
                    url: `${staff ? '/institution/staff' : '/institution'}/students/${encodeURIComponent(studentId)}`,
                    method: 'PATCH',
                    body: institutionStudentUpdateRequestSchema.parse(payload),
                }),
                transformResponse: (payload: unknown) =>
                    parseResponse(payload, institutionStudentResponseSchema),
                invalidatesTags: ['InstitutionStudents', 'InstitutionAttendance'],
            }
        ),
        updateInstitutionStudentGroups: builder.mutation<
            void,
            { studentId: string; groupIds: string[] }
        >({
            query: ({ studentId, groupIds }) => ({
                url: `/institution/students/${encodeURIComponent(studentId)}/groups`,
                method: 'PATCH',
                body: institutionStudentGroupMembershipUpdateRequestSchema.parse({
                    group_ids: groupIds,
                }),
            }),
            invalidatesTags: ['InstitutionStudents', 'InstitutionGroups'],
        }),
        archiveInstitutionStudent: builder.mutation<void, { studentId: string }>({
            query: ({ studentId }) => ({
                url: `/institution/students/${encodeURIComponent(studentId)}/archive`,
                method: 'POST',
                body: institutionStudentArchiveRequestSchema.parse({}),
            }),
            invalidatesTags: ['InstitutionStudents', 'InstitutionAttendance'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetInstitutionStudentsQuery,
    useGetInstitutionGroupStudentsQuery,
    useGetStaffGroupStudentsQuery,
    useCreateInstitutionStudentMutation,
    useUpdateInstitutionStudentMutation,
    useUpdateInstitutionStudentGroupsMutation,
    useArchiveInstitutionStudentMutation,
} = institutionStudentsApi;

export type {
    GroupStudentsArgs,
    InstitutionStudentCreateRequest,
    InstitutionStudentListResponse,
    InstitutionStudentResponse,
    InstitutionStudentUpdateRequest,
};
