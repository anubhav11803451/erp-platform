import { RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
    openLegalEntityDialog,
    selectOwnerDirectoryFilter,
    setDirectoryFilter,
} from './owner-setup-slice';

export function OwnerDirectoryToolbar({
    isFetching,
    onRefresh,
}: {
    isFetching: boolean;
    onRefresh: () => void;
}) {
    const dispatch = useAppDispatch();
    const filter = useAppSelector(selectOwnerDirectoryFilter);

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:flex-1 xl:flex-nowrap xl:justify-end">
            <div className="relative min-w-0 flex-1 xl:max-w-64">
                <Label htmlFor="legal-entity-directory-filter" className="sr-only">
                    Filter Legal Entities and Institutions
                </Label>
                <Search
                    aria-hidden="true"
                    className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                />
                <Input
                    id="legal-entity-directory-filter"
                    value={filter}
                    onChange={(event) => dispatch(setDirectoryFilter(event.currentTarget.value))}
                    placeholder="Filter Legal Entities or Institutions"
                    autoComplete="off"
                    className="min-h-11 pl-9"
                />
            </div>
            <Button
                type="button"
                variant="outline"
                className="min-h-11 shrink-0"
                onClick={onRefresh}
                disabled={isFetching}
            >
                {isFetching ? <Spinner aria-label="Refreshing directory" /> : <RefreshCw />}
                {isFetching ? 'Refreshing…' : 'Reload directory'}
            </Button>
            <Button
                type="button"
                className="min-h-11 shrink-0"
                onClick={() => dispatch(openLegalEntityDialog())}
            >
                New Legal Entity
            </Button>
        </div>
    );
}
