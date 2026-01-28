# Exception Hierarchy Design

A well-designed exception hierarchy makes error handling more maintainable and debugging easier.

## Principles

### 1. Single Root Exception
Create one base exception for your application:
```typescript
class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Benefits:**
- Catch all application errors with single type
- Easily distinguish from third-party errors
- Consistent error structure across application

### 2. Categorize by Domain
Group exceptions by feature domain, not by error type:

```typescript
// ✅ Good: Domain-based
class AuthenticationError extends ApplicationError {}
class PaymentError extends ApplicationError {}
class DataValidationError extends ApplicationError {}

// ❌ Bad: Type-based
class NetworkError extends ApplicationError {}
class DatabaseError extends ApplicationError {}
```

### 3. Specific Before Generic
Extend from specific to generic:

```typescript
class PaymentError extends ApplicationError {}
class PaymentInsufficientFundsError extends PaymentError {}
class PaymentGatewayTimeoutError extends PaymentError {}
```

This allows catching specific errors or broad categories:
```typescript
try {
  processPayment();
} catch (error) {
  if (error instanceof PaymentInsufficientFundsError) {
    // Handle specific case
  } else if (error instanceof PaymentError) {
    // Handle any payment error
  }
}
```

## Common Exception Categories

### Input/Validation Errors
```typescript
class ValidationError extends ApplicationError {
  constructor(message: string, public field?: string) {
    super(message, "VALIDATION_ERROR", 400, { field });
  }
}
```

### Resource Errors
```typescript
class NotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super(
      `${resource} not found`,
      "NOT_FOUND",
      404,
      { resource, id }
    );
  }
}

class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
  }
}
```

### Authorization Errors
```typescript
class UnauthorizedError extends ApplicationError {
  constructor(message: string = "Authentication required") {
    super(message, "UNAUTHORIZED", 401);
  }
}

class ForbiddenError extends ApplicationError {
  constructor(message: string = "Access denied") {
    super(message, "FORBIDDEN", 403);
  }
}
```

### External Service Errors
```typescript
class ExternalServiceError extends ApplicationError {
  constructor(
    service: string,
    message: string,
    public originalError?: Error
  ) {
    super(
      `${service} error: ${message}`,
      "EXTERNAL_SERVICE_ERROR",
      503,
      { service }
    );
  }
}
```

## Error Enrichment

Add context as errors bubble up:

```typescript
class ErrorContext {
  constructor(
    public operation: string,
    public metadata: Record<string, any> = {}
  ) {}
}

function withContext<T>(
  context: ErrorContext,
  fn: () => T
): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof ApplicationError) {
      error.details = {
        ...error.details,
        context: context.operation,
        ...context.metadata
      };
    }
    throw error;
  }
}

// Usage
withContext(
  new ErrorContext("ProcessPayment", { userId: "123" }),
  () => processPayment()
);
```

## Best Practices

1. **Keep hierarchy shallow** (2-3 levels max)
2. **Include error codes** for API consumers
3. **Map HTTP status codes** for web APIs
4. **Store contextual data** in details object
5. **Don't expose sensitive information** in error messages
6. **Make errors serializable** for logging/monitoring
