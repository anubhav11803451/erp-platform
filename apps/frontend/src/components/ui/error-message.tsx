import { cn } from '@/lib/utils';
import { Typography as Text, type TypographyProps as TextProps } from './typography';

export default function ErrorMessage({
    children,
    className,
    ...rest
}: { children: React.ReactNode } & TextProps) {
    return (
        <Text weight="medium" className={cn('text-red-500', className)} {...rest}>
            {children}
        </Text>
    );
}
