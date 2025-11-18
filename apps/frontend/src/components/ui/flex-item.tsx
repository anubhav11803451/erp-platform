import { Slot } from '@radix-ui/react-slot';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const flexItemVariants = cva('flex-initial self-auto', {
    variants: {
        inline: {
            true: 'inline-flex w-fit',
        },
        alignSelf: {
            start: 'self-start',
            center: 'self-center',
            end: 'self-end',
            baseline: 'self-baseline',
            stretch: 'self-stretch',
        },
    },
});

export type FlexItemProps = React.ComponentPropsWithRef<'div'> &
    VariantProps<typeof flexItemVariants> & {
        as?: React.ElementType;
        asChild?: boolean;
    };

const FlexItem = React.forwardRef<HTMLDivElement, FlexItemProps>(
    (
        { as = 'div', asChild = false, id = 'flex-item', alignSelf, inline, className, ...rest },
        ref
    ) => {
        const Comp = asChild ? Slot : as;
        return React.createElement(Comp, {
            id,
            ...rest,
            className: cn(flexItemVariants({ alignSelf, inline }), className),
            ref,
        });
    }
);

FlexItem.displayName = 'FlexItem';

export { FlexItem };
