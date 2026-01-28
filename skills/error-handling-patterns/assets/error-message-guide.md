# Error Message Guide

Good error messages help users recover quickly and developers debug efficiently. This guide shows you how to write excellent error messages.

## Principles

### 1. Be Specific
**Bad:** "An error occurred"
**Good:** "Failed to upload file: File size exceeds 10MB limit"

### 2. Explain What Happened
**Bad:** "Invalid input"
**Good:** "Email address is required"

### 3. Suggest How to Fix It
**Bad:** "Authentication failed"
**Good:** "Authentication failed. Please check your credentials and try again"

### 4. Use Plain Language
**Bad:** "ECONNREFUSED error on port 3000"
**Good:** "Cannot connect to the server. Please check your internet connection"

### 5. Don't Blame the User
**Bad:** "You entered an invalid email"
**Good:** "Email address must include @"

## Message Templates

### Validation Errors
```typescript
// Pattern: "[Field] must [requirement]"
"Email must be a valid email address"
"Password must be at least 8 characters"
"Phone number must contain only digits"

// Pattern: "[Field] is [state]"
"Email is required"
"Username is already taken"
```

### Not Found Errors
```typescript
// Pattern: "[Resource] not found"
"User not found"
"Document not found with ID: abc123"

// With suggestion:
"Page not found. Return to homepage or use the search"
```

### Permission Errors
```typescript
// Pattern: "You don't have permission to [action]"
"You don't have permission to delete this post"
"This action requires admin privileges"

// With suggestion:
"You don't have permission to access this file. Contact the owner to request access"
```

### External Service Errors
```typescript
// Pattern: "Failed to [action] [resource]. [Reason]"
"Failed to send email. Email service is temporarily unavailable"
"Failed to process payment. Please try again or contact support"

// With recovery:
"Failed to load comments. Retrying in 3 seconds..."
```

### Rate Limit Errors
```typescript
// Pattern: "Too many [actions]. [Wait time]"
"Too many login attempts. Please try again in 15 minutes"
"API rate limit exceeded. Resets at 3:00 PM"
```

## Context-Specific Messages

### For End Users
- Use simple language
- Focus on what they can do
- Hide technical details
- Provide next steps

```typescript
class UserFacingError extends ApplicationError {
  getUserMessage(): string {
    switch (this.code) {
      case "VALIDATION_ERROR":
        return "Please check your input and try again";
      case "NOT_FOUND":
        return "We couldn't find what you're looking for";
      case "UNAUTHORIZED":
        return "Please log in to continue";
      case "EXTERNAL_SERVICE_ERROR":
        return "Service temporarily unavailable. We're working on it!";
      default:
        return "Something went wrong. Please try again later";
    }
  }
}
```

### For Developers
- Include technical details
- Show stack traces
- Provide debugging context
- Reference documentation

```typescript
class DeveloperError extends ApplicationError {
  getDeveloperMessage(): string {
    return JSON.stringify({
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    }, null, 2);
  }
}
```

## Error Message Structure

### Complete Error Response
```typescript
interface ErrorResponse {
  // User-facing message
  message: string;
  
  // Machine-readable code
  code: string;
  
  // Additional context (for developers)
  details?: {
    field?: string;
    value?: any;
    constraint?: string;
  };
  
  // Suggested actions
  actions?: Array<{
    label: string;
    action: string; // "retry", "contact_support", "go_back"
  }>;
  
  // Documentation link
  documentation?: string;
}
```

### Example Implementation
```typescript
function formatValidationError(
  field: string,
  value: any,
  constraint: string
): ErrorResponse {
  return {
    message: `${field} ${formatConstraint(constraint)}`,
    code: "VALIDATION_ERROR",
    details: { field, value, constraint },
    actions: [
      { label: "Try again", action: "retry" }
    ],
    documentation: `https://docs.example.com/validation#${field}`
  };
}

function formatConstraint(constraint: string): string {
  const constraints: Record<string, string> = {
    "required": "is required",
    "email": "must be a valid email address",
    "min:8": "must be at least 8 characters",
    "max:100": "must be at most 100 characters",
    "unique": "is already taken"
  };
  
  return constraints[constraint] || constraint;
}
```

## Localization Considerations

```typescript
interface ErrorMessageCatalog {
  [key: string]: {
    en: string;
    es: string;
    // Add more languages
  };
}

const messages: ErrorMessageCatalog = {
  "VALIDATION_EMAIL_REQUIRED": {
    en: "Email is required",
    es: "El correo electrónico es obligatorio"
  },
  "NOT_FOUND_USER": {
    en: "User not found",
    es: "Usuario no encontrado"
  }
};

function getLocalizedMessage(
  code: string,
  locale: string = "en"
): string {
  return messages[code]?.[locale] || messages[code]?.en || code;
}
```

## Progressive Disclosure

Show simple messages by default, with option to see details:

```tsx
function ErrorDisplay({ error }: { error: ApplicationError }) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="error">
      <p className="error-message">{error.message}</p>
      
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? "Hide" : "Show"} details
      </button>
      
      {showDetails && (
        <details className="error-details">
          <pre>{JSON.stringify(error.details, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
```

## Error Message Examples

### Good Examples
✅ "Password must be at least 8 characters and include a number"
✅ "File upload failed: Maximum file size is 5MB"
✅ "Cannot delete this item because it's currently in use"
✅ "Your session has expired. Please log in again"
✅ "Payment failed. Please check your card details and try again"

### Bad Examples
❌ "Error 500"
❌ "Invalid input"
❌ "Something went wrong"
❌ "Exception in thread 'main'"
❌ "Null pointer exception"

## Accessibility

- Use ARIA live regions for dynamic errors
- Ensure error messages are associated with form fields
- Use sufficient color contrast
- Don't rely on color alone

```tsx
<div role="alert" aria-live="polite">
  <label htmlFor="email">
    Email
    {error && <span className="error" id="email-error">{error}</span>}
  </label>
  <input
    id="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
</div>
```

## Testing Error Messages

```typescript
describe("Error Messages", () => {
  it("should be user-friendly", () => {
    const error = new ValidationError("Email is required", "email");
    expect(error.message).not.toMatch(/null|undefined|exception/i);
    expect(error.message).toMatch(/email/i);
  });
  
  it("should include field name", () => {
    const error = new ValidationError("Invalid value", "username");
    expect(error.details?.field).toBe("username");
  });
  
  it("should suggest recovery", () => {
    const error = new ValidationError("Password too short");
    expect(error.message).toMatch(/at least/i);
  });
});
```
