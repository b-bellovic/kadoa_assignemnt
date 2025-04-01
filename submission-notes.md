# Kadoa - Senior Software Engineer Assignment Submission

## Introduction

I'm pleased to submit my implementation of the Kanban application assignment. This project presented an exciting opportunity to demonstrate my software engineering capabilities while exploring some technologies I've been interested in for some time.

## Technical Overview

### Backend Implementation
For the backend, I leveraged **Nest.js** - a framework I'm experienced with that enabled rapid development of a robust API. My approach incorporated:

- A **hybrid architecture** combining Command Query patterns (for advanced capabilities) with service patterns for basic CRUD functionality
- **DrizzleORM** for database operations - a deliberate choice to expand my toolkit beyond my usual MikroORM
- **Custom JWT authentication** implementation to secure the application
- **Server-Sent Events (SSE)** for real-time updates, a technology I was eager to explore

### Frontend Implementation
The frontend was built with **Next.js and TypeScript** as specified, featuring:

- **React Query** for API integration - my first substantive implementation after primarily working with GraphQL APIs
- Real-time updates via SSE connection to the backend
- Drag-and-drop functionality for task management

### AI/LLM Integration
I implemented LLM integration for natural language task creation, focusing primarily on demonstrating the integration pattern rather than extensive functionality due to time constraints.

## Reflections

While I'm satisfied with the overall backend architecture and functionality, I recognize several areas for improvement:

- The DrizzleORM implementation lacks transaction support and sufficient abstraction around CRUD operations
- The frontend code organization could benefit from better separation of concerns
- The SSE handling, while functional, could be more elegantly implemented on both ends

Time constraints influenced some implementation decisions, particularly in the frontend, where I relied more heavily on code generation tools than I typically would for production code.

I look forward to discussing my implementation choices and the trade-offs involved in more detail.