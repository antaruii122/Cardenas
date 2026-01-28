/**
 * Example Implementations of Error Handling Patterns
 * 
 * This file demonstrates how to use the error handling utilities
 */

import { NextResponse } from 'next/server';
import {
    ApplicationError,
    ValidationError,
    FileUploadError,
    DataProcessingError,
    ExternalServiceError
} from '@/lib/errors';
import { withErrorHandler, validateBody, findOrFail } from '@/lib/api-error-handler';
import { retryWithBackoff, isRetryableError, batchProcess } from '@/lib/async-utils';
import { Ok, Err, Result, tryCatchAsync } from '@/lib/result';

// ==================== Example 1: API Route with Error Handling ====================

/**
 * Example: GET /api/users/[id]
 */
export const GET = withErrorHandler(async (request, { params }) => {
    const userId = params.id;

    // Find user or throw NotFoundError
    const user = await findOrFail(
        async () => {
            // Simulated database call
            return userId === '123' ? { id: userId, name: 'John Doe' } : null;
        },
        'User',
        userId
    );

    return NextResponse.json(user);
});

/**
 * Example: POST /api/users with validation
 */
interface CreateUserBody {
    email: string;
    name: string;
}

function validateCreateUser(data: unknown): CreateUserBody {
    const body = data as Partial<CreateUserBody>;

    if (!body.email || !body.email.includes('@')) {
        throw new ValidationError('Valid email is required', 'email');
    }

    if (!body.name || body.name.length < 2) {
        throw new ValidationError('Name must be at least 2 characters', 'name');
    }

    return body as CreateUserBody;
}

export const POST = withErrorHandler(async (request) => {
    // Validate request body
    const body = await validateBody(request, validateCreateUser);

    // Create user
    const user = {
        id: Math.random().toString(36).substring(7),
        ...body
    };

    return NextResponse.json(user, { status: 201 });
});

// ==================== Example 2: File Upload with Error Handling ====================

/**
 * Example: Process uploaded Excel file
 */
export async function processFinancialUpload(
    file: File
): Promise<Result<FinancialData, ApplicationError>> {
    // Validate file size
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
        return Err(
            new FileUploadError(
                'File size exceeds 10MB limit',
                file.name,
                { size: file.size, maxSize: MAX_SIZE }
            )
        );
    }

    // Validate file type
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
        return Err(
            new FileUploadError(
                'Invalid file type. Please upload an Excel file',
                file.name,
                { type: file.type }
            )
        );
    }

    // Process file with error handling
    return tryCatchAsync(
        async () => {
            // Simulated file processing
            const data = await parseExcelFile(file);
            return validateFinancialData(data);
        },
        (error) => {
            if (error instanceof ValidationError || error instanceof DataProcessingError) {
                return error;
            }
            return new FileUploadError(
                'Failed to process file',
                file.name,
                { error: error instanceof Error ? error.message : String(error) }
            );
        }
    );
}

interface FinancialData {
    type: 'P&L' | 'Balance Sheet';
    rows: any[];
}

async function parseExcelFile(file: File): Promise<any> {
    // Simulated parser
    return { data: [] };
}

function validateFinancialData(data: any): FinancialData {
    if (!data || !data.data || !Array.isArray(data.data)) {
        throw new DataProcessingError(
            'Invalid file structure',
            'parse',
            { receivedType: typeof data }
        );
    }

    // More validation...
    return {
        type: 'P&L',
        rows: data.data
    };
}

// ==================== Example 3: External API Call with Retry ====================

/**
 * Example: Fetch data from external API with retry
 */
export async function fetchExternalData(
    endpoint: string
): Promise<any> {
    return retryWithBackoff(
        async () => {
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new ExternalServiceError(
                    'External API',
                    `HTTP ${response.status}: ${response.statusText}`,
                    undefined,
                    { endpoint, status: response.status }
                );
            }

            return response.json();
        },
        {
            maxAttempts: 3,
            shouldRetry: isRetryableError,
            onRetry: (attempt, error) => {
                console.log(`Retry attempt ${attempt} after error:`, error.message);
            }
        }
    );
}

// ==================== Example 4: Batch Processing with Error Handling ====================

/**
 * Example: Process multiple items with error aggregation
 */
export async function processMultipleRecords(
    records: Array<{ id: string; data: any }>
): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ id: string; error: ApplicationError }>;
}> {
    const { results, errors } = await batchProcess(
        records,
        async (record) => {
            // Validate record
            if (!record.data) {
                throw new ValidationError('Record data is required', undefined, { id: record.id });
            }

            // Process record
            return await processRecord(record);
        },
        {
            concurrency: 5,
            continueOnError: true,
            onProgress: (completed, total) => {
                console.log(`Processed ${completed}/${total} records`);
            }
        }
    );

    return {
        successful: results.filter(r => r !== undefined).length,
        failed: errors.length,
        errors: errors.map(e => ({
            id: records[e.index].id,
            error: e.error
        }))
    };
}

async function processRecord(record: any): Promise<any> {
    // Simulated processing
    return { ...record, processed: true };
}

// ==================== Example 5: React Component with Error Handling ====================

/**
 * Example React component using error handling hooks
 */
import { useAsync, useApiError } from '@/hooks/useErrorHandling';
import { useEffect } from 'react';

export function UserProfile({ userId }: { userId: string }) {
    const { data: user, loading, error, execute } = useAsync(
        async (id: string) => {
            const response = await fetch(`/api/users/${id}`);
            if (!response.ok) {
                throw new ApplicationError(
                    'Failed to load user',
                    'USER_LOAD_FAILED',
                    response.status
                );
            }
            return response.json();
        },
        { retry: true }
    );

    const { showError, ErrorDisplay } = useApiError();

    useEffect(() => {
        execute(userId);
    }, [userId, execute]);

    useEffect(() => {
        if (error) {
            showError(error);
        }
    }, [error, showError]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {ErrorDisplay}
            {user && (
                <div>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                </div>
            )}
        </div>
    );
}

// ==================== Example 6: Form with Validation ====================

import { useFormValidation } from '@/hooks/useErrorHandling';

export function CreateUserForm() {
    const { errors, validate, clearErrors } = useFormValidation();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearErrors();

        const formData = new FormData(event.currentTarget);
        const data = {
            email: formData.get('email') as string,
            name: formData.get('name') as string
        };

        try {
            // Validate on client side
            validateCreateUser(data);

            // Submit to API
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new ApplicationError(
                    error.error.message,
                    error.error.code,
                    response.status,
                    error.error.details
                );
            }

            // Success!
            console.log('User created successfully');
        } catch (error) {
            if (error instanceof ValidationError) {
                validate(error);
            } else {
                console.error('Failed to create user:', error);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                    <p className="text-red-600 text-sm">{errors.email}</p>
                )}
            </div>

            <div>
                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                    <p className="text-red-600 text-sm">{errors.name}</p>
                )}
            </div>

            {errors._general && (
                <p className="text-red-600">{errors._general}</p>
            )}

            <button type="submit">Create User</button>
        </form>
    );
}
