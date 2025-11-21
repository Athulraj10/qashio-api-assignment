export function getApiBaseUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === 'production'
            ? 'http://qashio-api:8000'
            : process.env.BACKEND_PORT ? `http://localhost:${process.env.BACKEND_PORT}` : 'http://localhost:8000');
}
