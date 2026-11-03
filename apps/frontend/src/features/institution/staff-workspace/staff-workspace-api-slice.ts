import { apiSlice } from '@/api/api-slice';
import {
    institutionStaffContextResponseSchema,
    type InstitutionStaffContextResponse,
} from '@erp/shared';
import { parseResponse } from '@/lib/utils/api-response';

export const institutionStaffWorkspaceApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInstitutionStaffContext: builder.query<InstitutionStaffContextResponse, void>({
            query: () => '/institution/staff/context',
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionStaffContextResponseSchema),
            keepUnusedDataFor: 0,
        }),
    }),
    overrideExisting: false,
});

export const { useGetInstitutionStaffContextQuery } = institutionStaffWorkspaceApi;
