# Error Handling Implementation Guide

This guide shows you how to use the error handling patterns in your application.

## Quick Start

### 1. Use Error Classes

```typescript
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  FileUploadError
} from '@/lib/errors';

// Throw specific errors
throw new ValidationError('Email is required', 'email');
throw new NotFoundError('User', userId);
throw new UnauthorizedError();
```

### 2. Handle Errors in API Routes

```typescript
import { withErrorHandler } from '@/lib/api-error-handler';

export const GET = withErrorHandler(async (request) => {
  // Your code here
  // Errors are automatically caught and formatted
});
```

### 3. Use Result Type for Expected Errors

```typescript
import { Ok, Err, Result } from '@/lib/result';

function parseData(input: string): Result<Data, ValidationError> {
  if (!input) {
    return Err(new ValidationError('Input is required'));
  }
  
  return Ok(parseJSON(input));
}

// Use the result
const result = parseData(userInput);
if (result.ok) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

### 4. Add Error Boundary to React Components

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Layout({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

### 5. Use Error Handling Hooks

```typescript
import { useAsync, useApiError } from '@/hooks/useErrorHandling';

function MyComponent() {
  const { data, loading, error, execute } = useAsync(fetchData);
  const { showError, ErrorDisplay } = useApiError();
  
  useEffect(() => {
    execute();
  }, []);
  
  if (error) showError(error);
  
  return <div>{ErrorDisplay}</div>;
}
```

## Common Patterns

### File Upload Error Handling

```typescript
import { FileUploadError } from '@/lib/errors';

async function handleFileUpload(file: File) {
  if (file.size > MAX_SIZE) {
    throw new FileUploadError(
      `File size exceeds ${MAX_SIZE}MB`,
      file.name,
      { size: file.size }
    );
  }
  
  // Process file...
}
```

### API Retry with Backoff

```typescript
import { retryWithBackoff, isRetryableError } from '@/lib/async-utils';

const data = await retryWithBackoff(
  () => fetch('/api/data').then(r => r.json()),
  {
    maxAttempts: 3,
    shouldRetry: isRetryableError
  }
);
```

### Form Validation

```typescript
import { useFormValidation } from '@/hooks/useErrorHandling';
import { ValidationError } from '@/lib/errors';

function MyForm() {
  const { errors, validate, clearErrors } = useFormValidation();
  
  const handleSubmit = async (data) => {
    clearErrors();
    try {
      await submitForm(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        validate(error);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {errors.email && <span>{errors.email}</span>}
      {/* ... */}
    </form>
  );
}
```

### Batch Processing

```typescript
import { batchProcess } from '@/lib/async-utils';

const { results, errors } = await batchProcess(
  items,
  async (item) => processItem(item),
  {
    concurrency: 5,
    continueOnError: true
  }
);
```

## Integration Checklist

- [ ] Add ErrorBoundary to root layout
- [ ] Update API routes to use withErrorHandler
- [ ] Replace try-catch with Result types where appropriate
- [ ] Add retry logic for external API calls
- [ ] Implement form validation with useFormValidation
- [ ] Add error tracking service (Sentry, etc.)
- [ ] Test error scenarios

## Next Steps

1. Integrate error tracking service (Sentry, LogRocket, etc.)
2. Add monitoring dashboards for error rates
3. Create runbook for common errors
4. Set up alerts for critical errors
5. Review and update error messages for clarity

## See Also

- `examples/error-handling-examples.tsx` - Complete examples
- `.agent/skills/error-handling-patterns/SKILL.md` - Full documentation
- `.agent/skills/error-handling-patterns/assets/error-handling-checklist.md` - Review checklist
