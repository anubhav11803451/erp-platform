import { Fragment, useEffect, useRef } from 'react';
import { Outlet } from 'react-router';
import { useRefreshMutation } from '@/features/auth/auth-api-slice';
import { Loader } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

/**
 * This is the root layout shell for the entire app.
 * Its primary job is to handle the "silent refresh" on page load.
 */
function App() {
    // We use a ref to prevent StrictMode from running the refresh twice.
    const refreshCalled = useRef(false);

    const [refresh, { isLoading }] = useRefreshMutation();

    useEffect(() => {
        // Only call refresh if the ref is false
        if (!refreshCalled.current) {
            refreshCalled.current = true; // Set it to true immediately
            refresh();
        }
    }, [refresh]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Loader className="text-primary size-4 animate-spin" />
            </div>
        );
    }

    // Once loading is false, the auth state is either set or not.
    // The (app)/_layout.tsx will handle redirecting to /login if not auth'd.
    return (
        <Fragment>
            <Outlet />
            <Toaster position="top-right" hotkey={['meta', 'k']} />
        </Fragment>
    );
}

export default App;
