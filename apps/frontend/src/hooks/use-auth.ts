import { useAppSelector } from '@/app/hooks';
import {
    useLoginMutation,
    useLogoutMutation,
    type Credentials,
} from '@/features/auth/auth-api-slice';
import {
    selectCurrentUser,
    selectIsAuthenticated,
    selectIsAuthLoading,
} from '@/features/auth/auth-slice';
import { getApiErrorMessage } from '@/lib/utils';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export function useAuth() {
    // const dispatch = useAppDispatch();

    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAuthLoading = useAppSelector(selectIsAuthLoading);
    const authUser = useAppSelector(selectCurrentUser);

    const navigate = useNavigate();

    const [signIn, { isLoading: isSigningIn }] = useLoginMutation();
    const [logout] = useLogoutMutation();

    async function handleSignIn(values: Credentials) {
        try {
            await signIn(values).unwrap();
            toast.success('Logged in successfully');
            navigate('/');
        } catch (_err) {
            console.error('Sign in failed', _err);
            toast.error(getApiErrorMessage(_err));
        }
    }
    function handleLogout() {
        try {
            logout().unwrap();
            toast.success('Logged out successfully');
            navigate('/');
        } catch (_err) {
            console.error('Sign out failed', _err);
            toast.error(getApiErrorMessage(_err));
        }
    }

    return {
        isAuthenticated,
        isAuthLoading,
        authUser,
        signIn: { isSigningIn, handleSignIn },
        handleLogout,
    };
}
