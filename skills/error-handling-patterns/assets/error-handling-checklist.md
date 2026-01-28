# Error Handling Checklist

Use this checklist when implementing or reviewing error handling code.

## Design Phase
- [ ] **Identified error categories**
  - [ ] Validation errors (user input)
  - [ ] Resource errors (not found, conflict)
  - [ ] Authorization errors (auth, permissions)
  - [ ] External service errors (APIs, databases)
  - [ ] System errors (out of memory, crashes)

- [ ] **Defined error hierarchy**
  - [ ] Base application error class exists
  - [ ] Domain-specific error classes created
  - [ ] Error codes assigned
  - [ ] HTTP status codes mapped (for APIs)

- [ ] **Planned recovery strategies**
  - [ ] Retry logic for transient failures
  - [ ] Circuit breaker for unreliable services
  - [ ] Fallback values for optional features
  - [ ] Graceful degradation path defined

## Implementation Phase

### Error Classes
- [ ] **Custom error classes include:**
  - [ ] Descriptive name
  - [ ] Error code
  - [ ] HTTP status (if applicable)
  - [ ] Details/context object
  - [ ] Timestamp
  - [ ] Proper stack trace

### Error Handling
- [ ] **Input validation happens early**
  - [ ] User input validated before processing
  - [ ] API parameters validated at entry point
  - [ ] Type checking enforced

- [ ] **Errors include context**
  - [ ] Operation name
  - [ ] User/entity IDs
  - [ ] Request parameters
  - [ ] Timestamp

- [ ] **Resources are cleaned up**
  - [ ] Database connections closed
  - [ ] File handles released
  - [ ] Timers cancelled
  - [ ] Event listeners removed

### Async Operations
- [ ] **Promises are handled**
  - [ ] All async functions use try/catch or .catch()
  - [ ] Unhandled rejections caught
  - [ ] Promise.allSettled used when appropriate

- [ ] **Timeouts implemented**
  - [ ] External API calls have timeouts
  - [ ] Database queries have timeouts
  - [ ] Timeout errors handled gracefully

- [ ] **Concurrent operations handle failures**
  - [ ] Independent operations don't block each other
  - [ ] Partial failures handled appropriately
  - [ ] Error aggregation used when needed

### API/Route Handlers
- [ ] **Error responses are consistent**
  - [ ] Standard error format used
  - [ ] Appropriate HTTP status codes
  - [ ] Error codes included
  - [ ] User-friendly messages

- [ ] **Sensitive data protected**
  - [ ] Stack traces not exposed in production
  - [ ] Credentials not logged
  - [ ] PII handled properly

### Frontend (React/Next.js)
- [ ] **Error boundaries implemented**
  - [ ] Top-level error boundary exists
  - [ ] Component-level boundaries where needed
  - [ ] Fallback UI provides value

- [ ] **Loading and error states handled**
  - [ ] Loading indicators shown
  - [ ] Error messages user-friendly
  - [ ] Retry buttons provided where appropriate

- [ ] **Form validation implemented**
  - [ ] Client-side validation
  - [ ] Server-side validation
  - [ ] Error messages shown per field

## Logging & Monitoring
- [ ] **Errors are logged appropriately**
  - [ ] Unexpected errors logged with full context
  - [ ] Expected errors don't spam logs
  - [ ] Log levels used correctly (error, warn, info)

- [ ] **Monitoring configured**
  - [ ] Error tracking service integrated (e.g., Sentry)
  - [ ] Alerts set up for critical errors
  - [ ] Error rates tracked

- [ ] **Structured logging used**
  - [ ] Consistent log format
  - [ ] Searchable fields (user_id, request_id)
  - [ ] Correlation IDs for distributed tracing

## Testing
- [ ] **Error paths tested**
  - [ ] Unit tests for error cases
  - [ ] Integration tests for error flows
  - [ ] Edge cases covered

- [ ] **Recovery mechanisms tested**
  - [ ] Retry logic tested
  - [ ] Circuit breaker tested
  - [ ] Fallback mechanisms tested

- [ ] **Error messages tested**
  - [ ] User-facing messages are clear
  - [ ] Developer messages include debug info
  - [ ] Messages don't leak sensitive data

## Documentation
- [ ] **Error codes documented**
  - [ ] All error codes listed
  - [ ] Meanings explained
  - [ ] Recovery steps provided

- [ ] **API errors documented**
  - [ ] Possible error responses listed
  - [ ] Error format specified
  - [ ] Examples provided

## Production Readiness
- [ ] **Error handling reviewed**
  - [ ] Code review completed
  - [ ] Security review done
  - [ ] Performance impact assessed

- [ ] **Runbook created**
  - [ ] Common errors documented
  - [ ] Resolution steps provided
  - [ ] Escalation path defined

- [ ] **Monitoring dashboards created**
  - [ ] Error rates visible
  - [ ] Error types tracked
  - [ ] Trends monitored

## Common Mistakes to Avoid
- [ ] **Not catching exceptions too broadly**
  - Avoid: `catch (Exception e)`
  - Good: `catch (ValidationError e)` then `catch (Error e)`

- [ ] **Not swallowing errors silently**
  - Avoid: Empty catch blocks
  - Good: Log and/or throw

- [ ] **Not logging and re-throwing**
  - Avoid: Log then throw (duplicate logs)
  - Good: Log at top level only

- [ ] **Not returning error codes**
  - Avoid: `function doThing(): number` (0 = error?)
  - Good: `function doThing(): Result<Data, Error>`

- [ ] **Not exposing internal errors**
  - Avoid: Showing stack traces to users
  - Good: User-friendly message, log details
