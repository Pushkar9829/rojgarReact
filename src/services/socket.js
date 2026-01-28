import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.tatsatinfotech.com/api';
const WS_URL = API_URL.replace(/\/api\/?$/, '') || 'https://api.tatsatinfotech.com';

let socket = null;

export function connectSocket(token) {
  if (socket?.connected) return socket;
  if (!token) return null;
  socket = io(WS_URL, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
