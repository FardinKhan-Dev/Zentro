import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('✓ Socket connected');

      // Join user room immediately if user is logged in
      if (user?.id) {
        socketInstance.emit('join:user', user.id);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('✗ Socket disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []); // Run once on mount

  // Watch for user changes to join room if login happens after connection
  useEffect(() => {
    if (socket && isConnected && user?.id) {
      socket.emit('join:user', user.id);
    }
  }, [socket, isConnected, user]);

  return { socket, isConnected };
};

export default useSocket;
