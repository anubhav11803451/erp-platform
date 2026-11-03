import { API_BASE_URL } from '@/api/base-query';
import {
    institutionStaffInvitationAcceptRequestSchema,
    institutionStaffInvitationAcceptResponseSchema,
    institutionStaffInvitationContextRequestSchema,
    institutionStaffInvitationContextResponseSchema,
    type InstitutionStaffInvitationAcceptResponse,
    type InstitutionStaffInvitationContextResponse,
} from '@erp/shared';

export class StaffInvitationApiError extends Error {
    readonly status: number | null;

    constructor(status: number | null) {
        super('The Staff invitation service could not complete the request.');
        this.name = 'StaffInvitationApiError';
        this.status = status;
    }
}

function apiUrl(path: string): string {
    return `${API_BASE_URL.replace(/\/+$/, '')}${path}`;
}

function requestHeaders(csrfToken: string | null): Headers {
    const headers = new Headers({ 'content-type': 'application/json' });
    if (csrfToken) {
        headers.set('x-csrf-token', csrfToken);
    }
    return headers;
}

async function postJson(path: string, body: unknown, csrfToken: string | null): Promise<unknown> {
    let response: Response;
    try {
        response = await fetch(apiUrl(path), {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
            referrerPolicy: 'no-referrer',
            headers: requestHeaders(csrfToken),
            body: JSON.stringify(body),
        });
    } catch {
        throw new StaffInvitationApiError(null);
    }

    if (!response.ok) {
        throw new StaffInvitationApiError(response.status);
    }

    try {
        return (await response.json()) as unknown;
    } catch {
        throw new StaffInvitationApiError(response.status);
    }
}

function parse<T>(
    payload: unknown,
    schema: { safeParse: (input: unknown) => { success: true; data: T } | { success: false } }
): T {
    const result = schema.safeParse(payload);
    if (!result.success) {
        throw new StaffInvitationApiError(null);
    }
    return result.data;
}

export function captureStaffInvitationToken(): string | null {
    if (typeof window === 'undefined' || window.location.pathname !== '/invite/staff') {
        return null;
    }
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    window.history.replaceState(
        window.history.state,
        document.title,
        `${window.location.pathname}${window.location.search}`
    );
    return token && token.length > 0 ? token : null;
}

export async function loadStaffInvitationContext(
    token: string,
    csrfToken: string | null
): Promise<InstitutionStaffInvitationContextResponse> {
    const input = institutionStaffInvitationContextRequestSchema.safeParse({ token });
    if (!input.success) {
        throw new StaffInvitationApiError(null);
    }
    return parse(
        await postJson('/auth/staff-invitations/context', input.data, csrfToken),
        institutionStaffInvitationContextResponseSchema
    );
}

export async function acceptStaffInvitation(
    token: string,
    password: string,
    csrfToken: string | null
): Promise<InstitutionStaffInvitationAcceptResponse> {
    const input = institutionStaffInvitationAcceptRequestSchema.safeParse({ token, password });
    if (!input.success) {
        throw new StaffInvitationApiError(null);
    }
    return parse(
        await postJson('/auth/staff-invitations/accept', input.data, csrfToken),
        institutionStaffInvitationAcceptResponseSchema
    );
}
