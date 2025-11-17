// utils/current-user-access.ts
import { store } from '@/app/store';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import { canRoleAccessFeature, getRoleAvailableFeatures } from './feature-access';
import type { FeatureKey } from '@/config/permissions';
import { UserRole } from '@erp/shared';

export function getCurrentUserRole(): UserRole {
    const state = store.getState();
    const user = selectCurrentUser(state);
    return user?.role ?? UserRole.STAFF; // fallback
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
