import { Fragment, useEffect, useRef } from 'react';
import { Outlet } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { AuthLoading } from '@/features/auth/auth-loading';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useRefreshMutation } from '@/features/auth/auth-api-slice';
import { logOut, selectIsAuthLoading } from '@/features/auth/auth-slice';
import { CSRF_TOKEN_COOKIE_NAME } from '@/lib/constants';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router';
import { RouteErrorBoundary } from '@/components/shared/route-error-boundary';

export function ErrorBoundary() {
    return <RouteErrorBoundary />;
}

const invitationAwarePaths = new Set(['/invite/admin']);

export default function App() {
    const refreshCalled = useRef(false);
    const dispatch = useAppDispatch();
    const isAuthLoading = useAppSelector(selectIsAuthLoading);
    const [refresh] = useRefreshMutation();
    const { pathname } = useLocation();
    const isInvitationAwarePath = invitationAwarePaths.has(pathname);

    useEffect(() => {
        if (isInvitationAwarePath) {
            return;
        }

        if (!refreshCalled.current) {
            refreshCalled.current = true;
            if (Cookies.get(CSRF_TOKEN_COOKIE_NAME)) {
                void refresh();
            } else {
                dispatch(logOut());
            }
        }
    }, [dispatch, isInvitationAwarePath, pathname, refresh]);

    if (isAuthLoading && !isInvitationAwarePath) {
        return <AuthLoading />;
    }

    return (
        <Fragment>
            <Outlet />
            <Toaster position="top-right" hotkey={['meta', 'k']} />
        </Fragment>
    );
}
