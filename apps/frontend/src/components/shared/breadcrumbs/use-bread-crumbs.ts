import { useLocation, useParams } from 'react-router';
import { useGetBatchQuery } from '@/features/batches/batches-api-slice';
import { useGetStudentQuery } from '@/features/students/student-api-slice';

export type BreadcrumbItem = {
    label: string;
    href: string;
};

// A mapping of static paths to their breadcrumb labels
const staticPaths: Record<string, string> = {
    students: 'Students',
    batches: 'Batches',
    users: 'Staff',
    attendance: 'Attendance',
};

export function useBreadcrumbs() {
    const { pathname } = useLocation();
    const params = useParams();

    const crumbs: BreadcrumbItem[] = [];

    const parts = pathname.split('/').filter(Boolean);

    // --- API Hooks for Dynamic Segments ---
    // We call these hooks conditionally based on the path.
    const { data: batch, isLoading: isLoadingBatch } = useGetBatchQuery(params.id || '', {
        skip: !params.id || !pathname.includes('/batches/'),
    });
    const { data: student, isLoading: isLoadingStudent } = useGetStudentQuery(params.id || '', {
        skip: !params.id || !pathname.includes('/students/'),
    });
    // --- (Add more for other dynamic routes later) ---

    // Build the breadcrumb path segment by segment
    let currentPath = '';
    for (const part of parts) {
        currentPath += `/${part}`;
        let label = '';

        if (staticPaths[part]) {
            // It's a static path like /students
            label = staticPaths[part];
        } else if (params.id === part) {
            // It's a dynamic path like /batches/[id]
            if (pathname.includes('/batches/')) {
                label = isLoadingBatch ? 'Loading...' : batch?.name || 'Details';
            } else if (pathname.includes('/students/')) {
                label = isLoadingStudent
                    ? 'Loading...'
                    : // eslint-disable-next-line no-constant-binary-expression
                      `${student?.first_name} ${student?.last_name}` || 'Details';
            }
            // (Add more dynamic types here)
        }

        if (label) {
            crumbs.push({ label, href: currentPath });
        }
    }

    return crumbs;
}
