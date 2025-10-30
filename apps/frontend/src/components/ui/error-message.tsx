import { cn } from '@/lib/utils';
import { Text, type TextProps } from './text';

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
