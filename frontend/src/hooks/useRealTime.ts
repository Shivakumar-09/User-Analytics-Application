import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useRealTime() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);

    s.on('active_users', (count: number) => {
      setActiveUsers(count);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return { socket, activeUsers };
}
