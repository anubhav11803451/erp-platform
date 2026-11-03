const configuredOrigin = process.env.API_PROXY_ORIGIN;

if (!configuredOrigin) {
    throw new Error('API_PROXY_ORIGIN must be set to the backend HTTPS origin.');
}

let apiOrigin;

try {
    const url = new URL(configuredOrigin);

    if (
        url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        url.pathname !== '/' ||
        url.search ||
        url.hash
    ) {
        throw new Error();
    }

    apiOrigin = url.origin;
} catch {
    throw new Error('API_PROXY_ORIGIN must be a bare HTTPS origin without credentials or a path.');
}

export const config = {
    installCommand: 'pnpm install --recursive',
    buildCommand: 'pnpm -w run build:frontend',
    rewrites: [
        {
            source: '/v1/api/:path*',
            destination: `${apiOrigin}/v1/api/:path*`,
        },
        {
            source: '/(.*)',
            destination: '/',
        },
    ],
};
