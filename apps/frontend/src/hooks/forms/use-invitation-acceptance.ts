import { useEffect, useRef, useState } from 'react';
import type {
    InstitutionAdminInvitationAccountCredentials,
    InstitutionAdminInvitationClaimRequest,
    InstitutionAdminInvitationClaimResponse,
    InstitutionAdminInvitationClaimantStatusResponse,
    InstitutionAdminInvitationContextResponse,
    InstitutionAdminInvitationNewAccountClaim,
} from '@erp/shared';
import {
    claimExistingAccount,
    claimNewAccount,
    InvitationApiError,
    loadInvitationEntry,
    refreshClaimantStatus,
    signInForInvitation,
    type InvitationEntry,
} from '@/features/institution-admin-invitation/invitation-client';
import { claimantStatusMessages } from '@/features/institution-admin-invitation/claimant-status-messages';

type PageState = 'loading' | 'invitation' | 'claimant-status' | 'unavailable' | 'service-error';
type AccountMode = 'new' | 'existing';

function isUnavailable(error: unknown): boolean {
    return error instanceof InvitationApiError && error.status === 401;
}

function statusFromClaim(
    claim: InstitutionAdminInvitationClaimResponse
): InstitutionAdminInvitationClaimantStatusResponse {
    return {
        status: claim.status,
        invited_email: claim.invited_email,
        claimed_at: claim.claimed_at,
        review_expires_at: claim.review_expires_at,
        decided_at: null,
    };
}

export function useInvitationAcceptance() {
    const headingRef = useRef<HTMLHeadingElement>(null);
    const [pageState, setPageState] = useState<PageState>('loading');
    const [entry, setEntry] = useState<InvitationEntry | null>(null);
    const [accountMode, setAccountMode] = useState<AccountMode>('new');
    const [existingAccountReady, setExistingAccountReady] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [feedbackIsError, setFeedbackIsError] = useState(false);
    const [claimCheckAvailable, setClaimCheckAvailable] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const statusHeading =
        entry?.kind === 'claimant-status'
            ? claimantStatusMessages[entry.status.status].title
            : null;

    useEffect(() => {
        let isCurrent = true;
        void loadInvitationEntry()
            .then((result) => {
                if (!isCurrent) {
                    return;
                }
                setEntry(result);
                setPageState(result.kind === 'invitation' ? 'invitation' : 'claimant-status');
            })
            .catch((error: unknown) => {
                if (!isCurrent) {
                    return;
                }
                setPageState(isUnavailable(error) ? 'unavailable' : 'service-error');
                if (!isUnavailable(error)) {
                    setFeedback(
                        'The service could not confirm the invitation or claim status. Try again; no access is assumed.'
                    );
                    setFeedbackIsError(true);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, []);

    useEffect(() => {
        if (pageState !== 'loading') {
            headingRef.current?.focus();
        }
    }, [accountMode, existingAccountReady, pageState, statusHeading]);

    function showClaimStatus(claim: InstitutionAdminInvitationClaimResponse) {
        setEntry({ kind: 'claimant-status', status: statusFromClaim(claim) });
        setPageState('claimant-status');
        setExistingAccountReady(false);
        setClaimCheckAvailable(false);
        setFeedback('');
        setFeedbackIsError(false);
    }

    async function retryEntryCheck() {
        setPageState('loading');
        setFeedback('');
        try {
            const result = await loadInvitationEntry();
            setEntry(result);
            setPageState(result.kind === 'invitation' ? 'invitation' : 'claimant-status');
            setExistingAccountReady(false);
            setClaimCheckAvailable(false);
        } catch (error: unknown) {
            setPageState(isUnavailable(error) ? 'unavailable' : 'service-error');
            setFeedback(
                isUnavailable(error)
                    ? 'This invitation or status link is unavailable. It may have expired after the review deadline; we cannot verify a terminal outcome with this link. Contact the Platform Owner for current status.'
                    : 'The service could not confirm the invitation or claim status. Try again; no access is assumed.'
            );
            setFeedbackIsError(true);
        }
    }

    async function refreshStatus() {
        setIsRefreshing(true);
        setFeedback('');
        try {
            const status = await refreshClaimantStatus();
            setEntry({ kind: 'claimant-status', status });
            setPageState('claimant-status');
            setFeedbackIsError(false);
            setClaimCheckAvailable(false);
        } catch (error: unknown) {
            if (isUnavailable(error)) {
                setPageState('unavailable');
                setFeedbackIsError(true);
                setFeedback(
                    'This status link is unavailable. It may have expired after the review deadline; we cannot verify a terminal outcome with this link. Contact the Platform Owner for current status.'
                );
            } else {
                setFeedback(
                    'The service could not refresh status. The result is not confirmed; try again later.'
                );
                setFeedbackIsError(true);
            }
        } finally {
            setIsRefreshing(false);
        }
    }

    async function submitExistingAccount(
        credentials: InstitutionAdminInvitationAccountCredentials
    ): Promise<boolean> {
        setFeedback('');
        try {
            const context = await signInForInvitation(credentials);
            setEntry({ kind: 'invitation', context });
            setPageState('invitation');
            setExistingAccountReady(true);
            setClaimCheckAvailable(false);
            setFeedbackIsError(false);
            setFeedback(
                'Account is eligible to continue. Add the name the Platform Owner will verify separately.'
            );
            return true;
        } catch {
            setFeedbackIsError(true);
            setClaimCheckAvailable(false);
            setFeedback(
                'Could not continue with this account. Check the credentials and eligibility. No other Institution details are revealed.'
            );
            return false;
        }
    }

    async function submitExistingClaim(
        claim: InstitutionAdminInvitationClaimRequest
    ): Promise<boolean> {
        setFeedback('');
        try {
            showClaimStatus(await claimExistingAccount(claim));
            return true;
        } catch {
            setFeedbackIsError(true);
            setClaimCheckAvailable(true);
            setFeedback(
                'The claim could not be confirmed. Refresh status before trying again; no Institution access is granted by this form.'
            );
            return false;
        }
    }

    async function submitNewAccountClaim(
        claim: InstitutionAdminInvitationNewAccountClaim
    ): Promise<boolean> {
        setFeedback('');
        try {
            showClaimStatus(await claimNewAccount(claim));
            return true;
        } catch {
            setFeedbackIsError(true);
            setClaimCheckAvailable(true);
            setFeedback(
                'The claim could not be confirmed. The account may already exist or may not be eligible. Refresh status before trying again.'
            );
            return false;
        }
    }

    function selectAccountMode(mode: AccountMode) {
        setAccountMode(mode);
        setFeedback('');
        setFeedbackIsError(false);
        setClaimCheckAvailable(false);
    }

    const invitationContext: InstitutionAdminInvitationContextResponse | null =
        entry?.kind === 'invitation' ? entry.context : null;
    const claimantStatus = entry?.kind === 'claimant-status' ? entry.status : null;

    return {
        headingRef,
        pageState,
        entry,
        accountMode,
        existingAccountReady,
        feedback,
        feedbackIsError,
        claimCheckAvailable,
        isRefreshing,
        statusHeading,
        invitationContext,
        claimantStatus,
        selectAccountMode,
        retryEntryCheck,
        refreshStatus,
        submitExistingAccount,
        submitExistingClaim,
        submitNewAccountClaim,
    };
}
