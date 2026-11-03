// config/permissions.ts
import type { AccountIdentityResponse } from '@erp/shared';
import {
    BookOpenCheck,
    Building2,
    CalendarCheck2,
    ClipboardList,
    LayoutDashboard,
    Users,
} from 'lucide-react';

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
        label: 'Overview',
        icon: Building2,
        allowedRoles: ['INSTITUTION_ADMIN'],
        exact: true,
    },
    {
        href: '/institution/groups',
        label: 'Groups',
        icon: Users,
        allowedRoles: ['INSTITUTION_ADMIN'],
    },
    {
        href: '/institution/students',
        label: 'Students',
        icon: ClipboardList,
        allowedRoles: ['INSTITUTION_ADMIN'],
    },
    {
        href: '/institution/attendance',
        label: 'Attendance',
        icon: CalendarCheck2,
        allowedRoles: ['INSTITUTION_ADMIN'],
    },
    {
        href: '/institution/team',
        label: 'Team',
        icon: Users,
        allowedRoles: ['INSTITUTION_ADMIN'],
    },
    {
        href: '/institution/profile',
        label: 'Institution profile',
        icon: Building2,
        allowedRoles: ['INSTITUTION_ADMIN'],
    },
    {
        href: '/staff',
        label: 'My groups',
        icon: BookOpenCheck,
        allowedRoles: ['INSTITUTION_STAFF'],
        exact: true,
    },
    {
        href: '/staff/students',
        label: 'Students',
        icon: ClipboardList,
        allowedRoles: ['INSTITUTION_STAFF'],
    },
    {
        href: '/staff/attendance',
        label: 'Attendance',
        icon: CalendarCheck2,
        allowedRoles: ['INSTITUTION_STAFF'],
    },
];

export const FEATURE_GROUPS = {
    STUDENT: ['ADD', 'EDIT', 'DELETE', 'ENROLL', 'DISENROLL', 'VIEW'],
    BATCH: ['ADD', 'EDIT', 'DELETE', 'ASSIGN'],
    PAYMENT: ['ADD', 'REFUND'],
    ATTENDANCE: ['MARK', 'VIEW'],
    PLATFORM: ['SETUP'],
    INSTITUTION: ['ACCESS', 'MANAGE', 'TEAM', 'PROFILE'],
} as const;

type FeatureGroups = typeof FEATURE_GROUPS;
export type FeatureKey = `${keyof FeatureGroups}.${FeatureGroups[keyof FeatureGroups][number]}`;

type RolePermissionMap = Record<AppRole, FeatureKey[]>;

export const ROLE_PERMISSIONS: RolePermissionMap = {
    UNASSIGNED: [],
    PLATFORM_OWNER: ['PLATFORM.SETUP'],
    INSTITUTION_ADMIN: [
        'INSTITUTION.ACCESS',
        'INSTITUTION.MANAGE',
        'INSTITUTION.TEAM',
        'INSTITUTION.PROFILE',
        'STUDENT.VIEW',
        'STUDENT.ADD',
        'STUDENT.EDIT',
        'STUDENT.DELETE',
        'STUDENT.ENROLL',
        'STUDENT.DISENROLL',
        'ATTENDANCE.MARK',
        'ATTENDANCE.VIEW',
    ],
    INSTITUTION_STAFF: ['STUDENT.VIEW', 'STUDENT.EDIT', 'ATTENDANCE.MARK', 'ATTENDANCE.VIEW'],
};

const appRoles: AppRole[] = [
    'UNASSIGNED',
    'PLATFORM_OWNER',
    'INSTITUTION_ADMIN',
    'INSTITUTION_STAFF',
];

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
