export const CSRF_TOKEN_COOKIE_NAME = 'erp360_ctk'; // CSRF Token
export const REFRESH_TOKEN_COOKIE_NAME = 'erp360_rtk'; // Refresh Token

//Themes
export const THEMES = [
    { name: 'default', label: 'Default' },
    { name: 'neutral', label: 'Neutral' },
    { name: 'blue', label: 'Blue' },
    { name: 'green', label: 'Green' },
    { name: 'amber', label: 'Amber' },
    { name: 'rose', label: 'Rose' },
    { name: 'purple', label: 'Purple' },
    { name: 'orange', label: 'Orange' },
    { name: 'teal', label: 'Teal' },
    { name: 'red', label: 'Red' },
    { name: 'yellow', label: 'Yellow' },
    { name: 'violet', label: 'Violet' },
] as const;

export type ThemeName = (typeof THEMES)[number]['name'];

export const DEFAULT_THEME: ThemeName = 'default';

export const ACTIVE_THEME_STORE_KEY = 'erp360_active_theme';
export const THEME_MODE_STORE_KEY = 'erp360_theme_mode';
