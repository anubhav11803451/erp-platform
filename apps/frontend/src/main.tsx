import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { Loader } from 'lucide-react';
import { Provider } from 'react-redux';

import { ThemeProvider } from '@/components/theme-provider';
import { store } from '@/app/store';
import { routes } from './router.generated';

import '@/index.css';
import { Toaster } from './components/ui/sonner';

if (import.meta.env) {
    console.log('Running in', import.meta.env.MODE, 'mode');
    console.log('Loaded Environment variables:', import.meta.env);
}

const router = createBrowserRouter(routes);

console.log('Final routes:', routes);

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);

    root.render(
        <StrictMode>
            <Provider store={store}>
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    <Suspense
                        fallback={
                            <div className="h-screen w-screen">
                                <Loader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                            </div>
                        }
                    >
                        <RouterProvider router={router} key={window.location.pathname} />
                        <Toaster />
                    </Suspense>
                </ThemeProvider>
            </Provider>
        </StrictMode>
    );
} else {
    throw new Error(
        "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file."
    );
}
