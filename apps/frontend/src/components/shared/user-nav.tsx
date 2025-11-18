import { Link } from 'react-router';

import { LayoutDashboard, LogOut, User2Icon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GuestNav } from './guest-nav';
import { useAuth } from '@/hooks/use-auth';
import { Flex } from '../ui/flex';
import { Typography } from '../ui/typography';

/**
 * A shared component that displays the user's avatar and a dropdown menu
 * for account actions like viewing the dashboard or logging out.
 */
export function UserNav() {
    const { isAuthenticated, authUser, handleLogout } = useAuth();

    const user = authUser;

    // Helper to get initials from name
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    if (!isAuthenticated || !user) {
        return <GuestNav />; // Should not happen on protected routes, but good practice
    }

    return (
        <Flex alignItems="center" className="ml-auto space-x-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage
                                // src={user?.avatarUrl || ''}
                                src="https://github.com/shadcn.png"
                                alt={user?.first_name || 'User'}
                            />
                            <AvatarFallback>
                                {user ? getInitials(user.first_name, user.last_name) : 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <Flex direction="column" className="space-y-1">
                            <Typography variant="small">
                                {user?.first_name} {user?.last_name}
                            </Typography>
                            <Typography variant="tiny">{user?.email}</Typography>
                        </Flex>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link to="/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link to="/account">
                            <User2Icon className="mr-2 h-4 w-4" />
                            <span>Account</span>
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
