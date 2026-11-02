import { apiSlice } from '@/api/api-slice';
import type {
    LegalEntityCreateRequest,
    LegalEntityCreateResponse,
    LegalEntityDirectoryResponse,
} from '@erp/shared';

export const ownerApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLegalEntities: builder.query<LegalEntityDirectoryResponse, void>({
            query: () => '/owner/legal-entities',
        }),
        createLegalEntity: builder.mutation<LegalEntityCreateResponse, LegalEntityCreateRequest>({
            query: (payload) => ({
                url: '/owner/legal-entities',
                method: 'POST',
                body: payload,
            }),
        }),
    }),
});

export const { useGetLegalEntitiesQuery, useCreateLegalEntityMutation } = ownerApiSlice;
