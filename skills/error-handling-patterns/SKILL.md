---
name: error-handling-patterns
description: Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications. Use when implementing error handling, designing APIs, or improving application reliability.
---

# Error Handling Patterns

Build resilient applications with robust error handling strategies that gracefully handle failures and provide excellent debugging experiences.

## When to Use This Skill
- Implementing error handling in new features
- Designing error-resilient APIs
- Debugging production issues
- Improving application reliability
- Creating better error messages for users and developers
- Implementing retry and circuit breaker patterns
- Handling async/concurrent errors
- Building fault-tolerant distributed systems

## Core Concepts

### 1. Error Handling Philosophies
**Exceptions vs Result Types:**
- **Exceptions:** Traditional try-catch, disrupts control flow (Unexpected errors, exceptional conditions)
- **Result Types:** Explicit success/failure, functional approach (Expected errors, validation failures)
- **Error Codes:** C-style, requires discipline
- **Option/Maybe Types:** For nullable values
- **Panics/Crashes:** Unrecoverable errors, programming bugs

### 2. Error Categories
**Recoverable Errors:**
- Network timeouts, Missing files, Invalid user input, API rate limits

**Unrecoverable Errors:**
- Out of memory, Stack overflow, Programming bugs (null pointer, etc.)

## Language-Specific Patterns

### Python Error Handling

<details>
<summary>Custom Exception Hierarchy</summary>

```python
class ApplicationError(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()

class ValidationError(ApplicationError):
    """Raised when validation fails."""
    pass

class NotFoundError(ApplicationError):
    """Raised when resource not found."""
    pass

class ExternalServiceError(ApplicationError):
    """Raised when external service fails."""
    def __init__(self, message: str, service: str, **kwargs):
        super().__init__(message, **kwargs)
        self.service = service

# Usage
def get_user(user_id: str) -> User:
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise NotFoundError(
            f"User not found",
            code="USER_NOT_FOUND",
            details={"user_id": user_id}
        )
    return user
```
</details>

<details>
<summary>Context Managers for Cleanup</summary>

```python
from contextlib import contextmanager

@contextmanager
def database_transaction(session):
    """Ensure transaction is committed or rolled back."""
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()
```
</details>

<details>
<summary>Retry with Exponential Backoff</summary>

```python
import time
from functools import wraps
from typing import TypeVar, Callable

T = TypeVar('T')

def retry(
    max_attempts: int = 3,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """Retry decorator with exponential backoff."""
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        sleep_time = backoff_factor ** attempt
                        time.sleep(sleep_time)
                        continue
                    raise
            raise last_exception
        return wrapper
    return decorator
```
</details>

### TypeScript/JavaScript Error Handling

<details>
<summary>Custom Error Classes</summary>

```typescript
class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}
```
</details>

<details>
<summary>Result Type Pattern</summary>

```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function Ok<T>(value: T): Result<T, never> { return { ok: true, value }; }
function Err<E>(error: E): Result<never, E> { return { ok: false, error }; }

function parseJSON<T>(json: string): Result<T, SyntaxError> {
  try {
    const value = JSON.parse(json) as T;
    return Ok(value);
  } catch (error) {
    return Err(error as SyntaxError);
  }
}
```
</details>

### Rust Error Handling
- Use `Result<T, E>` for recoverable errors.
- Use `Option<T>` for nullable values.
- Use `?` operator for error propagation.

### Go Error Handling
- Use explicit error returns `(value, error)`.
- Create custom error types implementing the `error` interface.
- Use `errors.Is` and `errors.As` for inspection.

## Universal Patterns

### Pattern 1: Circuit Breaker
Prevent cascading failures in distributed systems. (See Python implementation in `resources/` or docs).

### Pattern 2: Error Aggregation
Collect multiple errors instead of failing on first error (e.g., form validation).

### Pattern 3: Graceful Degradation
Provide fallback functionality when errors occur (e.g., Cache -> DB -> Default Value).

## Best Practices
1. **Fail Fast:** Validate input early.
2. **Preserve Context:** Include stack traces, metadata, timestamps.
3. **Meaningful Messages:** Explain *what* happened and *how* to fix it.
4. **Log Appropriately:** unexpected = log, expected = don't spam.
5. **Clean Up Resources:** Use `finally`, context managers, `defer`.

## Common Pitfalls
- Catching `Exception` too broadly.
- Empty catch blocks.
- Logging and re-throwing (duplicate logs).
- Returning error codes instead of types.

## Resources
- `references/exception-hierarchy-design.md`: Designing error class hierarchies
- `references/error-recovery-strategies.md`: Recovery patterns for different scenarios
- `references/async-error-handling.md`: Handling errors in concurrent code
- `assets/error-handling-checklist.md`: Review checklist for error handling
- `assets/error-message-guide.md`: Writing helpful error messages
- `scripts/error-analyzer.py`: Analyze error patterns in logs
