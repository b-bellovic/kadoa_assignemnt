# Design & Scalability Considerations

## Data Model Structure

The data model consists of:
- **Users**: Authentication and user information
- **Columns**: Kanban board columns (e.g., To Do, In Progress, Done)
- **Tasks**: The individual tasks that can be moved between columns

## Real-time Collaboration

The system supports real-time collaboration through Server-Sent Events, which allow efficient push notifications from server to client. For scalability:

- Event handlers are implemented using a registry pattern
- The client implements reconnection logic with exponential backoff
- The backend efficiently publishes events when data changes

## WebSockets vs. REST Polling Trade-offs

- **Server-Sent Events (SSE)** was chosen over WebSockets for:
  - Simpler implementation (uses regular HTTP)
  - Native browser support
  - One-way communication which is sufficient for this application
  - Lower overhead compared to WebSockets

- **REST Polling** was avoided because:
  - Higher server load due to frequent requests
  - Higher latency for real-time updates
  - Increased bandwidth consumption 