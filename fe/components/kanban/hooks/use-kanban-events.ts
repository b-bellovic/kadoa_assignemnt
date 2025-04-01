import {useQueryClient} from "@tanstack/react-query";
import {getAuthToken} from "@/lib/auth-token";
import {API_URL} from "@/lib/config";
import {useSSE} from "@/hooks/useSse";

/**
 * Custom hook for subscribing to Kanban board real-time events
 *
 * This hook uses the generic useSSE hook to handle SSE connections
 * specifically for Kanban board events (tasks and columns).
 *
 * @returns Connection status and control methods
 */
export function useKanbanEvents() {
  const queryClient = useQueryClient();
  const token = getAuthToken();
  const sseUrl = token
    ? `${API_URL}/events/subscribe?token=${encodeURIComponent(token)}`
    : '';

  const logger = {
    debug: (message: string, ...args: any[]) => console.debug(`[Kanban] ${message}`, ...args),
    error: (message: string, ...args: any[]) => console.error(`[Kanban] ${message}`, ...args)
  }

  const eventHandler =  (eventData: any) => {
      try {
        if (!eventData) return;

        const eventType = eventData.type;
        const data = eventData.data;
        logger.debug(`SSE event received: ${eventType}`, data);

        if (!eventType) return;
        return queryClient.invalidateQueries({queryKey: ['board']});
      } catch (error) {
        logger.error('Error processing SSE event:', error);
      }
    }


  const sseResult = useSSE(
    {
      url: sseUrl,
      maxReconnectAttempts: 5,
      initialReconnectDelay: 1000,
      autoReconnect: true,
      autoConnect: !!token,
      logger
    },
    eventHandler
  );

  return {
    ...sseResult,
    isAuthenticated: !!token
  };
}
