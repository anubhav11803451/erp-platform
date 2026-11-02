import { apiSlice } from '@/api/api-slice';
import { API_BASE_URL } from '@/api/base-query';
import { CSRF_TOKEN_COOKIE_NAME } from '@/lib/constants';
import Cookies from 'js-cookie';
import {
    institutionAdminInvitationCreateRequestSchema,
    institutionAdminInvitationCreateResponseSchema,
    institutionAdminInvitationDecisionRequestSchema,
    institutionAdminInvitationDecisionResponseSchema,
    institutionAdminInvitationIssueResponseSchema,
    institutionAdminInvitationOwnerClaimsResponseSchema,
    institutionAdminInvitationReissueRequestSchema,
    institutionAdminInvitationStatusResponseSchema,
    institutionAdminInvitationRevokeRequestSchema,
    type InstitutionAdminInvitationCreateRequest,
    type InstitutionAdminInvitationCreateResponse,
    type InstitutionAdminInvitationDecision,
    type InstitutionAdminInvitationDecisionResponse,
    type InstitutionAdminInvitationIssueResponse,
    type InstitutionAdminInvitationOwnerClaimsResponse,
    type InstitutionAdminInvitationReissueRequest,
    type InstitutionAdminInvitationStatusResponse,
} from '@erp/shared';

const apiRoot = API_BASE_URL.replace(/\/+$/, '');

type InvitationStatusArgs = {
    institutionId: string;
};

type InvitationActionArgs = {
    institutionId: string;
    invitationId: string;
};

type DecideInvitationArgs = InvitationActionArgs & {
    decision: InstitutionAdminInvitationDecision;
};

function ownerHeaders(accessToken: string | null): Headers {
    const headers = new Headers({ 'content-type': 'application/json' });
    if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`);
    }

    const csrfToken = Cookies.get(CSRF_TOKEN_COOKIE_NAME);
    if (csrfToken) {
        headers.set('x-csrf-token', csrfToken);
    }

    return headers;
}

function parseResponse<T>(
    payload: unknown,
    schema: { safeParse: (input: unknown) => { success: true; data: T } | { success: false } }
): T {
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
        throw new Error('The server returned an invalid response.');
    }
    return parsed.data;
}

async function postOwnerJson<T>(
    path: string,
    accessToken: string | null,
    payload: unknown,
    schema: {
        safeParse: (input: unknown) => { success: true; data: T } | { success: false };
    }
): Promise<T> {
    if (!accessToken) {
        throw new Error('Your Owner session is unavailable. Sign in again before continuing.');
    }

    let response: Response;
    try {
        response = await fetch(`${apiRoot}${path}`, {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
            referrerPolicy: 'no-referrer',
            headers: ownerHeaders(accessToken),
            body: JSON.stringify(payload),
        });
    } catch {
        throw new Error(
            'The request could not be confirmed. Refresh the directory before retrying.'
        );
    }

    if (!response.ok) {
        throw new Error(
            response.status === 401 || response.status === 403
                ? 'Your Owner session is no longer available. Sign in again before continuing.'
                : 'The request could not be confirmed. Refresh the directory before retrying.'
        );
    }

    let body: unknown;
    try {
        body = await response.json();
    } catch {
        throw new Error('The server response could not be confirmed. Refresh before retrying.');
    }

    return parseResponse(body, schema);
}

/**
 * Creates the Institution and its first invitation in one request. The response includes a
 * one-time bearer URL, so this deliberately bypasses RTK Query and must not be cached.
 */
export async function createInstitutionAndIssueInvitationOnce(
    legalEntityId: string,
    payload: InstitutionAdminInvitationCreateRequest,
    accessToken: string | null
): Promise<InstitutionAdminInvitationCreateResponse> {
    const input = institutionAdminInvitationCreateRequestSchema.safeParse(payload);
    if (!input.success) {
        throw new Error('Check the Institution and invitation details and try again.');
    }

    return postOwnerJson(
        `/owner/legal-entities/${legalEntityId}/institutions`,
        accessToken,
        input.data,
        institutionAdminInvitationCreateResponseSchema
    );
}

/**
 * Explicit replacement only; the secret-bearing response is returned to the calling component
 * and is never placed in RTK Query state.
 */
export async function replaceOwnerInvitationOnce(
    institutionId: string,
    invitationId: string,
    payload: InstitutionAdminInvitationReissueRequest,
    accessToken: string | null
): Promise<InstitutionAdminInvitationIssueResponse> {
    const input = institutionAdminInvitationReissueRequestSchema.safeParse(payload);
    if (!input.success) {
        throw new Error('Provide a valid invitation recipient before replacing the invitation.');
    }

    return postOwnerJson(
        `/owner/legal-entities/institutions/${institutionId}/admin-invitations/${invitationId}/replace`,
        accessToken,
        input.data,
        institutionAdminInvitationIssueResponseSchema
    );
}

export const ownerInvitationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFirstAdminInvitationStatus: builder.query<
            InstitutionAdminInvitationStatusResponse,
            InvitationStatusArgs
        >({
            query: ({ institutionId }) =>
                `/owner/legal-entities/institutions/${institutionId}/admin-invitation`,
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionAdminInvitationStatusResponseSchema),
        }),
        getFirstAdminInvitationClaims: builder.query<
            InstitutionAdminInvitationOwnerClaimsResponse,
            InvitationStatusArgs
        >({
            query: ({ institutionId }) =>
                `/owner/legal-entities/institutions/${institutionId}/admin-invitation/claims`,
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionAdminInvitationOwnerClaimsResponseSchema),
        }),
        revokeFirstAdminInvitation: builder.mutation<
            InstitutionAdminInvitationStatusResponse,
            InvitationActionArgs
        >({
            query: ({ institutionId, invitationId }) => ({
                url: `/owner/legal-entities/institutions/${institutionId}/admin-invitations/${invitationId}/revoke`,
                method: 'POST',
                body: institutionAdminInvitationRevokeRequestSchema.parse({}),
            }),
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionAdminInvitationStatusResponseSchema),
        }),
        decideFirstAdminInvitation: builder.mutation<
            InstitutionAdminInvitationDecisionResponse,
            DecideInvitationArgs
        >({
            query: ({ institutionId, invitationId, decision }) => ({
                url: `/owner/legal-entities/institutions/${institutionId}/admin-invitations/${invitationId}/decision`,
                method: 'POST',
                body: institutionAdminInvitationDecisionRequestSchema.parse({ decision }),
            }),
            transformResponse: (payload: unknown) =>
                parseResponse(payload, institutionAdminInvitationDecisionResponseSchema),
        }),
    }),
});

export const {
    useGetFirstAdminInvitationClaimsQuery,
    useGetFirstAdminInvitationStatusQuery,
    useRevokeFirstAdminInvitationMutation,
    useDecideFirstAdminInvitationMutation,
} = ownerInvitationApiSlice;
