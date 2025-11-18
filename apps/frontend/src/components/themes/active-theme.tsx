'use client';

import { ACTIVE_THEME_STORE_KEY, DEFAULT_THEME, type ThemeName } from '@/lib/constants';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type ThemeContextType = {
    activeTheme: ThemeName;
    setActiveTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ActiveThemeProvider({
    children,
    initialTheme,
}: {
    children: ReactNode;
    initialTheme?: ThemeName;
}) {
    const [activeTheme, setActiveTheme] = useState<ThemeName>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(ACTIVE_THEME_STORE_KEY) as ThemeName | null;
            if (saved) return saved;
        }
        return initialTheme ?? DEFAULT_THEME;
    });

    // Store the active theme in localStorage
    useEffect(() => {
        localStorage.setItem(ACTIVE_THEME_STORE_KEY, activeTheme);
    }, [activeTheme]);

    // Sync class on <body>
    useEffect(() => {
        document.body.classList.forEach((c) => {
            if (c.startsWith('theme-')) document.body.classList.remove(c);
        });

        document.body.classList.add(`theme-${activeTheme}`);

        if (activeTheme.endsWith('-scaled')) {
            document.body.classList.add('theme-scaled');
        }
    }, [activeTheme]);

    return (
        <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeConfig() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeConfig must be used within an ActiveThemeProvider');
    }
    return context;
}
