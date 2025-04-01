# Kadoa - Kanban Board Application

A real-time Kanban board application with AI task generation.

## Core Features

- Drag-and-drop Kanban board interface
- Real-time updates using Server-Sent Events
- AI-powered task creation
- Optimistic UI updates

## Bonus Features

- JWT authentication
- Database visualization with Drizzle Studio

## Quick Start

```bash
# Install dependencies
yarn install

# Initialise database
yarn db:init

# Configure environment
cp .env.example .env

# Run development servers
yarn dev
```

## Documentation

For detailed documentation, please check the `/docs` directory:

- [Architecture](./docs/architecture.md)
- [Local Development](./docs/local-development.md)
- [Design & Scalability Considerations](./docs/design-scalability.md)
- [Authentication](./docs/authentication.md) 