import { useAppSelector } from '@/app/hooks';
import { useLoginMutation, useLogoutMutation } from '@/features/auth/auth-api-slice';
import {
    selectCurrentAccount,
    selectIsAuthenticated,
    selectIsAuthLoading,
} from '@/features/auth/auth-slice';
import { getApiErrorMessage } from '@/lib/utils';
import type { SignInPayload } from '@erp/shared';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { workspacePathForRole } from '@/lib/utils/workspace-path';

export function useAuth() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAuthLoading = useAppSelector(selectIsAuthLoading);
    const authUser = useAppSelector(selectCurrentAccount);
    const navigate = useNavigate();

    const [signIn, { isLoading: isSigningIn }] = useLoginMutation();
    const [logout, { isLoading: isSigningOut }] = useLogoutMutation();

    async function handleSignIn(values: Pick<SignInPayload, 'email' | 'password'>) {
        try {
            const session = await signIn({ ...values, intent: 'WORKSPACE' }).unwrap();
            navigate(workspacePathForRole(session.identity.identity_kind), { replace: true });
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
