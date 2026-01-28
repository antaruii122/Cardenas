/**
 * Async Utilities for Error Handling
 * 
 * Provides utilities for handling async operations with retry logic,
 * timeouts, and proper error handling
 */

import { ApplicationError, toApplicationError } from './errors';

/**
 * Wrapper for async operations with automatic error handling
 */
export async function safeAsync<T>(
    operation: () => Promise<T>
): Promise<{ data?: T; error?: ApplicationError }> {
    try {
        const data = await operation();
        return { data };
    } catch (error) {
        return { error: toApplicationError(error) };
    }
}

/**
 * Add timeout to any promise
 */
export function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutError?: ApplicationError
): Promise<T> {
    const defaultError = new ApplicationError(
        `Operation timed out after ${timeoutMs}ms`,
        'TIMEOUT_ERROR',
        408
    );

    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(timeoutError || defaultError), timeoutMs)
        )
    ]);
}

/**
 * Retry configuration
 */
export interface RetryOptions {
    maxAttempts?: number;
    backoffFactor?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
    shouldRetry?: (error: Error) => boolean;
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxAttempts = 3,
        backoffFactor = 2,
        baseDelay = 1000,
        maxDelay = 30000,
        onRetry,
        shouldRetry = () => true
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;

            // Don't retry on last attempt or if retry not allowed
            if (attempt === maxAttempts - 1 || !shouldRetry(lastError)) {
                throw lastError;
            }

            // Calculate delay with exponential backoff and jitter
            const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt);
            const jitter = Math.random() * 1000;
            const delay = Math.min(exponentialDelay + jitter, maxDelay);

            onRetry?.(attempt + 1, lastError);

            await sleep(delay);
        }
    }

    throw lastError!;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
    if (error instanceof ApplicationError) {
        // Retry on service unavailable, timeout, rate limit
        return [503, 408, 429, 502, 504].includes(error.statusCode);
    }

    // Retry on network errors
    const message = error.message.toLowerCase();
    return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('econnreset') ||
        message.includes('enotfound')
    );
}

/**
 * Execute operations with tracking
 */
export interface OperationResult<T> {
    success: boolean;
    data?: T;
    error?: ApplicationError;
    duration: number;
}

export async function executeWithTracking<T>(
    operation: () => Promise<T>,
    operationName?: string
): Promise<OperationResult<T>> {
    const start = Date.now();

    try {
        const data = await operation();
        return {
            success: true,
            data,
            duration: Date.now() - start
        };
    } catch (error) {
        return {
            success: false,
            error: toApplicationError(error),
            duration: Date.now() - start
        };
    }
}

/**
 * Batch process items with error handling
 */
export interface BatchOptions {
    concurrency?: number;
    continueOnError?: boolean;
    onProgress?: (completed: number, total: number) => void;
}

export interface BatchResult<T> {
    results: T[];
    errors: Array<{ index: number; error: ApplicationError }>;
}

export async function batchProcess<T, U>(
    items: T[],
    processor: (item: T, index: number) => Promise<U>,
    options: BatchOptions = {}
): Promise<BatchResult<U>> {
    const {
        concurrency = 5,
        continueOnError = true,
        onProgress
    } = options;

    const results: U[] = [];
    const errors: Array<{ index: number; error: ApplicationError }> = [];
    let completed = 0;

    // Process in chunks based on concurrency
    for (let i = 0; i < items.length; i += concurrency) {
        const chunk = items.slice(i, i + concurrency);
        const chunkResults = await Promise.allSettled(
            chunk.map((item, chunkIndex) => processor(item, i + chunkIndex))
        );

        for (let j = 0; j < chunkResults.length; j++) {
            const result = chunkResults[j];
            const globalIndex = i + j;

            if (result.status === 'fulfilled') {
                results[globalIndex] = result.value;
            } else {
                const error = toApplicationError(result.reason);
                errors.push({ index: globalIndex, error });

                if (!continueOnError) {
                    throw error;
                }
            }

            completed++;
            onProgress?.(completed, items.length);
        }
    }

    return { results, errors };
}

/**
 * Debounce async function calls
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    delay: number
): T {
    let timeoutId: NodeJS.Timeout | null = null;
    let pendingPromise: Promise<any> | null = null;

    return ((...args: any[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        if (!pendingPromise) {
            pendingPromise = new Promise((resolve, reject) => {
                timeoutId = setTimeout(async () => {
                    try {
                        const result = await fn(...args);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    } finally {
                        pendingPromise = null;
                        timeoutId = null;
                    }
                }, delay);
            });
        }

        return pendingPromise;
    }) as T;
}

/**
 * Throttle async function calls
 */
export function throttleAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    limit: number
): T {
    let pending = false;

    return (async (...args: any[]) => {
        if (pending) {
            throw new ApplicationError(
                'Function is currently executing',
                'THROTTLED',
                429
            );
        }

        pending = true;
        try {
            const result = await fn(...args);
            return result;
        } finally {
            setTimeout(() => {
                pending = false;
            }, limit);
        }
    }) as T;
}
