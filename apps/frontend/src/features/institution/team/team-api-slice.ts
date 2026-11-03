import { apiSlice } from '@/api/api-slice';
import {
    institutionStaffGroupAssignmentUpdateRequestSchema,
    institutionStaffInvitationListResponseSchema,
    institutionStaffInvitationRevokeRequestSchema,
    institutionStaffListResponseSchema,
    institutionStaffRevokeRequestSchema,
    type InstitutionStaffInvitationListResponse,
    type InstitutionStaffListResponse,
} from '@erp/shared';
import { parseResponse } from '@/lib/utils/api-response';

type StaffActionArgs = { accountId: string };
type StaffGroupsArgs = StaffActionArgs & { groupIds: string[] };
type InvitationActionArgs = { invitationId: string };

export const institutionTeamApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInstitutionStaffInvitations: builder.query<InstitutionStaffInvitationListResponse, void>(
            {
                query: () => '/institution/staff/invitations',
                transformResponse: (payload: unknown) =>
                    parseResponse(payload, institutionStaffInvitationListResponseSchema),
                providesTags: ['InstitutionTeam'],
            }
        ),
        revokeInstitutionStaffInvitation: builder.mutation<void, InvitationActionArgs>({
            query: ({ invitationId }) => ({
                url: `/institution/staff/invitations/${encodeURIComponent(invitationId)}/revoke`,
                method: 'POST',
                body: institutionStaffInvitationRevokeRequestSchema.parse({}),
            }),
            invalidatesTags: ['InstitutionTeam'],
        }),
        getInstitutionStaffMembers: builder.query<InstitutionStaffListResponse, void>({
            query: () => '/institution/staff/members',
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionStaffListResponseSchema),
            providesTags: ['InstitutionTeam'],
        }),
        updateInstitutionStaffGroups: builder.mutation<void, StaffGroupsArgs>({
            query: ({ accountId, groupIds }) => ({
                url: `/institution/staff/members/${encodeURIComponent(accountId)}/groups`,
                method: 'PATCH',
                body: institutionStaffGroupAssignmentUpdateRequestSchema.parse({
                    group_ids: groupIds,
                }),
            }),
            invalidatesTags: ['InstitutionTeam'],
        }),
        revokeInstitutionStaffMember: builder.mutation<void, StaffActionArgs>({
            query: ({ accountId }) => ({
                url: `/institution/staff/members/${encodeURIComponent(accountId)}/revoke`,
                method: 'POST',
                body: institutionStaffRevokeRequestSchema.parse({}),
            }),
            invalidatesTags: ['InstitutionTeam'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetInstitutionStaffInvitationsQuery,
    useRevokeInstitutionStaffInvitationMutation,
    useGetInstitutionStaffMembersQuery,
    useUpdateInstitutionStaffGroupsMutation,
    useRevokeInstitutionStaffMemberMutation,
} = institutionTeamApi;

export type { InvitationActionArgs, StaffActionArgs, StaffGroupsArgs };
