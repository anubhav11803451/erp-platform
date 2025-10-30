import { Slot } from '@radix-ui/react-slot';
import React from 'react';
import { cva, type VariantProps, cx } from 'class-variance-authority';

const textVariants = cva('font-area text-neutral-7 text-base tracking-normal', {
    variants: {
        inline: {
            true: 'inline',
        },
        align: {
            left: 'text-left',
            center: 'text-center',
            right: 'text-right',
            justify: 'text-justify',
            start: 'text-start',
            end: 'text-end',
        },
        truncate: {
            true: 'truncate',
        },
        transform: {
            uppercase: 'uppercase',
            lowercase: 'lowercase',
            capitalize: 'capitalize',
        },
        variant: {},

        weight: {
            regular: 'font-normal',
            medium: 'font-medium',
            semibold: 'font-semibold',
            bold: 'font-bold',
        },
    },
});

type TextProps = React.ComponentPropsWithRef<'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> &
    VariantProps<typeof textVariants> & {
        as?: React.ElementType;
        asChild?: boolean;
    };

const Text = React.forwardRef<HTMLParagraphElement | HTMLHeadingElement, TextProps>(
    (
        {
            as = 'p',
            className,
            variant,
            weight,
            align,
            truncate,
            transform,
            inline,
            asChild = false,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : as;
        return (
            <Comp
                ref={ref}
                className={cx(
                    textVariants({
                        variant,
                        weight,
                        align,
                        truncate,
                        transform,
                        inline,
                    }),
                    className
                )}
                {...props}
            />
        );
    }
);

Text.displayName = 'Text';

export { Text, type TextProps };
