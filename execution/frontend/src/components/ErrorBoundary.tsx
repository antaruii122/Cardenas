/**
 * React Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { ApplicationError, toApplicationError } from '@/lib/errors';

interface Props {
    children: ReactNode;
    fallback?: ReactNode | ((error: ApplicationError, reset: () => void) => ReactNode);
    onError?: (error: ApplicationError, errorInfo: React.ErrorInfo) => void;
    isolate?: boolean; // If true, only this component tree fails, not entire app
}

interface State {
    hasError: boolean;
    error?: ApplicationError;
}

/**
 * Error Boundary component
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error: toApplicationError(error)
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const appError = toApplicationError(error);

        // Log error
        console.error('Error caught by boundary:', {
            error: appError.toJSON(),
            errorInfo,
            componentStack: errorInfo.componentStack
        });

        // Call custom error handler if provided
        this.props.onError?.(appError, errorInfo);

        // TODO: Send to error tracking service (e.g., Sentry)
        // if (typeof window !== 'undefined' && window.Sentry) {
        //   window.Sentry.captureException(error, {
        //     contexts: { react: { componentStack: errorInfo.componentStack } }
        //   });
        // }
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            // Render custom fallback
            if (typeof this.props.fallback === 'function') {
                return this.props.fallback(this.state.error, this.resetError);
            }

            // Render provided fallback component
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Render default error UI
            return (
                <ErrorFallback
                    error={this.state.error}
                    reset={this.resetError}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Default Error Fallback UI
 */
interface ErrorFallbackProps {
    error: ApplicationError;
    reset: () => void;
}

function ErrorFallback({ error, reset }: ErrorFallbackProps) {
    const isProduction = process.env.NODE_ENV === 'production';

    return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <svg
                            className="w-6 h-6 text-red-600 dark:text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                            Something went wrong
                        </h3>

                        <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                            {error.getUserMessage()}
                        </p>

                        {!isProduction && (
                            <details className="mb-4 text-xs">
                                <summary className="cursor-pointer text-red-700 dark:text-red-300 font-medium mb-2">
                                    Technical Details (Development Only)
                                </summary>
                                <div className="bg-red-100 dark:bg-red-950/40 rounded p-3 font-mono text-red-900 dark:text-red-100 overflow-auto">
                                    <div className="mb-2">
                                        <strong>Error:</strong> {error.name}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Code:</strong> {error.code}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Message:</strong> {error.message}
                                    </div>
                                    {Object.keys(error.details).length > 0 && (
                                        <div className="mb-2">
                                            <strong>Details:</strong>
                                            <pre className="mt-1 text-xs overflow-auto">
                                                {JSON.stringify(error.details, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        <button
                            onClick={reset}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook to reset error boundary from child components
 */
export function useErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    const handleError = React.useCallback((error: Error) => {
        setError(error);
    }, []);

    const reset = React.useCallback(() => {
        setError(null);
    }, []);

    return { handleError, reset };
}
