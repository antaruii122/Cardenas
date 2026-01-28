/**
 * Custom React Hooks for Error Handling
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    ApplicationError,
    toApplicationError,
    ValidationError,
    UnauthorizedError
} from '@/lib/errors';
import { safeAsync, retryWithBackoff, isRetryableError } from '@/lib/async-utils';

/**
 * State for async operations
 */
export interface AsyncState<T> {
    data?: T;
    loading: boolean;
    error?: ApplicationError;
}

/**
 * Hook for handling async operations with loading and error states
 * 
 * @example
 * const { data, loading, error, execute } = useAsync(fetchUser);
 * 
 * useEffect(() => {
 *   execute(userId);
 * }, [userId]);
 */
export function useAsync<T, Args extends any[] = []>(
    asyncFunction: (...args: Args) => Promise<T>,
    options: {
        immediate?: boolean;
        retry?: boolean;
        onSuccess?: (data: T) => void;
        onError?: (error: ApplicationError) => void;
    } = {}
) {
    const [state, setState] = useState<AsyncState<T>>({
        loading: false
    });

    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const execute = useCallback(
        async (...args: Args) => {
            setState({ loading: true });

            const operation = () => asyncFunction(...args);
            const finalOperation = options.retry
                ? () => retryWithBackoff(operation, { shouldRetry: isRetryableError })
                : operation;

            const { data, error } = await safeAsync(finalOperation);

            if (!mountedRef.current) return;

            if (error) {
                setState({ loading: false, error });
                options.onError?.(error);
            } else {
                setState({ data, loading: false });
                options.onSuccess?.(data!);
            }

            return { data, error };
        },
        [asyncFunction, options.retry]
    );

    const reset = useCallback(() => {
        setState({ loading: false });
    }, []);

    return {
        ...state,
        execute,
        reset
    };
}

/**
 * Hook for handling API errors with user-friendly messages
 * 
 * @example
 * const { showError, ErrorDisplay } = useApiError();
 * 
 * try {
 *   await fetchData();
 * } catch (error) {
 *   showError(error);
 * }
 * 
 * return <div>{ErrorDisplay}</div>;
 */
export function useApiError() {
    const [error, setError] = useState<ApplicationError | null>(null);

    const showError = useCallback((error: unknown) => {
        const appError = toApplicationError(error);
        setError(appError);

        // Auto-dismiss after 5 seconds
        setTimeout(() => setError(null), 5000);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const ErrorDisplay = error ? (
        <div className= "rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 mb-4" >
        <div className="flex items-start gap-3" >
            <svg
          className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
    fill = "none"
    viewBox = "0 0 24 24"
    stroke = "currentColor"
        >
        <path
            strokeLinecap="round"
    strokeLinejoin = "round"
    strokeWidth = { 2}
    d = "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        </svg>
        < div className = "flex-1" >
            <p className="text-sm font-medium text-red-900 dark:text-red-100" >
                { error.getUserMessage() }
                </p>
    {
        process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-red-700 dark:text-red-300 mt-1" >
                { error.code }: { error.message }
        </p>
          )
    }
    </div>
        < button
    onClick = { clearError }
    className = "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
        >
        <svg className="w-4 h-4" fill = "none" viewBox = "0 0 24 24" stroke = "currentColor" >
            <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 2} d = "M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
                </div>
                </div>
  ) : null;

    return {
        error,
        showError,
        clearError,
        ErrorDisplay
    };
}

/**
 * Hook for form validation with error handling
 * 
 * @example
 * const { errors, validate, clearErrors } = useFormValidation();
 * 
 * const handleSubmit = async (data) => {
 *   clearErrors();
 *   try {
 *     await submitForm(data);
 *   } catch (error) {
 *     if (error instanceof ValidationError) {
 *       validate(error);
 *     }
 *   }
 * };
 */
export function useFormValidation() {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = useCallback((error: ValidationError) => {
        if (error.details.field) {
            setErrors({ [error.details.field]: error.message });
        } else if (error.details.fields) {
            // Multiple field errors
            setErrors(error.details.fields);
        } else {
            // General validation error
            setErrors({ _general: error.message });
        }
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const clearFieldError = useCallback((field: string) => {
        setErrors(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const hasErrors = Object.keys(errors).length > 0;

    return {
        errors,
        validate,
        clearErrors,
        clearFieldError,
        hasErrors
    };
}

/**
 * Hook for handling authentication errors
 * Automatically redirects to login on 401
 */
export function useAuthError() {
    const handleAuthError = useCallback((error: unknown) => {
        if (error instanceof UnauthorizedError) {
            // Store current path for redirect after login
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                window.location.href = '/login';
            }
        }
    }, []);

    return { handleAuthError };
}

/**
 * Hook for retrying failed operations
 * 
 * @example
 * const { retry, retrying, retryCount } = useRetry(fetchData);
 * 
 * {error && <button onClick={retry}>Retry</button>}
 */
export function useRetry<T>(
    operation: () => Promise<T>,
    options: {
        maxRetries?: number;
        onSuccess?: (data: T) => void;
        onError?: (error: ApplicationError) => void;
    } = {}
) {
    const [retrying, setRetrying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const { maxRetries = 3, onSuccess, onError } = options;

    const retry = useCallback(async () => {
        if (retryCount >= maxRetries) {
            onError?.(
                new ApplicationError(
                    'Maximum retry attempts reached',
                    'MAX_RETRIES_EXCEEDED',
                    429
                )
            );
            return;
        }

        setRetrying(true);
        setRetryCount(prev => prev + 1);

        const { data, error } = await safeAsync(operation);

        setRetrying(false);

        if (error) {
            onError?.(error);
        } else {
            setRetryCount(0);
            onSuccess?.(data!);
        }
    }, [operation, retryCount, maxRetries, onSuccess, onError]);

    const reset = useCallback(() => {
        setRetryCount(0);
        setRetrying(false);
    }, []);

    return {
        retry,
        retrying,
        retryCount,
        canRetry: retryCount < maxRetries,
        reset
    };
}
