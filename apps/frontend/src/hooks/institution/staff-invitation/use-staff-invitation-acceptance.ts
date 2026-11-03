import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectCsrfToken } from '@/features/auth/auth-slice';
import { z } from 'zod/v4';
import { institutionStaffInvitationAcceptRequestSchema } from '@erp/shared';
import type { InstitutionStaffInvitationContextResponse } from '@erp/shared';
import {
    acceptStaffInvitation,
    captureStaffInvitationToken,
    loadStaffInvitationContext,
    StaffInvitationApiError,
} from '@/features/institution/staff-invitation/staff-acceptance-client';

type PageState = 'capturing' | 'loading' | 'ready' | 'unavailable' | 'accepted';
type AccountMode = 'existing' | 'new';

export const existingAccountPasswordSchema = z.object({
    password: institutionStaffInvitationAcceptRequestSchema.shape.password,
});
export const newAccountPasswordSchema = z
    .object({
        password: institutionStaffInvitationAcceptRequestSchema.shape.password,
        confirm_password: z.string().min(8),
    })
    .refine((values) => values.password === values.confirm_password, {
        message: 'The password entries do not match.',
        path: ['confirm_password'],
    });

function invalidLinkMessage(error: unknown): string {
    if (error instanceof StaffInvitationApiError && error.status === 409) {
        return 'One or more selected groups is no longer active. Ask the Institution Admin to reissue the invitation with active groups.';
    }
    if (
        error instanceof StaffInvitationApiError &&
        [400, 401, 404, 410].includes(error.status ?? 0)
    ) {
        return 'This invitation link is invalid, revoked, or expired. Contact the Institution Admin for a new invitation.';
    }
    return 'The invitation could not be checked. Try again, or contact the Institution Admin if the issue continues.';
}

export function useStaffInvitationAcceptance() {
    const csrfToken = useAppSelector(selectCsrfToken);
    const [pageState, setPageState] = useState<PageState>('capturing');
    const [context, setContext] = useState<InstitutionStaffInvitationContextResponse | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [mode, setMode] = useState<AccountMode>('existing');
    const [error, setError] = useState<string | null>(null);
    const [canRetryCheck, setCanRetryCheck] = useState(false);
    const capturedRef = useRef(false);
    const requestStartedRef = useRef(false);
    const headingRef = useRef<HTMLHeadingElement>(null);

    const checkContext = useCallback(
        async (invitationToken: string) => {
            setError(null);
            setCanRetryCheck(false);
            try {
                const result = await loadStaffInvitationContext(invitationToken, csrfToken);
                setContext(result);
                setPageState('ready');
            } catch (requestError: unknown) {
                setError(invalidLinkMessage(requestError));
                setCanRetryCheck(
                    !(requestError instanceof StaffInvitationApiError) ||
                        ![400, 401, 404, 409, 410].includes(requestError.status ?? 0)
                );
                setPageState('unavailable');
            }
        },
        [csrfToken]
    );

    useLayoutEffect(() => {
        if (capturedRef.current) {
            return;
        }
        capturedRef.current = true;
        const invitationToken = captureStaffInvitationToken();
        if (!invitationToken) {
            setPageState('unavailable');
            setError(
                'No invitation token was found. Open the full one-time link shared by the Institution Admin.'
            );
            return;
        }
        setToken(invitationToken);
        setPageState('loading');
    }, []);

    useLayoutEffect(() => {
        if (pageState === 'unavailable' || pageState === 'accepted') {
            headingRef.current?.focus();
        }
    }, [pageState]);

    useLayoutEffect(() => {
        if (!token || requestStartedRef.current) {
            return;
        }
        requestStartedRef.current = true;
        void checkContext(token);
    }, [checkContext, token]);

    function retryContext() {
        if (!token) {
            return;
        }
        requestStartedRef.current = true;
        setPageState('loading');
        void checkContext(token);
    }

    function changeMode(nextMode: AccountMode) {
        setMode(nextMode);
        setError(null);
    }

    async function submitPassword(password: string) {
        setError(null);
        if (!token) {
            setError('The invitation token is unavailable. Reopen the original link.');
            return;
        }
        if (!institutionStaffInvitationAcceptRequestSchema.safeParse({ token, password }).success) {
            setError('Use a password with at least 8 characters.');
            return;
        }

        try {
            await acceptStaffInvitation(token, password, csrfToken);
            setToken(null);
            setPageState('accepted');
        } catch (requestError: unknown) {
            setError(
                requestError instanceof StaffInvitationApiError && requestError.status === 409
                    ? 'One or more selected groups is no longer active. Ask the Institution Admin to reissue the invitation with active groups.'
                    : requestError instanceof StaffInvitationApiError &&
                        [400, 401, 403, 410].includes(requestError.status ?? 0)
                      ? 'The invitation could not be accepted. Check the current password for an existing account, or ask the Institution Admin for a fresh invitation.'
                      : 'Acceptance could not be confirmed. Retry safely; an already accepted invitation will not create a workspace session.'
            );
        }
    }

    return {
        pageState,
        context,
        mode,
        error,
        canRetryCheck,
        headingRef,
        retryContext,
        changeMode,
        submitPassword,
    };
}
