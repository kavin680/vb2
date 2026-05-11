/**
 * Pagination metadata returned by the backend for list endpoints.
 */
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Standard API Response Envelope
 *
 * Matches the backend `ResponseInterceptor` shape:
 * `{ success, statusCode, message, data, meta?, requestId?, timestamp }`.
 */
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    statusCode?: number;
    message?: string;
    meta?: PaginationMeta;
    requestId?: string;
    timestamp?: string;
    errors?: string[];
    excessiveData?: boolean;
}
