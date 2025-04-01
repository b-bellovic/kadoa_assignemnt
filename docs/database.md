# Database Architecture

The Kadoa Assignment application uses a PostgreSQL database with Drizzle ORM to manage data persistence. This document outlines the database architecture, schema design, and implementation details.

## Database Technology Stack

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit
- **Connection Management**: postgres.js

## Schema Design

The database schema is defined in `be/src/schema.ts` and consists of three main tables:

### Users Table

```typescript
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Task Columns Table

```typescript
export const taskColumns = pgTable("task_columns", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: uuid("created_by_id")
    .references(() => users.id)
    .notNull(),
});
```

### Tasks Table

```typescript
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  columnId: uuid("column_id")
    .references(() => taskColumns.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id),
  order: integer("order").default(0).notNull(),
});
```

## Entity Relationships

The schema implements the following relationships:

1. **One-to-Many**: Users to Columns (a user can create multiple columns)
2. **One-to-Many**: Columns to Tasks (a column contains multiple tasks)
3. **One-to-Many**: Users to Tasks (a user can be assigned to multiple tasks)

## Database Integration

The application uses a global `DatabaseModule` that provides database connection and services to the NestJS application. For integration details, see the [Architecture documentation](./architecture.md#backend-architecture).

### Type Safety

Drizzle ORM provides type inference for database entities:

```typescript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type TaskColumn = typeof taskColumns.$inferSelect;
export type NewTaskColumn = typeof taskColumns.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
```

## Migrations and Seeding

The application includes database migration and seeding capabilities:

- Migrations are managed using Drizzle Kit
- Migration scripts are stored in the `drizzle` directory
- Seed data is applied using the `seed.ts` script

For commands to run migrations and seeds, see [Local Development](./local-development.md).

## Connection Configuration

Database connection is configured using environment variables:

```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
```

## Database Visualization

The application includes Drizzle Studio for database visualization and management, accessible in development environments with `yarn studio` command. 
