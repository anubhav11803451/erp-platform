import {
    InstitutionOverviewPage,
    institutionOverviewHandle,
} from '@/features/institution/overview/overview-page';
import { WorkspaceGate } from '@/components/shared/workspace-gate';

// Route metadata is exported for the file-route lazy module.
// eslint-disable-next-line react-refresh/only-export-components
export const handle = institutionOverviewHandle;

export default function InstitutionHomePage() {
    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_ADMIN']}>
            <InstitutionOverviewPage />
        </WorkspaceGate>
    );
}
