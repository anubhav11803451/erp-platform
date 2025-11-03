import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { THEME_MODE_STORE_KEY, THEMES } from '@/lib/constants';

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
            enableColorScheme
            themes={[...THEMES.map((theme) => theme.name)]}
            storageKey={THEME_MODE_STORE_KEY}
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}
