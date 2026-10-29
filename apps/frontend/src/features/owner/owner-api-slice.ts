import { apiSlice } from '@/api/api-slice';
import type {
    InstitutionPairCreatePayload,
    InstitutionPairCreateResponse,
    LegalEntityListResponse,
} from '@erp/shared';

export const ownerApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLegalEntities: builder.query<LegalEntityListResponse, void>({
            query: () => '/owner/legal-entities',
        }),
        createInitialLegalEntityPair: builder.mutation<
            InstitutionPairCreateResponse,
            InstitutionPairCreatePayload
        >({
            query: (payload) => ({
                url: '/owner/legal-entities',
                method: 'POST',
                body: payload,
            }),
        }),
    }),
});

export const { useGetLegalEntitiesQuery, useCreateInitialLegalEntityPairMutation } = ownerApiSlice;
