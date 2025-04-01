# Architecture

## Monorepo Structure

This project uses a monorepo architecture to manage both the frontend and backend code in a single repository:

- **`/fe`**: Next.js frontend application
- **`/be`**: NestJS backend application
- **Root**: Shared configuration and workspace setup

The monorepo is managed using Yarn Workspaces, allowing for:
- Shared dependencies
- Simplified build process
- Consistent development environment
- Easier code sharing between packages

### Dependency Management with Syncpack

The monorepo uses Syncpack to maintain consistent dependency versions across all packages:

```json
// .syncpackrc configuration
{
  "dependencyTypes": ["prod", "dev", "peer"],
  "source": ["package.json", "fe/package.json", "be/package.json"],
  "semverGroups": [
    {
      "label": "use exact version numbers in production",
      "packages": ["**"],
      "dependencyTypes": ["prod"],
      "dependencies": ["**"],
      "range": ""
    },
    {
      "label": "use caret ranges for dev dependencies",
      "packages": ["**"],
      "dependencyTypes": ["dev"],
      "dependencies": ["**"],
      "range": "^"
    }
  ]
}
```

Syncpack is essential in monorepos to:
- Prevent version conflicts between packages
- Ensure consistent dependency versions across workspaces
- Standardize version range formats (exact versions for production, caret ranges for dev)
- Reduce bundle sizes by avoiding duplicate dependency versions

## Frontend Architecture

The frontend is built with Next.js and uses React Query for state management. The code is organized with a component-based architecture for better maintainability.

## Backend Architecture

The backend is built with NestJS and implements a modular structure:

- **Core Modules**:
  - **DatabaseModule**: Global module providing database connections using Drizzle ORM
  - **SSEModule**: Handles Server-Sent Events for real-time updates
  - **AuthModule**: Manages JWT authentication
  - **UserModule**: User management functionality
  - **TaskModule**: Core Kanban board functionality

- **Design Patterns**:
  - **CQRS**: Command Query Responsibility Segregation for task operations
  - **Repository Pattern**: Abstracted through Drizzle ORM
  - **Dependency Injection**: NestJS built-in DI container

- **Database Integration**:
  ```typescript
  @Global()
  @Module({
    imports: [ConfigModule],
    providers: [
      {
        provide: "SQL",
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
          return postgres(configService.getOrThrow<string>("DATABASE_URL"));
        },
      },
      {
        provide: "DB",
        inject: ["SQL"],
        useFactory: async (sql: postgres.Sql) => {
          return drizzle(sql);
        },
      },
      DatabaseService,
    ],
    exports: ["DB", "SQL", DatabaseService],
  })
  export class DatabaseModule {}
  ```

For detailed information about specific components:
- [Database Architecture](./database.md)
- [Real-time Updates with SSE](./real-time-sse.md)
- [Authentication](./authentication.md)
- [LLM Integration](./llm-integration.md) 