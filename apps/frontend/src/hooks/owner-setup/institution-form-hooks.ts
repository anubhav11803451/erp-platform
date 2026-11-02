import type { InstitutionAdminInvitationCreateRequest } from '@erp/shared';
import { institutionAdminInvitationCreateRequestSchema } from '@erp/shared';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectAccessToken } from '@/features/auth/auth-slice';
import { useGetLegalEntitiesQuery } from '@/features/owner/owner-api-slice';
import { createInstitutionAndIssueInvitationOnce } from '@/features/owner/owner-invitation-api-slice';
import {
    closeOwnerSetupDialog,
    selectOwnerSetupDialog,
    selectSelectedLegalEntityId,
    setInstitutionCreationUnconfirmed,
    setOwnerSetupNotice,
} from '@/features/owner/owner-setup-slice';

export function useInstitutionFormHooks() {
    const dispatch = useAppDispatch();
    const accessToken = useAppSelector(selectAccessToken);
    const dialog = useAppSelector(selectOwnerSetupDialog);
    const selectedLegalEntityId = useAppSelector(selectSelectedLegalEntityId);
    const { data, refetch } = useGetLegalEntitiesQuery();
    const legalEntity =
        data?.legal_entities.find((item) => item.id === selectedLegalEntityId) ?? null;

    async function createInstitution(values: InstitutionAdminInvitationCreateRequest) {
        if (!legalEntity) {
            throw new Error('Select a LegalEntity before creating an Institution.');
        }
        const parsed = institutionAdminInvitationCreateRequestSchema.safeParse(values);
        if (!parsed.success) {
            throw new Error('Check the Institution and invitation details.');
        }

        return createInstitutionAndIssueInvitationOnce(legalEntity.id, parsed.data, accessToken);
    }

    async function refreshBeforeRetry() {
        try {
            await refetch().unwrap();
            dispatch(setInstitutionCreationUnconfirmed(false));
            return true;
        } catch {
            return false;
        }
    }

    function closeDialog() {
        dispatch(closeOwnerSetupDialog());
    }

    function markCreationUnconfirmed() {
        dispatch(setInstitutionCreationUnconfirmed(true));
    }

    function markCreated(institutionName: string) {
        dispatch(setInstitutionCreationUnconfirmed(false));
        dispatch(
            setOwnerSetupNotice(
                `Institution “${institutionName}” and its Admin invitation were created.`
            )
        );
        closeDialog();
        void refetch();
    }

    return {
        dialogOpen: dialog === 'institution' && Boolean(legalEntity),
        legalEntity,
        closeDialog,
        createInstitution,
        refreshBeforeRetry,
        markCreationUnconfirmed,
        markCreated,
    };
}
