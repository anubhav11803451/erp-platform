// config/permissions.ts
import { UserRole } from '@erp/shared';
import { LayoutDashboard, Users, BookMarked } from 'lucide-react';

export type Permission = {
    href: string;
    label: string;
    icon: React.ElementType;
    allowedRoles: UserRole[];
    exact?: boolean; // optional: for strict route match
};

// ✅ Single source of truth for all navigation items
export const NAV_ITEMS: Permission[] = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        allowedRoles: [UserRole.ADMIN, UserRole.STAFF],
    },
    {
        href: '/students',
        label: 'Students',
        icon: Users,
        allowedRoles: [UserRole.ADMIN, UserRole.STAFF],
    },
    {
        href: '/batches',
        label: 'Batches',
        icon: BookMarked,
        allowedRoles: [UserRole.ADMIN, UserRole.STAFF],
    },
    {
        href: '/users',
        label: 'Staffs (Tutors)',
        icon: Users,
        allowedRoles: [UserRole.ADMIN],
    },
    {
        href: '/attendance',
        label: 'Attendance',
        icon: BookMarked,
        allowedRoles: [UserRole.STAFF],
    },
];

// 1️⃣ Define grouped features
export const FEATURE_GROUPS = {
    STUDENT: ['ADD', 'EDIT', 'DELETE', 'ENROLL', 'DISENROLL'],
    BATCH: ['ADD', 'EDIT', 'DELETE', 'ASSIGN'],
    PAYMENT: ['ADD', 'REFUND'],
    ATTENDANCE: ['MARK', 'VIEW'],
} as const;

// ✅ Derive the literal union
type FeatureGroups = typeof FEATURE_GROUPS;

// Combine category and action → e.g. "STUDENT.ADD"
export type FeatureKey = `${keyof FeatureGroups}.${FeatureGroups[keyof FeatureGroups][number]}`;

type RolePermissionMap = {
    [key in UserRole]: FeatureKey[];
};

const BASE_ROLE_PERMISSIONS: RolePermissionMap = {
    [UserRole.ADMIN]: [
        'STUDENT.ADD',
        'STUDENT.EDIT',
        'STUDENT.DELETE',
        'BATCH.ADD',
        'BATCH.EDIT',
        'BATCH.DELETE',
        'PAYMENT.ADD',
        'ATTENDANCE.VIEW',
        'STUDENT.ENROLL',
        'STUDENT.DISENROLL',
    ],
    [UserRole.STAFF]: ['STUDENT.ENROLL', 'ATTENDANCE.MARK', 'ATTENDANCE.VIEW'],
};

// Role hierarchy definition
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
    [UserRole.ADMIN]: [UserRole.STAFF], // Admin inherits Staff + Manager
    [UserRole.STAFF]: [],
};

function getInheritedRoles(role: UserRole, visited = new Set<UserRole>()): UserRole[] {
    const direct = ROLE_HIERARCHY[role] ?? [];
    for (const r of direct) {
        if (!visited.has(r)) {
            visited.add(r);
            getInheritedRoles(r, visited).forEach((nested) => visited.add(nested));
        }
    }
    return [...visited];
}

function extendRolePermissions(base: RolePermissionMap): RolePermissionMap {
    const result = { ...base };

    for (const role of Object.values(UserRole)) {
        const inheritedRoles = getInheritedRoles(role);
        const inheritedPermissions = inheritedRoles.flatMap(
            (r) => base[r as keyof typeof base] ?? []
        );

        result[role] = [...new Set([...base[role], ...inheritedPermissions])];
    }

    return result;
}

// ✅ Generate final map with inheritance applied
export const ROLE_PERMISSIONS = extendRolePermissions(BASE_ROLE_PERMISSIONS);

// Reverse mapping
export const FEATURE_PERMISSIONS: Record<FeatureKey, UserRole[]> = (
    Object.values(UserRole) as UserRole[]
).reduce(
    (acc, role) => {
        const features = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
        for (const feature of features) {
            if (!acc[feature]) acc[feature] = [];
            acc[feature]!.push(role);
        }
        return acc;
    },
    {} as Record<FeatureKey, UserRole[]>
);
