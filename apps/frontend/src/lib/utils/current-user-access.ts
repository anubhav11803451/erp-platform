// utils/current-user-access.ts
import { store } from '@/app/store';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import { canRoleAccessFeature, getRoleAvailableFeatures } from './feature-access';
import type { AppRole, FeatureKey } from '@/config/permissions';

export function getCurrentUserRole(): AppRole | null {
    const state = store.getState();
    const user = selectCurrentUser(state);
    return user?.identity_kind ?? null;
}

export function canCurrentUserAccess(feature: FeatureKey): boolean {
    const role = getCurrentUserRole();
    return canRoleAccessFeature(role, feature);
}

export function getCurrentUserAvailableFeatures(): FeatureKey[] {
    const role = getCurrentUserRole();
    return getRoleAvailableFeatures(role);
}

export function canCurrentUserAccessFeature(feature: FeatureKey): boolean {
    const role = getCurrentUserRole();
    return canRoleAccessFeature(role, feature);
}
