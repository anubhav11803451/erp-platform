import { apiSlice } from '@/api/api-slice';
import {
    institutionGroupArchiveRequestSchema,
    institutionGroupCreateRequestSchema,
    institutionGroupListResponseSchema,
    institutionGroupResponseSchema,
    institutionGroupUpdateRequestSchema,
    type InstitutionGroupCreateRequest,
    type InstitutionGroupListResponse,
    type InstitutionGroupResponse,
    type InstitutionGroupUpdateRequest,
} from '@erp/shared';
import { parseResponse } from '@/lib/utils/api-response';

type GroupMutationArgs = { groupId: string; payload: InstitutionGroupUpdateRequest };
type GroupActionArgs = { groupId: string };

export const institutionGroupsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInstitutionGroups: builder.query<InstitutionGroupListResponse, void>({
            query: () => '/institution/groups',
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionGroupListResponseSchema),
            providesTags: ['InstitutionGroups'],
        }),
        getStaffGroups: builder.query<InstitutionGroupListResponse, void>({
            query: () => '/institution/staff/groups',
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionGroupListResponseSchema),
            providesTags: ['InstitutionGroups'],
            keepUnusedDataFor: 0,
        }),
        createInstitutionGroup: builder.mutation<
            InstitutionGroupResponse,
            InstitutionGroupCreateRequest
        >({
            query: (payload) => ({
                url: '/institution/groups',
                method: 'POST',
                body: institutionGroupCreateRequestSchema.parse(payload),
            }),
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionGroupResponseSchema),
            invalidatesTags: ['InstitutionGroups'],
        }),
        updateInstitutionGroup: builder.mutation<InstitutionGroupResponse, GroupMutationArgs>({
            query: ({ groupId, payload }) => ({
                url: `/institution/groups/${encodeURIComponent(groupId)}`,
                method: 'PATCH',
                body: institutionGroupUpdateRequestSchema.parse(payload),
            }),
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionGroupResponseSchema),
            invalidatesTags: ['InstitutionGroups'],
        }),
        archiveInstitutionGroup: builder.mutation<void, GroupActionArgs>({
            query: ({ groupId }) => ({
                url: `/institution/groups/${encodeURIComponent(groupId)}/archive`,
                method: 'POST',
                body: institutionGroupArchiveRequestSchema.parse({}),
            }),
            invalidatesTags: ['InstitutionGroups', 'InstitutionStudents'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetInstitutionGroupsQuery,
    useGetStaffGroupsQuery,
    useCreateInstitutionGroupMutation,
    useUpdateInstitutionGroupMutation,
    useArchiveInstitutionGroupMutation,
} = institutionGroupsApi;

export type {
    GroupActionArgs,
    InstitutionGroupCreateRequest,
    InstitutionGroupListResponse,
    InstitutionGroupResponse,
    InstitutionGroupUpdateRequest,
};
