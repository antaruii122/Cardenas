# Async Error Handling

Asynchronous code introduces unique error handling challenges. This guide covers best practices for Promise-based and async/await code.

## Common Pitfalls

### 1. Unhandled Promise Rejections
```typescript
// ❌ Bad: Silent failure
async function fetchData() {
  fetch('/api/data'); // No await, no .catch()
}

// ✅ Good: Proper handling
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    logger.error("Failed to fetch data", { error });
    throw new ExternalServiceError("API", "Failed to fetch data");
  }
}
```

### 2. Lost Errors in Promise.all
```typescript
// ❌ Bad: First error stops all
async function loadDashboard() {
  const [user, stats, posts] = await Promise.all([
    fetchUser(),
    fetchStats(),
    fetchPosts()
  ]); // If fetchUser fails, stats and posts never complete
}

// ✅ Good: Handle failures independently
async function loadDashboard() {
  const results = await Promise.allSettled([
    fetchUser(),
    fetchStats(),
    fetchPosts()
  ]);
  
  const [userResult, statsResult, postsResult] = results;
  
  return {
    user: userResult.status === "fulfilled" ? userResult.value : null,
    stats: statsResult.status === "fulfilled" ? statsResult.value : DEFAULT_STATS,
    posts: postsResult.status === "fulfilled" ? postsResult.value : []
  };
}
```

### 3. Error Swallowing in Callbacks
```typescript
// ❌ Bad: Error lost in callback
async function processItems(items: Item[]) {
  items.forEach(async (item) => {
    await processItem(item); // Errors are swallowed
  });
}

// ✅ Good: Proper async iteration
async function processItems(items: Item[]) {
  await Promise.all(
    items.map(item => processItem(item))
  );
}

// ✅ Better: With error handling
async function processItems(items: Item[]) {
  const results = await Promise.allSettled(
    items.map(item => processItem(item))
  );
  
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map(r => r.reason);
  
  if (errors.length > 0) {
    logger.error("Some items failed to process", { count: errors.length });
  }
}
```

## Patterns for Async Error Handling

### 1. Async Error Wrapper
```typescript
type AsyncResult<T> = Promise<{
  data?: T;
  error?: Error;
}>;

async function safeAsync<T>(
  operation: () => Promise<T>
): AsyncResult<T> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    return { error: error as Error };
  }
}

// Usage
const { data, error } = await safeAsync(() => fetchUser(userId));
if (error) {
  // Handle error
}
```

### 2. Timeout Wrapper
```typescript
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError?: Error
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(timeoutError || new Error("Operation timed out")),
        timeoutMs
      )
    )
  ]);
}

// Usage
const data = await withTimeout(
  fetch('/api/slow-endpoint'),
  5000,
  new ExternalServiceError("API", "Request timeout")
);
```

### 3. Concurrent Operations with Error Tracking
```typescript
interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  duration: number;
}

async function executeWithTracking<T>(
  operation: () => Promise<T>
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
      error: error as Error,
      duration: Date.now() - start
    };
  }
}

async function batchOperations<T>(
  operations: Array<() => Promise<T>>
): Promise<OperationResult<T>[]> {
  return Promise.all(
    operations.map(op => executeWithTracking(op))
  );
}
```

### 4. Queue with Error Handling
```typescript
class AsyncQueue<T> {
  private queue: Array<() => Promise<T>> = [];
  private processing = false;
  private results: T[] = [];
  private errors: Error[] = [];
  
  add(operation: () => Promise<T>): void {
    this.queue.push(operation);
  }
  
  async processAll(
    options: {
      concurrency?: number;
      continueOnError?: boolean;
    } = {}
  ): Promise<{ results: T[]; errors: Error[] }> {
    const { concurrency = 1, continueOnError = true } = options;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, concurrency);
      const promises = batch.map(async (operation) => {
        try {
          const result = await operation();
          this.results.push(result);
        } catch (error) {
          this.errors.push(error as Error);
          if (!continueOnError) {
            throw error;
          }
        }
      });
      
      await Promise.all(promises);
    }
    
    return {
      results: this.results,
      errors: this.errors
    };
  }
}

// Usage
const queue = new AsyncQueue<ProcessedItem>();
items.forEach(item => {
  queue.add(() => processItem(item));
});
const { results, errors } = await queue.processAll({ concurrency: 5 });
```

## React-Specific Error Handling

### 1. Error Boundaries
```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <details>
            {this.state.error?.message}
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 2. Async Hook with Error Handling
```typescript
import { useState, useEffect } from 'react';

interface AsyncState<T> {
  data?: T;
  loading: boolean;
  error?: Error;
}

function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    loading: true
  });
  
  useEffect(() => {
    let cancelled = false;
    
    setState({ loading: true });
    
    asyncFunction()
      .then(data => {
        if (!cancelled) {
          setState({ data, loading: false });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ error, loading: false });
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, dependencies);
  
  return state;
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useAsync(
    () => fetchUser(userId),
    [userId]
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;
  
  return <div>{data.name}</div>;
}
```

### 3. API Error Handler Hook
```typescript
import { useCallback } from 'react';

function useApiError() {
  const handleError = useCallback((error: unknown) => {
    if (error instanceof ValidationError) {
      // Show validation errors in form
      return { type: 'validation', fields: error.details };
    }
    
    if (error instanceof UnauthorizedError) {
      // Redirect to login
      window.location.href = '/login';
      return { type: 'auth' };
    }
    
    if (error instanceof ExternalServiceError) {
      // Show service unavailable message
      return { type: 'service', message: 'Service temporarily unavailable' };
    }
    
    // Generic error
    return { type: 'generic', message: 'An unexpected error occurred' };
  }, []);
  
  return { handleError };
}
```

## Best Practices

1. **Always await or return promises** in async functions
2. **Use Promise.allSettled** when you need all results regardless of failures
3. **Set timeouts** for external calls
4. **Track operation results** for better debugging
5. **Use Error Boundaries** in React for component errors
6. **Cancel pending operations** when components unmount
7. **Implement retry logic** for transient failures
8. **Log async errors** with context (operation name, parameters, timing)
