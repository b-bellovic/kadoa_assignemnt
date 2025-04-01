# Authentication

> **Note:** Authentication was not a primary requirement in the original assignment but was implemented as a minimal solution to make the application more complete. The main focus of the project is on Kanban functionality, real-time updates, and AI task generation.

The application implements a basic JWT-based authentication system with the following components:

## Backend (NestJS)

- **JWT Strategy**: Uses Passport.js with JWT Strategy for token validation
- **Guards**: `JwtAuthGuard` protects routes requiring authentication
- **Auth Module**: Centralized authentication logic with login/register endpoints
- **JWT Service**: Handles token generation and verification

For implementation details, see the [Backend Architecture](./architecture.md#backend-architecture) documentation.

## Frontend (Next.js)

- **Auth Context**: React Context provides auth state across the application
- **Token Storage**: JWTs stored in cookies with secure configuration
- **Auth Service Hook**: React Query-based hook for authentication operations
- **API Client**: Automatically attaches JWT token to authenticated requests

## Authentication Flow

1. User submits credentials (email/password)
2. Backend validates credentials and issues a JWT
3. Frontend stores JWT in secure cookie
4. JWT is attached to subsequent API requests
5. Token refreshes periodically to maintain session

## Security Considerations

- Tokens expire after 7 days
- Secure and HttpOnly cookie settings in production
- Token verification on each protected API endpoint

## Future Enhancements

For a production-ready authentication system, consider implementing:
- Password hashing and salting
- Two-factor authentication
- Rate limiting for login attempts
- Session management
- Role-based access control 