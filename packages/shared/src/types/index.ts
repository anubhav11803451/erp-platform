export interface PlatformOwnerAccountResponse {
    id: string;
    email: string;
}

export interface PlatformOwnerSignInResponse {
    access_token: string;
    csrf_token: string;
    account: PlatformOwnerAccountResponse;
}

export interface PlatformOwnerLogoutResponse {
    message: string;
}
