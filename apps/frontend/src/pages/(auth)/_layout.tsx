import { Outlet } from 'react-router';

export default function AuthLayout() {
    return (
        <main id="auth-layout">
            <Outlet />
        </main>
    );
}
