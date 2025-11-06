# Unit Tests Documentation

This directory contains comprehensive unit tests for the authentication token system.

## Test Coverage

### 1. Token Utility Functions (`lib/utils/token.test.ts`)

#### `generateAuthToken`
- ✅ Returns a 16-character alphanumeric token
- ✅ Generates different tokens on multiple calls
- ✅ Only uses valid characters (A-Z, a-z, 0-9)

#### `generateUniqueAuthToken`
- ✅ Returns a token that does not exist in the database
- ✅ Retries if token already exists and returns unique token
- ✅ Returns extended token if max attempts reached
- ✅ Handles database errors gracefully

#### `isValidAuthTokenFormat`
- ✅ Returns true for valid 16-character alphanumeric tokens
- ✅ Returns false for tokens with invalid length
- ✅ Returns false for tokens with special characters
- ✅ Returns false for null or undefined values
- ✅ Returns false for non-string values

### 2. POST /api/auth/register (`app/api/auth/register/route.test.ts`)

#### Successful Registration
- ✅ Successfully registers a user, generates unique token, updates profile, and sends authorization email
- ✅ Uses default full_name if not provided

#### Validation
- ✅ Returns 400 if email is missing
- ✅ Returns 400 if password is missing

#### Error Handling
- ✅ Handles auth signup errors
- ✅ Returns 500 if user creation fails
- ✅ Retries profile update if profile doesn't exist initially
- ✅ Returns 500 if profile update fails after max attempts
- ✅ Continues registration even if email sending fails

### 3. GET /user/authorization/:auth_token (`app/user/authorization/route.test.ts`)

#### Token Validation
- ✅ Returns 400 for invalid token format
- ✅ Accepts valid token format

#### Invalid Token Handling
- ✅ Returns 404 HTML page for non-existent token
- ✅ Returns 404 HTML page for expired token

#### Already Authorized User Handling
- ✅ Redirects to /user if user is already authorized

#### Successful Authorization
- ✅ Authorizes user and redirects to /user?authorized=true
- ✅ Returns 500 if update fails

#### Database Operations
- ✅ Queries profiles table with correct fields

#### Error Handling
- ✅ Returns 500 for unexpected errors

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- __tests__/lib/utils/token.test.ts
```

## Test Statistics

- **Total Test Suites**: 7
- **Total Tests**: 62
- **All tests passing**: ✅

## Mock Strategy

The tests use Jest mocks for:
- Supabase client (`@/lib/supabase/server`)
- Admin client (`@/lib/supabase/admin`)
- Token generation (`@/lib/utils/token`)
- Email service (`@/lib/email/service`)
- Next.js Response object (`next/server`)

## Key Testing Patterns

1. **Database Mock Chains**: Properly mocks Supabase's method chaining (`.from().select().eq().single()`)
2. **Async Testing**: Uses `async/await` for all asynchronous operations
3. **Timer Mocking**: Uses Jest fake timers for tests involving `setTimeout`
4. **Error Simulation**: Tests both success and failure scenarios
5. **Isolation**: Each test is independent with proper setup and teardown

## Future Enhancements

- Add integration tests with a real test database
- Add E2E tests for the full registration and authorization flow
- Add performance tests for token generation uniqueness
- Add security tests for token validation edge cases
