import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { useEffect } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Paginator } from '@/components/paginator/paginator';
import { getApiErrorMessage } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useOwnerDirectoryHooks } from '@/hooks/owner-setup/owner-directory-hooks';
import {
    openInstitutionDialog,
    openLegalEntityDialog,
    selectOwnerDirectoryPage,
    selectOwnerDirectoryPageSize,
    setDirectoryPage,
    setDirectoryPageSize,
    setDirectoryFilter,
} from './owner-setup-slice';
import { InstitutionAdminInvitationControls } from './institution-admin-invitation-controls';
import { OwnerDirectoryToolbar } from './owner-directory-toolbar';
import { Separator } from '@/components/ui/separator';
import { Flex } from '@/components/ui/flex';
import { Typography } from '@/components/ui/typography';

export function OwnerLegalEntityDirectory() {
    const dispatch = useAppDispatch();
    const directoryPage = useAppSelector(selectOwnerDirectoryPage);
    const directoryPageSize = useAppSelector(selectOwnerDirectoryPageSize);
    const {
        data,
        error,
        isError,
        isLoading,
        isFetching,
        refetch,
        filteredLegalEntities: legalEntities,
        normalizedFilter,
        institutionUnconfirmed,
    } = useOwnerDirectoryHooks();
    const totalPages = Math.max(1, Math.ceil(legalEntities.length / directoryPageSize));
    const currentPage = Math.min(directoryPage, totalPages);
    const pageOffset = (currentPage - 1) * directoryPageSize;
    const visibleLegalEntities = legalEntities.slice(pageOffset, pageOffset + directoryPageSize);

    useEffect(() => {
        if (directoryPage !== currentPage) {
            dispatch(setDirectoryPage(currentPage));
        }
    }, [currentPage, directoryPage, dispatch]);

    return (
        <div className="space-y-4">
            {isError && data && (
                <Alert variant="destructive">
                    <AlertTitle>Directory refresh failed</AlertTitle>
                    <AlertDescription>
                        The displayed records may be out of date. Refresh before relying on them.
                    </AlertDescription>
                </Alert>
            )}
            {error && !data && (
                <Alert variant="destructive">
                    <AlertTitle>Could not load LegalEntity directory</AlertTitle>
                    <AlertDescription className="gap-3">
                        <p>
                            {getApiErrorMessage(error, 'Please try loading the directory again.')}
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                        >
                            Try again
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
            <Flex>
                <div className="space-y-1.5">
                    <Typography variant="h4">LegalEntity directory</Typography>
                    <Typography variant="muted">
                        Institutions are grouped under their LegalEntity.
                    </Typography>
                </div>
                <OwnerDirectoryToolbar isFetching={isFetching} onRefresh={() => void refetch()} />
            </Flex>
            <Separator />

            {isLoading ? (
                <div role="status" aria-label="Loading LegalEntity directory" className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : legalEntities.length ? (
                <>
                    <Accordion type="multiple" className="space-y-3">
                        {visibleLegalEntities.map((legalEntity) => (
                            <AccordionItem
                                key={legalEntity.id}
                                value={legalEntity.id}
                                className="bg-muted/30 rounded-lg border px-3 sm:px-5"
                            >
                                <AccordionPrimitive.Header className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
                                    <AccordionPrimitive.Trigger className="focus-visible:border-ring focus-visible:ring-ring/50 flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md py-2 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180">
                                        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="font-semibold wrap-break-word">
                                                {legalEntity.name}
                                            </span>
                                            <Badge variant="outline" className="font-mono">
                                                {legalEntity.code ?? 'Code unavailable'}
                                            </Badge>
                                            <span className="text-muted-foreground text-sm">
                                                {legalEntity.institutions.length}{' '}
                                                {legalEntity.institutions.length === 1
                                                    ? 'Institution'
                                                    : 'Institutions'}
                                            </span>
                                        </span>
                                        <ChevronDown
                                            aria-hidden="true"
                                            className="text-muted-foreground size-4 shrink-0 transition-transform duration-200"
                                        />
                                    </AccordionPrimitive.Trigger>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            dispatch(openInstitutionDialog(legalEntity.id))
                                        }
                                        disabled={!legalEntity.code || institutionUnconfirmed}
                                    >
                                        Generate claim
                                    </Button>
                                </AccordionPrimitive.Header>
                                <AccordionContent className="space-y-4">
                                    {!legalEntity.code && (
                                        <p className="text-muted-foreground text-sm">
                                            A LegalEntity code is required before an Institution can
                                            be added.
                                        </p>
                                    )}
                                    {legalEntity.visibleInstitutions.length ? (
                                        <ul className="space-y-3 sm:pl-2">
                                            {legalEntity.visibleInstitutions.map((institution) => (
                                                <li key={institution.id}>
                                                    <InstitutionAdminInvitationControls
                                                        institution={institution}
                                                        legalEntityCode={legalEntity.code}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">
                                            No Institutions are listed under this LegalEntity.
                                        </p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <Paginator
                        totalItems={legalEntities.length}
                        currentPage={currentPage}
                        pageSize={directoryPageSize}
                        onPageChange={(page) => dispatch(setDirectoryPage(page))}
                        onPageSizeChange={(pageSize) => dispatch(setDirectoryPageSize(pageSize))}
                    />
                </>
            ) : normalizedFilter ? (
                <Empty className="rounded-lg border">
                    <EmptyHeader>
                        <EmptyTitle>No matching records</EmptyTitle>
                        <EmptyDescription>
                            Try another name or code, or clear the filter.
                        </EmptyDescription>
                    </EmptyHeader>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => dispatch(setDirectoryFilter(''))}
                    >
                        Clear filter
                    </Button>
                </Empty>
            ) : (
                <Empty className="rounded-lg border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Building2 aria-hidden="true" />
                        </EmptyMedia>
                        <EmptyTitle>No LegalEntity yet</EmptyTitle>
                        <EmptyDescription>
                            Create a LegalEntity with its required code. You can add an Institution
                            and its first Admin invitation afterward.
                        </EmptyDescription>
                    </EmptyHeader>
                    <Button type="button" onClick={() => dispatch(openLegalEntityDialog())}>
                        Create LegalEntity
                    </Button>
                </Empty>
            )}
        </div>
    );
}
