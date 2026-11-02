import { useMemo } from 'react';
import type { LegalEntityDirectoryGroup } from '@erp/shared';
import { useGetLegalEntitiesQuery } from '@/features/owner/owner-api-slice';
import {
    selectInstitutionCreationUnconfirmed,
    selectOwnerDirectoryFilter,
} from '@/features/owner/owner-setup-slice';
import { useAppSelector } from '@/app/hooks';

export type FilteredLegalEntityDirectoryGroup = LegalEntityDirectoryGroup & {
    visibleInstitutions: LegalEntityDirectoryGroup['institutions'];
};

export function useOwnerDirectoryHooks() {
    const directoryFilter = useAppSelector(selectOwnerDirectoryFilter);
    const institutionUnconfirmed = useAppSelector(selectInstitutionCreationUnconfirmed);
    const query = useGetLegalEntitiesQuery();
    const normalizedFilter = directoryFilter.trim().toLowerCase();
    const filteredLegalEntities = useMemo(
        () =>
            (query.data?.legal_entities ?? []).flatMap((legalEntity) => {
                const legalEntityMatches =
                    legalEntity.name.toLowerCase().includes(normalizedFilter) ||
                    (legalEntity.code?.toLowerCase().includes(normalizedFilter) ?? false);
                const matchingInstitutions = legalEntity.institutions.filter(
                    (institution) =>
                        institution.name.toLowerCase().includes(normalizedFilter) ||
                        (institution.code?.toLowerCase().includes(normalizedFilter) ?? false)
                );

                if (!normalizedFilter || legalEntityMatches) {
                    return [{ ...legalEntity, visibleInstitutions: legalEntity.institutions }];
                }
                if (matchingInstitutions.length) {
                    return [{ ...legalEntity, visibleInstitutions: matchingInstitutions }];
                }
                return [];
            }),
        [normalizedFilter, query.data?.legal_entities]
    );

    return {
        ...query,
        filteredLegalEntities,
        normalizedFilter,
        institutionUnconfirmed,
    };
}
