import { logOut, selectCurrentUser, setCredentials } from '@/features/auth/auth-slice';
import { resetOwnerSetupState } from '@/features/owner/owner-setup-slice';
import { resetGroupsUi } from '@/features/institution/groups/groups-ui-slice';
import { resetStudentsUi } from '@/features/institution/students/students-ui-slice';
import { resetTeamUi } from '@/features/institution/team/team-ui-slice';
import type { WorkspaceIdentityResponse } from '@erp/shared';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import type { RootState } from './root-reducer';
import { apiSlice } from '@/api/api-slice';

function identityKey(identity: WorkspaceIdentityResponse | null): string | null {
    if (!identity) {
        return null;
    }

    return [
        identity.identity_kind,
        identity.account.id,
        identity.identity_kind === 'INSTITUTION_ADMIN' ||
        identity.identity_kind === 'INSTITUTION_STAFF'
            ? identity.institution.id
            : '',
    ].join(':');
}

export const authCacheListener = createListenerMiddleware<RootState>();

authCacheListener.startListening({
    matcher: isAnyOf(setCredentials, logOut),
    effect: (_action, listenerApi) => {
        const previousIdentity = selectCurrentUser(listenerApi.getOriginalState());
        const nextIdentity = selectCurrentUser(listenerApi.getState());
        if (identityKey(previousIdentity) !== identityKey(nextIdentity)) {
            listenerApi.dispatch(apiSlice.util.resetApiState());
            listenerApi.dispatch(resetOwnerSetupState());
            listenerApi.dispatch(resetGroupsUi());
            listenerApi.dispatch(resetStudentsUi());
            listenerApi.dispatch(resetTeamUi());
        }
    },
});
