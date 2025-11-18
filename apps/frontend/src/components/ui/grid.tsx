import { Slot } from '@radix-ui/react-slot';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const gridVariants = cva('grid gap-9', {
    variants: {
        columns: {
            1: 'grid-cols-1',
            2: 'grid-cols-2',
            3: 'grid-cols-3',
            4: 'grid-cols-4',
            5: 'grid-cols-5',
            6: 'grid-cols-6',
            7: 'grid-cols-7',
            8: 'grid-cols-8',
            9: 'grid-cols-9',
            10: 'grid-cols-10',
            11: 'grid-cols-11',
            12: 'grid-cols-12',
        },
        rows: {
            1: 'grid-rows-1',
            2: 'grid-rows-2',
            3: 'grid-rows-3',
            4: 'grid-rows-4',
            5: 'grid-rows-5',
            6: 'grid-rows-6',
        },
        gap: {
            0.5: 'gap-2',
            1: 'gap-4',
            2: 'gap-8',
            3: 'gap-12',
            4: 'gap-16',
            5: 'gap-20',
            6: 'gap-24',
        },
        gapX: {
            0.5: 'gap-x-2',
            1: 'gap-x-4',
            2: 'gap-x-8',
            3: 'gap-x-12',
            4: 'gap-x-16',
            5: 'gap-x-20',
            6: 'gap-x-24',
        },
        gapY: {
            0.5: 'gap-y-2',
            1: 'gap-y-4',
            2: 'gap-y-8',
            3: 'gap-y-12',
            4: 'gap-y-16',
            5: 'gap-y-20',
            6: 'gap-y-24',
        },
    },
});

export type GridProps = {
    asChild?: boolean;
    as?: React.ElementType;
} & React.ComponentPropsWithRef<'div'> &
    VariantProps<typeof gridVariants>;
const Grid = React.forwardRef<HTMLDivElement, GridProps>(
    (
        {
            as = 'div',
            id = 'grid',
            asChild = false,
            columns,
            rows,
            gap,
            gapX,
            gapY,
            className,
            ...rest
        },
        ref
    ) => {
        const Comp = asChild ? Slot : as;
        return React.createElement(Comp, {
            ref,
            id,
            className: cn(
                gridVariants({
                    columns,
                    rows,
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

Grid.displayName = 'Grid';

export { Grid };
