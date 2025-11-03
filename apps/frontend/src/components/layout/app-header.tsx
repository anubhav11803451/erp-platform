import { UserNav } from '@/components/shared/user-nav';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Typography } from '../ui/typography';

export function AppHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b-2 px-4 md:px-6">
            {/* --- Mobile Navigation --- */}

            {/* --- Header Content (e.g., Breadcrumbs/Search can go here) --- */}
            <SidebarTrigger />
            <div className="flex-1 flex-row">
                <Typography variant="h4">ERP360</Typography>
            </div>

            {/* --- User Avatar --- */}
            <UserNav />
        </header>
    );
}
