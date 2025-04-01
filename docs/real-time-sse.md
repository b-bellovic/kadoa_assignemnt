# Real-time Updates with Server-Sent Events (SSE)

The application implements real-time updates using Server-Sent Events (SSE), a core requirement in the project for enabling live collaboration on the Kanban board.

## Architecture

### Backend Implementation (NestJS)

- **SSEModule**: Centralized module for managing SSE connections
- **SSEService**: Core service that:
  - Manages client connections
  - Broadcasts events to connected clients
  - Handles client subscription to specific event types
- **SSEController**: Exposes a `/events/subscribe` endpoint that:
  - Establishes SSE connections
  - Authenticates clients via JWT token

### Frontend Implementation (Next.js)

- **EventBus**: Singleton pattern implementation that:
  - Manages the EventSource connection
  - Handles automatic reconnection with backoff
  - Provides pub/sub pattern for components
- **useSse Hook**: React hook for subscribing to SSE events:
  - Manages component lifecycle with useEffect
  - Handles connection/disconnection automatically
  - Provides type-safe event callbacks

## Event Flow

1. Client connects to SSE endpoint with authentication token
2. Connection is established with proper headers (Content-Type: text/event-stream)
3. Backend adds client to active connections registry
4. When data changes (e.g., task created/updated), an event is emitted
5. SSEService broadcasts the event to relevant subscribed clients
6. Frontend EventBus receives the event and notifies subscribed components
7. UI updates reactively based on the received event data

## Event Types

The system supports various event types for Kanban operations:

- `task.created`: New task added to the board
- `task.updated`: Task details modified
- `task.moved`: Task moved between columns
- `task.deleted`: Task removed from the board
- `task.reordered`: Task position changed within a column

## Scalability Considerations

While SSE provides an effective real-time solution, it has important scalability limitations:

- **Connection Limits**: Each SSE connection consumes server file descriptors, limiting the number of concurrent users
- **Connection Management**: Long-lived connections require careful management to prevent resource leaks
- **Stateful Nature**: Makes horizontal scaling more challenging as connection state must be shared

For larger-scale deployments, consider:

1. **Dedicated Event Service**: Separate the event broadcasting from the application server
2. **Message Queue Integration**: Use a message broker (RabbitMQ, Kafka) to decouple event production and consumption
3. **Redis Pub/Sub**: Implement a Redis-based solution for shared state across multiple server instances
4. **WebSocket Alternative**: For bidirectional communication needs, WebSockets with a specialized server (like Socket.io) may be more appropriate

## Advanced Collaboration with CRDTs

For more sophisticated real-time collaboration, consider implementing Conflict-free Replicated Data Types (CRDTs):

- **Y.js**: A CRDT implementation that could enhance the Kanban board with:
  - Offline editing capabilities
  - Automatic conflict resolution
  - Rich collaborative features (cursors, presence, etc.)
  - True peer-to-peer synchronization

CRDTs would allow multiple users to make simultaneous changes to the Kanban board without conflicts, even with network delays or disconnections, providing a more robust collaboration experience than the current event-based system.

## Implementation Benefits

- **Simplicity**: SSE uses standard HTTP, making it easier to implement than WebSockets
- **Native Browser Support**: Modern browsers support EventSource API without additional libraries
- **Automatic Reconnection**: Browsers handle reconnection attempts automatically
- **Firewall Friendly**: Uses standard HTTP ports and connections 
