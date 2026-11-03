import { Fragment, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { AuthLoading } from '@/features/auth/auth-loading';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useBootstrapCsrfMutation, useRefreshMutation } from '@/features/auth/auth-api-slice';
import { logOut, selectCsrfToken, selectIsAuthLoading } from '@/features/auth/auth-slice';
import { useLocation } from 'react-router';
import { RouteErrorBoundary } from '@/components/shared/route-error-boundary';

export function ErrorBoundary() {
    return <RouteErrorBoundary />;
}

const invitationAwarePaths = new Set(['/invite/admin']);

export default function App() {
    const refreshCalled = useRef(false);
    const csrfBootstrapCalled = useRef(false);
    const dispatch = useAppDispatch();
    const isAuthLoading = useAppSelector(selectIsAuthLoading);
    const csrfToken = useAppSelector(selectCsrfToken);
    const [csrfBootstrapReady, setCsrfBootstrapReady] = useState(false);
    const [bootstrapCsrf] = useBootstrapCsrfMutation();
    const [refresh] = useRefreshMutation();
    const { pathname } = useLocation();
    const isInvitationAwarePath = invitationAwarePaths.has(pathname);

    useEffect(() => {
        if (csrfBootstrapCalled.current) {
            return;
        }

        csrfBootstrapCalled.current = true;
        void bootstrapCsrf()
            .unwrap()
            .then(() => setCsrfBootstrapReady(true))
            .catch(() => dispatch(logOut()));
    }, [bootstrapCsrf, dispatch]);

    useEffect(() => {
        if (!csrfBootstrapReady || !csrfToken || isInvitationAwarePath || refreshCalled.current) {
            return;
        }

        refreshCalled.current = true;
        void refresh();
    }, [csrfBootstrapReady, csrfToken, isInvitationAwarePath, refresh]);

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
