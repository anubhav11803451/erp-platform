import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useLoginMutation, useLogoutMutation } from '@/features/auth/auth-api-slice';
import {
    logOut,
    selectCurrentAccount,
    selectIsAuthenticated,
    selectIsAuthLoading,
} from '@/features/auth/auth-slice';
import { getApiErrorMessage } from '@/lib/utils';
import type { PlatformOwnerSignInPayload } from '@erp/shared';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export function useAuth() {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAuthLoading = useAppSelector(selectIsAuthLoading);
    const authUser = useAppSelector(selectCurrentAccount);
    const navigate = useNavigate();

    const [signIn, { isLoading: isSigningIn }] = useLoginMutation();
    const [logout, { isLoading: isSigningOut }] = useLogoutMutation();

    async function handleSignIn(values: PlatformOwnerSignInPayload) {
        try {
            await signIn(values).unwrap();
            navigate('/owner', { replace: true });
        } catch (error: unknown) {
            throw new Error(
                getApiErrorMessage(error, 'Unable to sign in. Check your details and try again.')
            );
        }
    }

    async function handleLogout() {
        try {
            await logout().unwrap();
            toast.success('You have been signed out.');
        } catch (error: unknown) {
            dispatch(logOut());
            toast.error(getApiErrorMessage(error, 'Your local session has been cleared.'));
        } finally {
            navigate('/signin', { replace: true });
        }
    }

    return {
        isAuthenticated,
        isAuthLoading,
        authUser,
        signIn: { isSigningIn, handleSignIn },
        isSigningOut,
        handleLogout,
    };
}
