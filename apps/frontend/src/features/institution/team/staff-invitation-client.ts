import { API_BASE_URL } from '@/api/base-query';
import {
    institutionStaffInvitationCreateRequestSchema,
    institutionStaffInvitationIssueResponseSchema,
    type InstitutionStaffInvitationCreateRequest,
    type InstitutionStaffInvitationIssueResponse,
} from '@erp/shared';

type StaffInvitationInput = InstitutionStaffInvitationCreateRequest & {
    replaceInvitationId?: string;
};

export class StaffInvitationIssueError extends Error {
    readonly status: number | null;

    constructor(status: number | null) {
        super(
            status === 401 || status === 403
                ? 'Your Institution Admin session is no longer available. Sign in again.'
                : status === null
                  ? 'The invitation could not be confirmed. Refresh Team before retrying.'
                  : 'The invitation could not be created. Check the details and retry.'
        );
        this.name = 'StaffInvitationIssueError';
        this.status = status;
    }
}

function apiUrl(path: string): string {
    return `${API_BASE_URL.replace(/\/+$/, '')}${path}`;
}

function parseIssue(payload: unknown): InstitutionStaffInvitationIssueResponse {
    const result = institutionStaffInvitationIssueResponseSchema.safeParse(payload);
    if (!result.success) {
        throw new Error('The invitation was not confirmed. Refresh Team before retrying.');
    }
    return result.data;
}

/**
 * Invitation URLs are bearer secrets. Keep this one-time response out of RTK Query cache.
 */
export async function issueStaffInvitationOnce(
    payload: StaffInvitationInput,
    accessToken: string | null,
    csrfToken: string | null
): Promise<InstitutionStaffInvitationIssueResponse> {
    if (!accessToken) {
        throw new Error('Your session is unavailable. Sign in again before inviting Staff.');
    }

    const parsedInput = institutionStaffInvitationCreateRequestSchema.safeParse({
        invited_email: payload.invited_email,
        group_ids: payload.group_ids,
    });
    if (!parsedInput.success) {
        throw new Error('Enter a valid email address and choose at least one group.');
    }

    const path = payload.replaceInvitationId
        ? `/institution/staff/invitations/${encodeURIComponent(payload.replaceInvitationId)}/replace`
        : '/institution/staff/invitations';
    const headers = new Headers({
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
    });
    if (csrfToken) {
        headers.set('x-csrf-token', csrfToken);
    }

    let response: Response;
    try {
        response = await fetch(apiUrl(path), {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
            referrerPolicy: 'no-referrer',
            headers,
            body: JSON.stringify(parsedInput.data),
        });
    } catch {
        throw new StaffInvitationIssueError(null);
    }

    if (!response.ok) {
        throw new StaffInvitationIssueError(response.status);
    }

    let result: unknown;
    try {
        result = await response.json();
    } catch {
        throw new StaffInvitationIssueError(null);
    }

    return parseIssue(result);
}
