export function parseResponse<T>(
    payload: unknown,
    schema: { safeParse: (input: unknown) => { success: true; data: T } | { success: false } }
): T {
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
        throw new Error('The server returned an invalid response.');
    }
    return parsed.data;
}

export function searchSuffix(search?: string): string {
    const query = search?.trim();
    return query ? `?search=${encodeURIComponent(query)}` : '';
}
