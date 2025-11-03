import { UserNav } from '@/components/shared/user-nav';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Typography } from '../ui/typography';
import { ThemeSelector } from '../themes/theme-selector';
import { ModeToggle } from '../themes/theme-toggle';

export function AppHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b-2 px-4 md:px-6">
            {/* --- Mobile Navigation --- */}

            {/* --- Header Content (e.g., Breadcrumbs/Search can go here) --- */}
            <SidebarTrigger />
            <div className="flex-1 flex-row">
                <Typography variant="h4">ERP360</Typography>
            </div>
            <ThemeSelector className="mr-4 hidden md:flex" />
            <ModeToggle className="hidden md:flex" />
            {/* --- User Avatar --- */}
            <UserNav />
        </header>
    );
}
