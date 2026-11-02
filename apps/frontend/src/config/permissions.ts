// config/permissions.ts
import type { AccountIdentityResponse } from '@erp/shared';
import { Building2, LayoutDashboard } from 'lucide-react';

export type AppRole = AccountIdentityResponse['identity_kind'];

export type Permission = {
    href: string;
    label: string;
    icon: React.ElementType;
    allowedRoles: AppRole[];
    exact?: boolean; // optional: for strict route match
};

export const NAV_ITEMS: Permission[] = [
    {
        href: '/owner',
        label: 'Platform workspace',
        icon: LayoutDashboard,
        allowedRoles: ['PLATFORM_OWNER'],
    },
    {
        href: '/institution',
        label: 'Institution workspace',
        icon: Building2,
        allowedRoles: ['INSTITUTION_ADMIN'],
    },
];

export const FEATURE_GROUPS = {
    STUDENT: ['ADD', 'EDIT', 'DELETE', 'ENROLL', 'DISENROLL'],
    BATCH: ['ADD', 'EDIT', 'DELETE', 'ASSIGN'],
    PAYMENT: ['ADD', 'REFUND'],
    ATTENDANCE: ['MARK', 'VIEW'],
    PLATFORM: ['SETUP'],
    INSTITUTION: ['ACCESS'],
} as const;

type FeatureGroups = typeof FEATURE_GROUPS;
export type FeatureKey = `${keyof FeatureGroups}.${FeatureGroups[keyof FeatureGroups][number]}`;

type RolePermissionMap = Record<AppRole, FeatureKey[]>;

export const ROLE_PERMISSIONS: RolePermissionMap = {
    UNASSIGNED: [],
    PLATFORM_OWNER: ['PLATFORM.SETUP'],
    INSTITUTION_ADMIN: ['INSTITUTION.ACCESS'],
};

const appRoles: AppRole[] = ['UNASSIGNED', 'PLATFORM_OWNER', 'INSTITUTION_ADMIN'];

export const FEATURE_PERMISSIONS = appRoles.reduce<Partial<Record<FeatureKey, AppRole[]>>>(
    (permissions, role) => {
        const features = ROLE_PERMISSIONS[role];
        for (const feature of features) {
            (permissions[feature] ??= []).push(role);
        }
        return permissions;
    },
    {}
);
