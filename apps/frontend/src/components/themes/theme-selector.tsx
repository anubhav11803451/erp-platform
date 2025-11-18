'use client';

import { THEMES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useThemeConfig } from '@/components/themes/active-theme';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function ThemeSelector({ className }: React.ComponentProps<'div'>) {
    const { activeTheme, setActiveTheme } = useThemeConfig();

    const value = activeTheme;

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Label htmlFor="theme-selector" className="sr-only">
                Theme
            </Label>
            <Select value={value} onValueChange={setActiveTheme}>
                <SelectTrigger
                    id="theme-selector"
                    size="sm"
                    className="bg-secondary text-secondary-foreground border-secondary justify-start shadow-none *:data-[slot=select-value]:w-12"
                >
                    <span className="font-medium">Theme:</span>
                    <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent align="end">
                    {THEMES.map((theme) => (
                        <SelectItem
                            key={theme.name}
                            value={theme.name}
                            className="data-[state=checked]:opacity-50"
                        >
                            {theme.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
