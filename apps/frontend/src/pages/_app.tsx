import { Fragment, useEffect, useRef } from 'react';
import { Outlet } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { AuthLoading } from '@/features/auth/auth-loading';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useRefreshMutation } from '@/features/auth/auth-api-slice';
import { logOut, selectIsAuthLoading } from '@/features/auth/auth-slice';
import { CSRF_TOKEN_COOKIE_NAME } from '@/lib/constants';
import Cookies from 'js-cookie';

export default function App() {
    const refreshCalled = useRef(false);
    const dispatch = useAppDispatch();
    const isAuthLoading = useAppSelector(selectIsAuthLoading);
    const [refresh] = useRefreshMutation();

    useEffect(() => {
        if (!refreshCalled.current) {
            refreshCalled.current = true;
            if (Cookies.get(CSRF_TOKEN_COOKIE_NAME)) {
                void refresh();
            } else {
                dispatch(logOut());
            }
        }
    }, [dispatch, refresh]);

    if (isAuthLoading) {
        return <AuthLoading />;
    }

    return (
        <Fragment>
            <Outlet />
            <Toaster position="top-right" hotkey={['meta', 'k']} />
        </Fragment>
    );
}
