import type { UserRole } from '@erp/shared';
import { ROLE_PERMISSIONS, type FeatureKey } from '@/config/permissions';

export const getFeatureCategory = (feature: FeatureKey) => feature.split('.')[0];
export const getFeatureAction = (feature: FeatureKey) => feature.split('.')[1];

export function canRoleAccessFeature(role: UserRole, feature: FeatureKey): boolean {
    return ROLE_PERMISSIONS[role]?.includes(feature) ?? false;
}

export function getRoleAvailableFeatures(role: UserRole): FeatureKey[] {
    return ROLE_PERMISSIONS[role] ?? [];
}
