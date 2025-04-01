# Kadoa - Senior Software Engineer Assignment

### Requirements

#### Backend (TypeScript)
- Implement a live server that supports CRUD operations for Kanban tasks.
- Choose a real-time mechanism (WebSockets, Server-Sent Events, gRPC, Polling, etc.).
- Design a suitable database schema for storing tasks (e.g., PostgreSQL, MongoDB, or SQLite).
- Ensure proper validation and error handling.

#### Frontend (Next.js + TypeScript)
- Create a simple UI that allows adding, updating, deleting, and moving Kanban tasks.
- Ensure the UI updates in real-time when tasks are modified.

#### AI/LLM Integration
- Use an LLM to create new tasks from natural language input.

### Deliverables
- A TypeScript implementation of the Kanban app (frontend and backend), with relevant testing.
- Clear instructions in a `README.md` file to reproduce the project locally, plus a brief technical explanation of design choices and scalability concerns.

#### Design & Scalability Considerations

Add answers to `README.md` > Design & Scalability Considerations

- How would you structure the data model for tasks, columns, and users?
- How would you scale this system to support multiple users collaborating in real time?
- What trade-offs would you consider when choosing between WebSockets and REST polling?

## Evaluation Criteria

### Functionality
- The service meets all functional requirements for task management, real-time updates, and AI-powered task creation.
- Ensures seamless data processing and retrieval.

### Code Quality
- Code is clean, well-organized, and adheres to best practices.
- Follows a consistent coding style and structure.
- Proper use of modularization and reusability.

### Error Handling
- Effective handling of errors with appropriate recovery mechanisms.
- Provides informative logging for debugging and monitoring.
- Graceful degradation in case of failures.

### Documentation
- The README is clear, concise, and comprehensive.
- Includes setup instructions, usage guidelines, and API references.
- Provides examples and troubleshooting steps.

### Creativity
- Implementation of innovative features that showcase creativity and technical skills.
- Unique approaches to solving the problem.
- Additional enhancements beyond the baseline requirements. Surprise us! :)

## 💡 Bonus
- Project containerized.
- Implement authentication (JWT or OAuth).
- Use a state management library (Zustand, Redux) on the frontend.
- Deploy the solution to a cloud provider (Vercel, AWS, Cloudflare, etc.).
- Drag-and-drop task updates (changing a task status).
- Additional creative enhancements.