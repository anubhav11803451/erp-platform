import { useRoleAccess } from './use-role-access';
import type { FeatureKey } from '@/config/permissions';
import { canRoleAccessFeature, getRoleAvailableFeatures } from '@/lib/utils';

export function useFeatureAccess() {
    const { role } = useRoleAccess();

    const canAccess = (feature: FeatureKey) => canRoleAccessFeature(role, feature);
    const availableFeatures = getRoleAvailableFeatures(role);

    const groupedFeatures = availableFeatures.reduce<Record<string, FeatureKey[]>>(
        (acc, feature) => {
            const [category] = feature.split('.') as [string, string];
            (acc[category] ??= []).push(feature);
            return acc;
        },
        {}
    );

    return { canAccess, availableFeatures, groupedFeatures };
}
