import { Link } from 'react-router';

import { LayoutDashboard, LogOut } from 'lucide-react';
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
        <div className="ml-auto flex items-center space-x-4">
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
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm leading-none font-medium">
                                {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-muted-foreground text-xs leading-none">
                                {user?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link to="/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
