import { Link } from 'react-router';

import { Building2, LayoutDashboard, LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GuestNav } from './guest-nav';
import { useAuth } from '@/hooks/use-auth';
import { useRoleAccess } from '@/hooks/use-role-access';
import { Flex } from '../ui/flex';
import { Typography } from '../ui/typography';

/**
 * A shared component that displays the user's avatar and a dropdown menu
 * for account actions like viewing the dashboard or logging out.
 */
export function UserNav() {
    const { isAuthenticated, authUser, handleLogout } = useAuth();
    const { user, isPlatformOwner } = useRoleAccess();

    if (!isAuthenticated) {
        return <GuestNav />; // Should not happen on protected routes, but good practice
    }

    const isInstitutionAdmin = user?.identity_kind === 'INSTITUTION_ADMIN';
    const displayName = authUser?.email ?? (isInstitutionAdmin ? user.institution.name : 'Account');
    const roleLabel = isPlatformOwner
        ? 'Platform Owner'
        : isInstitutionAdmin
          ? 'Institution Admin'
          : 'Account';
    const homePath = isPlatformOwner ? '/owner' : '/institution';
    const avatarInitial = displayName.charAt(0).toUpperCase();

    return (
        <Flex alignItems="center" className="ml-auto space-x-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>{avatarInitial}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <Flex direction="column" className="space-y-1">
                            <Typography variant="small">{roleLabel}</Typography>
                            <Typography variant="tiny">{displayName}</Typography>
                        </Flex>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link to={homePath}>
                            {isPlatformOwner ? (
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                            ) : (
                                <Building2 className="mr-2 h-4 w-4" />
                            )}
                            <span>
                                {isPlatformOwner ? 'Platform workspace' : 'Institution workspace'}
                            </span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} variant="destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Flex>
    );
}
