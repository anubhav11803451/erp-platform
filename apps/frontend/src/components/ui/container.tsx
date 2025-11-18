import { Slot } from '@radix-ui/react-slot';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const containerVariants = cva('container flex flex-col', {
    variants: {
        center: {
            true: 'mx-auto',
        },
        fullWidth: {
            true: 'w-full',
        },
        fullHeight: {
            true: 'h-full',
        },
        fullScreen: {
            true: 'min-h-dvh min-w-full',
        },
        maxWidth: {
            true: 'w-full md:max-w-5xl lg:max-w-[1120px]',
        },
    },
});

export type ContainerProps = {
    as?: React.ElementType;
    asChild?: boolean;
} & React.ComponentPropsWithRef<'div'> &
    VariantProps<typeof containerVariants>;

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
    (
        {
            className,
            id = 'container',
            center,
            fullWidth,
            fullHeight,
            fullScreen,
            maxWidth,
            asChild = false,
            as = 'div',
            ...rest
        },
        ref
    ) => {
        const Comp = asChild ? Slot : as;

        return React.createElement(Comp, {
            className: cn(
                containerVariants({ center, fullWidth, fullHeight, fullScreen, maxWidth }),
                className
            ),
            id,
            ref,
            ...rest,
        });
    }
);

Container.displayName = 'Container';

export { Container };
