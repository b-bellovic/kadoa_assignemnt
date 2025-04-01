# Local Development

This guide explains how to set up and run the application locally for development.

## Prerequisites

- Node.js 18+
- Yarn package manager
- PostgreSQL database

## Setup

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Key environment variables:
   ```
   # Database connection
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kadoa
   
   # API keys
   OPENAI_API_KEY=your-openai-api-key
   JWT_SECRET=your-jwt-secret
   ```

3. Run the development servers:
   ```bash
   # Run both frontend and backend
   yarn dev
   
   # Or run them separately
   yarn workspace be dev
   yarn workspace fe dev
   ```

4. Run database migrations:
   ```bash
   yarn migrate
   ```

5. Seed the database:
   ```bash
   yarn seed
   ```

6. Access the application:
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001
   - Drizzle Studio: http://localhost:3333 (run with `yarn studio`)

## Additional Commands

- Check dependency mismatches: `yarn syncpack:list`
- Fix dependency mismatches: `yarn syncpack:fix`

## Related Documentation

- [Architecture](./architecture.md) - Learn about the project structure
- [Database](./database.md) - Database schema and operations
- [Testing](./testing.md) - Running tests locally 