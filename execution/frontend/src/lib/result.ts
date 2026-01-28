/**
 * Result Type Pattern
 * 
 * Provides explicit success/failure handling instead of exceptions
 * Useful for expected errors like validation or network failures
 */

/**
 * Result type that can be either Ok (success) or Err (failure)
 */
export type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };

/**
 * Create a successful Result
 */
export function Ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
}

/**
 * Create a failed Result
 */
export function Err<E>(error: E): Result<never, E> {
    return { ok: false, error };
}

/**
 * Type guard to check if Result is Ok
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
    return result.ok === true;
}

/**
 * Type guard to check if Result is Err
 */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
    return result.ok === false;
}

/**
 * Unwrap Result value or throw error
 */
export function unwrap<T, E>(result: Result<T, E>): T {
    if (isOk(result)) {
        return result.value;
    }
    throw result.error;
}

/**
 * Unwrap Result value or return default
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    if (isOk(result)) {
        return result.value;
    }
    return defaultValue;
}

/**
 * Map Result value with a function
 */
export function map<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => U
): Result<U, E> {
    if (isOk(result)) {
        return Ok(fn(result.value));
    }
    return result;
}

/**
 * Map Result error with a function
 */
export function mapErr<T, E, F>(
    result: Result<T, E>,
    fn: (error: E) => F
): Result<T, F> {
    if (isErr(result)) {
        return Err(fn(result.error));
    }
    return result;
}

/**
 * Chain Result operations
 */
export function andThen<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>
): Result<U, E> {
    if (isOk(result)) {
        return fn(result.value);
    }
    return result;
}

/**
 * Wrap a function that may throw into a Result
 */
export function tryCatch<T, E = Error>(
    fn: () => T,
    onError?: (error: unknown) => E
): Result<T, E> {
    try {
        return Ok(fn());
    } catch (error) {
        return Err(onError ? onError(error) : error as E);
    }
}

/**
 * Wrap an async function that may throw into a Result
 */
export async function tryCatchAsync<T, E = Error>(
    fn: () => Promise<T>,
    onError?: (error: unknown) => E
): Promise<Result<T, E>> {
    try {
        const value = await fn();
        return Ok(value);
    } catch (error) {
        return Err(onError ? onError(error) : error as E);
    }
}

/**
 * Combine multiple Results into one
 * All must be Ok for result to be Ok
 */
export function all<T extends readonly Result<any, any>[]>(
    results: T
): Result<
    { [K in keyof T]: T[K] extends Result<infer U, any> ? U : never },
    T[number] extends Result<any, infer E> ? E : never
> {
    const values: any[] = [];

    for (const result of results) {
        if (isErr(result)) {
            return result;
        }
        values.push(result.value);
    }

    return Ok(values as any);
}

/**
 * Practical example: Parse JSON safely
 */
export function parseJSON<T = unknown>(json: string): Result<T, SyntaxError> {
    return tryCatch(
        () => JSON.parse(json) as T,
        (error) => error as SyntaxError
    );
}

/**
 * Practical example: Safe number parsing
 */
export function parseNumber(value: string): Result<number, Error> {
    const num = Number(value);
    if (isNaN(num)) {
        return Err(new Error(`Invalid number: ${value}`));
    }
    return Ok(num);
}
