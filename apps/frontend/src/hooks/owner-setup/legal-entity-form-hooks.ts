import type { LegalEntityCreateRequest } from '@erp/shared';
import {
    useCreateLegalEntityMutation,
    useGetLegalEntitiesQuery,
} from '@/features/owner/owner-api-slice';
import { closeOwnerSetupDialog, setOwnerSetupNotice } from '@/features/owner/owner-setup-slice';
import { useAppDispatch } from '@/app/hooks';
import { getApiErrorMessage } from '@/lib/utils';

export function useLegalEntityFormHooks() {
    const dispatch = useAppDispatch();
    const [createLegalEntity, mutation] = useCreateLegalEntityMutation();
    const { refetch } = useGetLegalEntitiesQuery();

    async function submitLegalEntity(payload: LegalEntityCreateRequest) {
        mutation.reset();
        const result = await createLegalEntity(payload);
        if ('error' in result) {
            return;
        }

        dispatch(setOwnerSetupNotice(`LegalEntity “${payload.name}” created.`));
        dispatch(closeOwnerSetupDialog());
        void refetch();
    }

    return {
        submitLegalEntity,
        isSaving: mutation.isLoading,
        error: mutation.error
            ? getApiErrorMessage(mutation.error, 'Please review the details and try again.')
            : '',
        clearError: mutation.reset,
    };
}
