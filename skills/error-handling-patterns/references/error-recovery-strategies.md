# Error Recovery Strategies

Different types of errors require different recovery approaches. This guide helps you choose the right strategy.

## Strategy Matrix

| Error Type | Strategy | Example |
|------------|----------|---------|
| Transient network | Retry with backoff | API timeout |
| Invalid input | Fail fast, validate early | Bad user data |
| Missing resource | Return default or 404 | File not found |
| External service down | Circuit breaker | Payment gateway |
| Data corruption | Compensating transaction | Database inconsistency |
| Unexpected bug | Log, alert, graceful degradation | Null pointer |

## 1. Retry Strategies

### Simple Retry
```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) throw error;
    }
  }
  
  throw lastError!;
}
```

### Exponential Backoff
```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000;
      await sleep(delay + jitter);
    }
  }
  
  throw new Error("Max attempts reached");
}
```

### Conditional Retry
Only retry on specific errors:

```typescript
function isRetryable(error: Error): boolean {
  if (error instanceof ExternalServiceError) {
    return [503, 429, 408].includes(error.statusCode);
  }
  return false;
}

async function smartRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryable(error as Error) || attempt === maxAttempts) {
        throw error;
      }
      await sleep(1000 * attempt);
    }
  }
  
  throw new Error("Unreachable");
}
```

## 2. Circuit Breaker

Prevent cascading failures by stopping requests to failing services:

```typescript
enum CircuitState {
  CLOSED,  // Normal operation
  OPEN,    // Blocking requests
  HALF_OPEN // Testing recovery
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailTime?: number;
  
  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailTime! > this.recoveryTimeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }
  
  private onFailure() {
    this.failureCount++;
    this.lastFailTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }
}
```

## 3. Fallback Patterns

### Default Values
```typescript
function getUserPreferences(userId: string): Preferences {
  try {
    return loadPreferences(userId);
  } catch (error) {
    logger.warn("Failed to load preferences, using defaults", { userId, error });
    return DEFAULT_PREFERENCES;
  }
}
```

### Cached Data
```typescript
async function getDataWithFallback<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const data = await fetcher();
    await cache.set(key, data);
    return data;
  } catch (error) {
    const cached = await cache.get(key);
    if (cached) {
      logger.warn("Using cached data due to fetch error", { key, error });
      return cached;
    }
    throw error;
  }
}
```

### Graceful Degradation
```typescript
async function renderDashboard(userId: string) {
  const [user, stats, notifications] = await Promise.allSettled([
    fetchUser(userId),
    fetchStats(userId),
    fetchNotifications(userId)
  ]);
  
  return {
    user: user.status === "fulfilled" ? user.value : null,
    stats: stats.status === "fulfilled" ? stats.value : DEFAULT_STATS,
    notifications: notifications.status === "fulfilled" ? notifications.value : []
  };
}
```

## 4. Compensation Transactions

For distributed systems, undo operations when later steps fail:

```typescript
class SagaOrchestrator {
  private compensations: Array<() => Promise<void>> = [];
  
  async execute<T>(
    step: () => Promise<T>,
    compensate: () => Promise<void>
  ): Promise<T> {
    try {
      const result = await step();
      this.compensations.unshift(compensate); // Add to front
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
  
  private async rollback() {
    for (const compensate of this.compensations) {
      try {
        await compensate();
      } catch (error) {
        logger.error("Compensation failed", { error });
      }
    }
  }
}

// Usage
async function processOrder(order: Order) {
  const saga = new SagaOrchestrator();
  
  const payment = await saga.execute(
    () => chargePayment(order),
    () => refundPayment(order)
  );
  
  const inventory = await saga.execute(
    () => reserveInventory(order),
    () => releaseInventory(order)
  );
  
  const shipment = await saga.execute(
    () => createShipment(order),
    () => cancelShipment(order)
  );
  
  return { payment, inventory, shipment };
}
```

## 5. Error Aggregation

Collect multiple errors instead of failing on the first:

```typescript
class ErrorCollector {
  private errors: Error[] = [];
  
  add(error: Error): void {
    this.errors.push(error);
  }
  
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
  
  throw(): never {
    if (this.errors.length === 1) {
      throw this.errors[0];
    }
    throw new AggregateError(
      this.errors,
      `${this.errors.length} errors occurred`
    );
  }
}

// Usage for form validation
function validateForm(data: FormData): ValidationResult {
  const collector = new ErrorCollector();
  
  if (!data.email) collector.add(new ValidationError("Email required", "email"));
  if (!data.name) collector.add(new ValidationError("Name required", "name"));
  
  if (collector.hasErrors()) {
    collector.throw();
  }
  
  return { valid: true };
}
```

## Choosing the Right Strategy

1. **Network errors** → Retry with backoff
2. **Service unavailable** → Circuit breaker
3. **Optional features** → Graceful degradation
4. **User input** → Fail fast with validation
5. **Multi-step transactions** → Compensation
6. **Batch operations** → Error aggregation
