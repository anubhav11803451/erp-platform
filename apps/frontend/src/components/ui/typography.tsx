import { Slot } from '@radix-ui/react-slot';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const typographyVariants = cva('tracking-normal', {
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
        variant: {
            h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight',
            h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
            h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
            h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
            p: 'leading-7 [&:not(:first-child)]:mt-6',
            code: 'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm',
            lead: 'text-muted-foreground text-xl',
            large: 'text-lg font-semibold',
            small: 'text-sm leading-none font-medium',
            muted: 'text-muted-foreground text-sm',
            tiny: 'text-muted-foreground text-xs leading-none font-medium',
        },
        weight: {
            regular: 'font-normal',
            medium: 'font-medium',
            semibold: 'font-semibold',
            bold: 'font-bold',
        },
    },
});

type TypographyProps = React.ComponentPropsWithRef<'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> &
    VariantProps<typeof typographyVariants> & {
        as?: React.ElementType;
        asChild?: boolean;
    };

const Typography = React.forwardRef<HTMLParagraphElement | HTMLHeadingElement, TypographyProps>(
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
                className={typographyVariants({
                    variant,
                    weight,
                    align,
                    truncate,
                    transform,
                    inline,
                    className,
                })}
                {...props}
            />
        );
    }
);

Typography.displayName = 'Typography';

export { Typography, type TypographyProps };
