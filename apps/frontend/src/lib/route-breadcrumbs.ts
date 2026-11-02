export type AppRouteHandle = {
    breadcrumb: string | ((loaderData: unknown) => string);
    to?: string;
};
