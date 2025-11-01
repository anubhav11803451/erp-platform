import { Link } from 'react-router';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';

export const GuestNav = () => (
    <div className="ml-auto flex items-center space-x-4">
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/signin">Sign In</Link>
        </Button>
        <Button asChild className="shadow-sm">
            <Link to="/demo">
                Request a Demo <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
    </div>
);
