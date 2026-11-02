import { ROLE_PERMISSIONS, type AppRole, type FeatureKey } from '@/config/permissions';

export const getFeatureCategory = (feature: FeatureKey) => feature.split('.')[0];
export const getFeatureAction = (feature: FeatureKey) => feature.split('.')[1];

export function canRoleAccessFeature(role: AppRole | null, feature: FeatureKey): boolean {
    return role ? ROLE_PERMISSIONS[role].includes(feature) : false;
}

export function getRoleAvailableFeatures(role: AppRole | null): FeatureKey[] {
    return role ? ROLE_PERMISSIONS[role] : [];
}
