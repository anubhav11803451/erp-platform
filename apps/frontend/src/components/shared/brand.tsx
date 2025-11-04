import { Globe } from 'lucide-react';
import type { FunctionComponent } from 'react';
import { Flex } from '../ui/flex';
import { Typography } from '../ui/typography';
import { cn } from '@/lib/utils';

type BrandProps = {
    className?: string;
};

const Brand: FunctionComponent<BrandProps> = ({ className }) => {
    return (
        <Flex alignItems="center" justifyContent="center" className={cn('mr-4', className)}>
            <Globe id="icon" className="text-primary mr-2 h-6 w-6" />
            <Typography as="span" variant="large" weight="bold">
                ERP360
            </Typography>
        </Flex>
    );
};

export default Brand;
