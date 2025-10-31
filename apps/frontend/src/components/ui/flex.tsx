import { Slot } from '@radix-ui/react-slot';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const flexVariants = cva('flex', {
    variants: {
        inline: {
            true: 'inline-flex',
        },
        direction: {
            row: 'flex-row',
            column: 'flex-col',
            'column-reverse': 'flex-col-reverse',
        },
        alignItems: {
            start: 'items-start',
            center: 'items-center',
            end: 'items-end',
            baseline: 'items-baseline',
            stretch: 'items-stretch',
        },
        justifyContent: {
            start: 'justify-start',
            center: 'justify-center',
            end: 'justify-end',
            between: 'justify-between',
            around: 'justify-around',
            evenly: 'justify-evenly',
        },
        alignContent: {
            start: 'content-start',
            center: 'content-center',
            end: 'content-end',
            between: 'content-between',
            around: 'content-around',
            evenly: 'content-evenly',
        },
        alignSelf: {
            start: 'self-start',
            center: 'self-center',
            end: 'self-end',
            baseline: 'self-baseline',
            stretch: 'self-stretch',
        },
        fullHeight: {
            true: 'grow',
        },
        fullWidth: {
            true: 'w-full',
        },
        reverse: {
            true: 'flex-row-reverse',
        },
        wrap: {
            true: 'flex-wrap',
        },
        // gap, margin and padding
        gap: {
            0: 'gap-0',
            0.5: 'gap-2',
            1: 'gap-4',
            1.5: 'gap-6',
            2: 'gap-8',
            3: 'gap-12',
            4: 'gap-16',
            5: 'gap-20',
            6: 'gap-24',
        },
        gapX: {
            0.5: 'gap-x-2',
            1: 'gap-x-4',
            1.5: 'gap-x-6',
            2: 'gap-x-8',
            3: 'gap-x-12',
            4: 'gap-x-16',
            5: 'gap-x-20',
            6: 'gap-x-24',
        },
        gapY: {
            0.5: 'gap-y-2',
            1: 'gap-y-4',
            1.5: 'gap-y-6',
            2: 'gap-y-8',
            3: 'gap-y-12',
            4: 'gap-y-16',
            5: 'gap-y-20',
            6: 'gap-y-24',
        },
    },
    compoundVariants: [
        {
            reverse: true,
            direction: 'row',
            className: 'flex-row-reverse',
        },
        {
            reverse: true,
            direction: 'column',
            className: 'flex-col-reverse',
        },
        // {
        //     reverse: false,
        //     direction: "column",
        //     className: "flex-col!",
        // },
    ],
});

export type FlexProps = {
    asChild?: boolean;
    as?: React.ElementType;
} & React.ComponentProps<'div'> &
    VariantProps<typeof flexVariants>;

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
    (
        {
            as = 'div',
            asChild = false,
            className,
            id = 'flex',
            inline,
            alignContent,
            alignItems,
            alignSelf,
            justifyContent,
            reverse,
            wrap,
            direction,
            fullWidth,
            fullHeight,
            gap,
            gapX,
            gapY,
            ...rest
        },
        ref
    ) => {
        const Comp = asChild ? Slot : as;

        return React.createElement(Comp, {
            ref,
            id,
            className: cn(
                flexVariants({
                    inline,
                    alignContent,
                    alignItems,
                    alignSelf,
                    justifyContent,
                    reverse,
                    wrap,
                    direction,
                    fullWidth,
                    fullHeight,
                    gap,
                    gapX,
                    gapY,
                }),
                className
            ),
            ...rest,
        });
    }
);

Flex.displayName = 'Flex';

export { Flex };
