import { apiSlice } from '@/api/api-slice';
import {
    institutionProfileResponseSchema,
    institutionProfileUpdateRequestSchema,
    type InstitutionProfileResponse,
    type InstitutionProfileUpdateRequest,
} from '@erp/shared';
import { parseResponse } from '@/lib/utils/api-response';

export const institutionProfileApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInstitutionProfile: builder.query<InstitutionProfileResponse, void>({
            query: () => '/institution/profile',
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionProfileResponseSchema),
            providesTags: ['InstitutionProfile'],
        }),
        updateInstitutionProfile: builder.mutation<
            InstitutionProfileResponse,
            InstitutionProfileUpdateRequest
        >({
            query: (payload) => ({
                url: '/institution/profile',
                method: 'PATCH',
                body: institutionProfileUpdateRequestSchema.parse(payload),
            }),
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionProfileResponseSchema),
            invalidatesTags: ['InstitutionProfile'],
        }),
    }),
    overrideExisting: false,
});

export const { useGetInstitutionProfileQuery, useUpdateInstitutionProfileMutation } =
    institutionProfileApi;
