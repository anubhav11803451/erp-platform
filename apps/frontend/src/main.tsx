import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, type RouteObject, RouterProvider } from 'react-router';
import '@/index.css';
import {
    add404PageToRoutesChildren,
    addErrorElementToRoutes,
    convertPagesToRoute,
} from '@/lib/router.tsx';
import { ThemeProvider } from '@/components/theme-provider';
import { Provider } from 'react-redux';
import { store } from '@/app/store';

if (import.meta.env) {
    console.log('Running in', import.meta.env.MODE, 'mode');
    console.log('Loaded Environment variables:', import.meta.env);
}

const files = import.meta.glob('./pages/**/*(page|layout).tsx');
const errorFiles = import.meta.glob('./pages/**/*error.tsx');
const notFoundFiles = import.meta.glob('./pages/**/*404.tsx');
const loadingFiles = import.meta.glob('./pages/**/*loading.tsx');

const routes = convertPagesToRoute(files, loadingFiles) as RouteObject;
addErrorElementToRoutes(errorFiles, routes);
add404PageToRoutesChildren(notFoundFiles, routes);

console.log('Final routes:', routes);

const router = createBrowserRouter([routes]);

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);

    root.render(
        <StrictMode>
            <Provider store={store}>
                <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    <RouterProvider router={router} />
                </ThemeProvider>
            </Provider>
        </StrictMode>
    );
} else {
    throw new Error(
        "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file."
    );
}
