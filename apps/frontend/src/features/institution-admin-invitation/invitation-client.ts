import { API_BASE_URL } from '@/api/base-query';
import {
    authSessionResponseSchema,
    institutionAdminInvitationAccountCredentialsSchema,
    institutionAdminInvitationClaimRequestSchema,
    institutionAdminInvitationClaimResponseSchema,
    institutionAdminInvitationClaimantStatusResponseSchema,
    institutionAdminInvitationContextResponseSchema,
    institutionAdminInvitationExchangeRequestSchema,
    institutionAdminInvitationNewAccountClaimSchema,
    institutionAdminClaimStatusResumeRequestSchema,
    signInRequestSchema,
    type InstitutionAdminInvitationAccountCredentials,
    type InstitutionAdminInvitationClaimRequest,
    type InstitutionAdminInvitationClaimResponse,
    type InstitutionAdminInvitationClaimantStatusResponse,
    type InstitutionAdminInvitationContextResponse,
    type InstitutionAdminInvitationNewAccountClaim,
} from '@erp/shared';

const invitationApiPath = '/auth/invitations';
const continuationCsrfCookieName = 'erp360_iac_ctk';

export type InvitationEntry =
    | { kind: 'invitation'; context: InstitutionAdminInvitationContextResponse }
    | { kind: 'claimant-status'; status: InstitutionAdminInvitationClaimantStatusResponse };

export class InvitationApiError extends Error {
    readonly status: number | null;

    constructor(status: number | null) {
        super('The invitation service could not complete the request.');
        this.name = 'InvitationApiError';
        this.status = status;
    }
}

let capturedBearer: string | null = null;
let entryBootstrap: Promise<InvitationEntry> | null = null;

function apiUrl(path: string): string {
    return `${API_BASE_URL.replace(/\/+$/, '')}${path}`;
}

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const cookie = document.cookie
        .split(';')
        .map((value) => value.trim())
        .find((value) => value.startsWith(`${name}=`));

    if (!cookie) {
        return null;
    }

    try {
        return decodeURIComponent(cookie.slice(name.length + 1));
    } catch {
        return null;
    }
}

function requestHeaders(csrfToken?: string | null): Headers {
    const headers = new Headers({ 'content-type': 'application/json' });
    if (csrfToken) {
        headers.set('x-csrf-token', csrfToken);
    }
    return headers;
}

async function postJson(path: string, body: unknown, csrfToken?: string | null): Promise<unknown> {
    let response: Response;
    try {
        response = await fetch(apiUrl(`${invitationApiPath}${path}`), {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
            referrerPolicy: 'no-referrer',
            headers: requestHeaders(csrfToken),
            body: JSON.stringify(body),
        });
    } catch {
        throw new InvitationApiError(null);
    }

    if (!response.ok) {
        throw new InvitationApiError(response.status);
    }

    try {
        return (await response.json()) as unknown;
    } catch {
        throw new InvitationApiError(response.status);
    }
}

async function postInvitationLogin(
    body: unknown,
    csrfToken: string
): Promise<InstitutionAdminInvitationContextResponse> {
    let response: Response;
    try {
        response = await fetch(apiUrl('/auth/login'), {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
            referrerPolicy: 'no-referrer',
            headers: requestHeaders(csrfToken),
            body: JSON.stringify(body),
        });
    } catch {
        throw new InvitationApiError(null);
    }

    if (!response.ok) {
        throw new InvitationApiError(response.status);
    }

    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        throw new InvitationApiError(response.status);
    }

    const result = authSessionResponseSchema.safeParse(payload);
    if (!result.success || result.data.kind !== 'INVITATION_CONTINUATION') {
        throw new InvitationApiError(null);
    }

    return parseContext({
        institution: result.data.institution,
        invited_email: result.data.invited_email,
        invitation_expires_at: result.data.invitation_expires_at,
    });
}

function parseContext(payload: unknown): InstitutionAdminInvitationContextResponse {
    const result = institutionAdminInvitationContextResponseSchema.safeParse(payload);
    if (!result.success) {
        throw new InvitationApiError(null);
    }
    return result.data;
}

function parseClaim(payload: unknown): InstitutionAdminInvitationClaimResponse {
    const result = institutionAdminInvitationClaimResponseSchema.safeParse(payload);
    if (!result.success) {
        throw new InvitationApiError(null);
    }
    return result.data;
}

function parseClaimantStatus(payload: unknown): InstitutionAdminInvitationClaimantStatusResponse {
    const result = institutionAdminInvitationClaimantStatusResponseSchema.safeParse(payload);
    if (!result.success) {
        throw new InvitationApiError(null);
    }
    return result.data;
}

export function captureInitialInvitationBearer(): void {
    if (typeof window === 'undefined' || window.location.pathname !== '/invite/admin') {
        return;
    }

    const fragment = window.location.hash;
    if (!fragment) {
        return;
    }

    const bearer = fragment.slice(1);
    window.history.replaceState(
        window.history.state,
        document.title,
        `${window.location.pathname}${window.location.search}`
    );
    capturedBearer = bearer.length > 0 ? bearer : null;
}

function takeCapturedBearer(): string | null {
    const bearer = capturedBearer;
    capturedBearer = null;
    return bearer;
}

async function exchangeBearer(bearer: string): Promise<InvitationEntry> {
    const body = institutionAdminInvitationExchangeRequestSchema.safeParse({
        bearer_token: bearer,
    });
    if (!body.success) {
        throw new InvitationApiError(null);
    }

    const context = parseContext(await postJson('/exchange', body.data));
    return { kind: 'invitation', context };
}

async function resumeStatusOrContinuation(): Promise<InvitationEntry> {
    const body = institutionAdminClaimStatusResumeRequestSchema.parse({});
    try {
        const status = parseClaimantStatus(await postJson('/status', body));
        return { kind: 'claimant-status', status };
    } catch (error: unknown) {
        if (!(error instanceof InvitationApiError) || error.status !== 401) {
            throw error;
        }
    }

    const context = parseContext(await postJson('/resume', body));
    return { kind: 'invitation', context };
}

export function loadInvitationEntry(): Promise<InvitationEntry> {
    if (!entryBootstrap) {
        const bearer = takeCapturedBearer();
        const request = bearer ? exchangeBearer(bearer) : resumeStatusOrContinuation();
        entryBootstrap = request.catch((error: unknown) => {
            entryBootstrap = null;
            throw error;
        });
    }
    return entryBootstrap;
}

export async function signInForInvitation(
    credentials: InstitutionAdminInvitationAccountCredentials
): Promise<InstitutionAdminInvitationContextResponse> {
    const input = institutionAdminInvitationAccountCredentialsSchema.safeParse(credentials);
    const csrfToken = readCookie(continuationCsrfCookieName);
    if (!input.success || !csrfToken) {
        throw new InvitationApiError(null);
    }

    const body = signInRequestSchema.safeParse({ ...input.data, intent: 'INVITATION' });
    if (!body.success) {
        throw new InvitationApiError(null);
    }

    const context = await postInvitationLogin(body.data, csrfToken);
    entryBootstrap = null;
    return context;
}

export async function claimExistingAccount(
    claim: InstitutionAdminInvitationClaimRequest
): Promise<InstitutionAdminInvitationClaimResponse> {
    const input = institutionAdminInvitationClaimRequestSchema.safeParse(claim);
    if (!input.success) {
        throw new InvitationApiError(null);
    }

    const csrfToken = readCookie(continuationCsrfCookieName);
    if (!csrfToken) {
        throw new InvitationApiError(401);
    }
    try {
        return parseClaim(await postJson('/claim', input.data, csrfToken));
    } finally {
        entryBootstrap = null;
    }
}

export async function claimNewAccount(
    claim: InstitutionAdminInvitationNewAccountClaim
): Promise<InstitutionAdminInvitationClaimResponse> {
    const input = institutionAdminInvitationNewAccountClaimSchema.safeParse(claim);
    if (!input.success) {
        throw new InvitationApiError(null);
    }

    const csrfToken = readCookie(continuationCsrfCookieName);
    if (!csrfToken) {
        throw new InvitationApiError(401);
    }
    try {
        return parseClaim(await postJson('/claim/new-account', input.data, csrfToken));
    } finally {
        entryBootstrap = null;
    }
}

export async function refreshClaimantStatus(): Promise<InstitutionAdminInvitationClaimantStatusResponse> {
    const body = institutionAdminClaimStatusResumeRequestSchema.parse({});
    return parseClaimantStatus(await postJson('/status', body));
}
