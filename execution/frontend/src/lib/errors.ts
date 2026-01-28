/**
 * Custom Error Hierarchy for Application
 * 
 * Provides a robust, type-safe error handling system with:
 * - Consistent error structure
 * - Error codes for API consumers
 * - HTTP status code mapping
 * - Contextual details
 * - Timestamps for debugging
 */

/**
 * Base application error class
 * All custom errors should extend from this class
 */
export class ApplicationError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details: Record<string, any>;
    public readonly timestamp: Date;

    constructor(
        message: string,
        code: string,
        statusCode: number = 500,
        details: Record<string, any> = {}
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date();

        // Maintains proper stack trace for where error was thrown (V8 only)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Convert error to JSON-serializable format
     */
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: this.timestamp.toISOString(),
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
        };
    }

    /**
     * Get user-friendly error message (for UI display)
     */
    getUserMessage(): string {
        return this.message;
    }
}

/**
 * Validation Error
 * For user input validation failures
 */
export class ValidationError extends ApplicationError {
    constructor(
        message: string,
        field?: string,
        details: Record<string, any> = {}
    ) {
        super(
            message,
            'VALIDATION_ERROR',
            400,
            { ...details, ...(field && { field }) }
        );
    }

    getUserMessage(): string {
        return this.message;
    }
}

/**
 * Not Found Error
 * For missing resources
 */
export class NotFoundError extends ApplicationError {
    constructor(resource: string, id?: string) {
        super(
            id ? `${resource} not found with ID: ${id}` : `${resource} not found`,
            'NOT_FOUND',
            404,
            { resource, ...(id && { id }) }
        );
    }

    getUserMessage(): string {
        return "We couldn't find what you're looking for";
    }
}

/**
 * Unauthorized Error
 * For authentication failures
 */
export class UnauthorizedError extends ApplicationError {
    constructor(message: string = 'Authentication required') {
        super(message, 'UNAUTHORIZED', 401);
    }

    getUserMessage(): string {
        return 'Please log in to continue';
    }
}

/**
 * Forbidden Error
 * For authorization failures (user is authenticated but lacks permissions)
 */
export class ForbiddenError extends ApplicationError {
    constructor(message: string = 'Access denied', action?: string) {
        super(
            message,
            'FORBIDDEN',
            403,
            { ...(action && { action }) }
        );
    }

    getUserMessage(): string {
        return "You don't have permission to perform this action";
    }
}

/**
 * Conflict Error
 * For resource conflicts (e.g., duplicate entries)
 */
export class ConflictError extends ApplicationError {
    constructor(message: string, details: Record<string, any> = {}) {
        super(message, 'CONFLICT', 409, details);
    }

    getUserMessage(): string {
        return this.message;
    }
}

/**
 * External Service Error
 * For failures when calling external APIs/services
 */
export class ExternalServiceError extends ApplicationError {
    constructor(
        service: string,
        message: string,
        originalError?: Error,
        details: Record<string, any> = {}
    ) {
        super(
            `${service} error: ${message}`,
            'EXTERNAL_SERVICE_ERROR',
            503,
            {
                service,
                ...details,
                ...(originalError && {
                    originalError: originalError.message,
                    originalStack: originalError.stack
                })
            }
        );
    }

    getUserMessage(): string {
        return 'Service temporarily unavailable. Please try again later';
    }
}

/**
 * Database Error
 * For database operation failures
 */
export class DatabaseError extends ApplicationError {
    constructor(
        operation: string,
        message: string,
        originalError?: Error,
        details: Record<string, any> = {}
    ) {
        super(
            `Database ${operation} failed: ${message}`,
            'DATABASE_ERROR',
            500,
            {
                operation,
                ...details,
                ...(originalError && {
                    originalError: originalError.message
                })
            }
        );
    }

    getUserMessage(): string {
        return 'A database error occurred. Please try again';
    }
}

/**
 * File Upload Error
 * For file upload/processing failures
 */
export class FileUploadError extends ApplicationError {
    constructor(
        message: string,
        filename?: string,
        details: Record<string, any> = {}
    ) {
        super(
            message,
            'FILE_UPLOAD_ERROR',
            400,
            { ...details, ...(filename && { filename }) }
        );
    }

    getUserMessage(): string {
        return this.message;
    }
}

/**
 * Rate Limit Error
 * For API rate limit violations
 */
export class RateLimitError extends ApplicationError {
    constructor(
        message: string = 'Too many requests',
        retryAfter?: number
    ) {
        super(
            message,
            'RATE_LIMIT_ERROR',
            429,
            { ...(retryAfter && { retryAfter }) }
        );
    }

    getUserMessage(): string {
        const retryAfter = this.details.retryAfter;
        if (retryAfter) {
            return `Too many requests. Please try again in ${retryAfter} seconds`;
        }
        return 'Too many requests. Please try again later';
    }
}

/**
 * Data Processing Error
 * For errors during data transformation/calculation
 */
export class DataProcessingError extends ApplicationError {
    constructor(
        message: string,
        step?: string,
        details: Record<string, any> = {}
    ) {
        super(
            message,
            'DATA_PROCESSING_ERROR',
            422,
            { ...details, ...(step && { step }) }
        );
    }

    getUserMessage(): string {
        return 'Failed to process data. Please check your input';
    }
}

/**
 * Type guard to check if an error is an ApplicationError
 */
export function isApplicationError(error: unknown): error is ApplicationError {
    return error instanceof ApplicationError;
}

/**
 * Convert unknown error to ApplicationError
 */
export function toApplicationError(error: unknown): ApplicationError {
    if (isApplicationError(error)) {
        return error;
    }

    if (error instanceof Error) {
        return new ApplicationError(
            error.message,
            'UNKNOWN_ERROR',
            500,
            { originalName: error.name }
        );
    }

    return new ApplicationError(
        'An unexpected error occurred',
        'UNKNOWN_ERROR',
        500,
        { error: String(error) }
    );
}
