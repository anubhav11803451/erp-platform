import { useEffect, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAppSelector } from '@/app/hooks';
import { InstitutionForm, LegalEntityForm } from './owner-setup-forms';
import { OwnerLegalEntityDirectory } from './owner-legal-entity-directory';
import { selectOwnerSetupNotice } from './owner-setup-slice';

export function OwnerSetup() {
    const notice = useAppSelector(selectOwnerSetupNotice);
    const successRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (notice) {
            successRef.current?.focus();
        }
    }, [notice]);

    return (
        <div className="space-y-6">
            {notice && (
                <div
                    ref={successRef}
                    role="status"
                    aria-live="polite"
                    tabIndex={-1}
                    className="focus-visible:ring-ring rounded-lg outline-none focus-visible:ring-2"
                >
                    <Alert role="presentation">
                        <AlertTitle>Setup updated</AlertTitle>
                        <AlertDescription>{notice}</AlertDescription>
                    </Alert>
                </div>
            )}
            <OwnerLegalEntityDirectory />
            <LegalEntityForm />
            <InstitutionForm />
        </div>
    );
}
