import { io, Socket } from 'socket.io-client';

// Backend URL — override via NEXT_PUBLIC_SERVER_URL in .env.local for production
const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

/**
 * Singleton socket instance.
 * autoConnect: false — we manually call socket.connect() inside the React
 * component via useEffect so that it only runs on the client (SSR-safe).
 */
export const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket'], // Skip HTTP long-polling, go straight to WS
  autoConnect: false,        // We control when to connect (client-side only)
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});