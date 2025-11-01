import {
    useLoginMutation,
    useLogoutMutation,
    type Credentials,
} from '@/features/auth/auth-api-slice';
import { useNavigate } from 'react-router';

export function useAuth() {
    // const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const [signIn] = useLoginMutation();
    const [logout] = useLogoutMutation();

    async function handleSignIn(values: Credentials) {
        try {
            await signIn(values).unwrap();
            navigate('/posts/123');
        } catch (_err) {
            console.error('Sign in failed', _err);
        }
    }
    function handleLogout() {
        logout();
    }

    return {
        handleSignIn,
        handleLogout,
    };
}
