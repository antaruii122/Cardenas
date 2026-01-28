/**
 * API Route Error Handler
 * 
 * Standardized error handling for Next.js API routes
 */

import { NextResponse } from 'next/server';
import {
    ApplicationError,
    ValidationError,
    UnauthorizedError,
    NotFoundError,
    toApplicationError
} from '@/lib/errors';

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
        details?: Record<string, any>;
        timestamp: string;
    };
}

/**
 * Wrap API route handlers with error handling
 * 
 * @example
 * export const GET = withErrorHandler(async (request) => {
 *   const data = await fetchData();
 *   return NextResponse.json(data);
 * });
 */
export function withErrorHandler<T = any>(
    handler: (request: Request, context?: any) => Promise<NextResponse<T>>
) {
    return async (request: Request, context?: any): Promise<NextResponse> => {
        try {
            return await handler(request, context);
        } catch (error) {
            return handleApiError(error);
        }
    };
}

/**
 * Convert errors to standardized API error responses
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
    const appError = toApplicationError(error);

    // Log error
    console.error('API Error:', {
        code: appError.code,
        message: appError.message,
        statusCode: appError.statusCode,
        details: appError.details,
        stack: process.env.NODE_ENV === 'development' ? appError.stack : undefined
    });

    // TODO: Send to error tracking service
    // if (appError.statusCode >= 500) {
    //   sendToErrorTracking(appError);
    // }

    const response: ApiErrorResponse = {
        error: {
            code: appError.code,
            message: appError.getUserMessage(),
            ...(process.env.NODE_ENV === 'development' && {
                details: {
                    ...appError.details,
                    originalMessage: appError.message,
                    stack: appError.stack
                }
            }),
            timestamp: appError.timestamp.toISOString()
        }
    };

    return NextResponse.json(response, {
        status: appError.statusCode
    });
}

/**
 * Validate request body with Zod or custom validator
 * 
 * @example
 * const body = await validateBody(request, userSchema);
 */
export async function validateBody<T>(
    request: Request,
    validator: (data: unknown) => T
): Promise<T> {
    try {
        const body = await request.json();
        return validator(body);
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new ValidationError('Invalid JSON in request body');
        }
        throw error;
    }
}

/**
 * Require authentication
 * 
 * @example
 * const user = await requireAuth(request);
 */
export async function requireAuth(request: Request): Promise<{ userId: string }> {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // TODO: Implement actual token verification
    // For now, this is a placeholder
    if (!token) {
        throw new UnauthorizedError('Invalid token');
    }

    return { userId: 'user-id-from-token' };
}

/**
 * Parse and validate query parameters
 * 
 * @example
 * const { page, limit } = parseQueryParams(request, {
 *   page: (v) => parseInt(v) || 1,
 *   limit: (v) => Math.min(parseInt(v) || 10, 100)
 * });
 */
export function parseQueryParams<T extends Record<string, any>>(
    request: Request,
    parsers: { [K in keyof T]: (value: string) => T[K] }
): T {
    const url = new URL(request.url);
    const result = {} as T;

    for (const [key, parser] of Object.entries(parsers)) {
        const value = url.searchParams.get(key);
        if (value !== null) {
            try {
                result[key as keyof T] = parser(value);
            } catch (error) {
                throw new ValidationError(
                    `Invalid query parameter: ${key}`,
                    key,
                    { value, error: error instanceof Error ? error.message : String(error) }
                );
            }
        }
    }

    return result;
}

/**
 * Check if resource exists, throw NotFoundError if not
 * 
 * @example
 * const user = await findOrFail(
 *   () => db.user.findById(userId),
 *   'User',
 *   userId
 * );
 */
export async function findOrFail<T>(
    finder: () => Promise<T | null | undefined>,
    resourceName: string,
    id?: string
): Promise<T> {
    const resource = await finder();

    if (!resource) {
        throw new NotFoundError(resourceName, id);
    }

    return resource;
}
