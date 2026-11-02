import { Link } from 'react-router';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from './use-bread-crumbs';
import { Fragment } from 'react/jsx-runtime';

export function Breadcrumbs() {
    const crumbs = useBreadcrumbs();

    if (crumbs.length === 0) {
        return null;
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;
                    return (
                        <Fragment key={crumb.id}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                ) : crumb.href ? (
                                    <BreadcrumbLink asChild>
                                        <Link to={crumb.href}>{crumb.label}</Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <span>{crumb.label}</span>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
