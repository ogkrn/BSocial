import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initSocket = () => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
  });

  return socket;
};

export const connectSocket = () => {
  if (!socket) {
    socket = initSocket();
  }

  if (!socket.connected) {
    socket.connect();

    // Join user's personal room
    const userId = useAuthStore.getState().user?.id;
    if (userId) {
      socket.emit('join', userId);
    }
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const getSocket = () => socket;

// Socket event helpers
export const joinConversation = (conversationId: string) => {
  socket?.emit('join-conversation', conversationId);
};

export const leaveConversation = (conversationId: string) => {
  socket?.emit('leave-conversation', conversationId);
};

export const sendTypingIndicator = (conversationId: string, username: string) => {
  const userId = useAuthStore.getState().user?.id;
  socket?.emit('typing', { conversationId, userId, username });
};

export const stopTypingIndicator = (conversationId: string) => {
  const userId = useAuthStore.getState().user?.id;
  socket?.emit('stop-typing', { conversationId, userId });
};
