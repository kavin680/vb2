import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setAllVariables, updateVariables } from '../../app/store/store';
import { io } from "socket.io-client";

export function useVariablesLive(wsUrl?: string) {
  const dispatch = useDispatch();

  const updateBuffer = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!wsUrl) return;

    // Initial fetch of variables
    import('../api/variableApi').then(({ fetchReadVariables }) => {
      fetchReadVariables().then(response => {
        if (response.success && response.data?.variables) {
          dispatch(setAllVariables(response.data.variables));
        }
      }).catch(err => console.error("Initial fetch failed:", err));
    });

    const token = localStorage.getItem('accessToken');

    let connectionUrl = wsUrl;
    if (connectionUrl.startsWith('ws://')) {
      connectionUrl = connectionUrl.replace('ws://', 'http://');
    } else if (connectionUrl.startsWith('wss://')) {
      connectionUrl = connectionUrl.replace('wss://', 'https://');
    }

    const variablesSocketUrl = connectionUrl.endsWith('/') ? `${connectionUrl}` : `${connectionUrl}/`;

    const socket = io(variablesSocketUrl, {
      auth: {
        token: token
      },
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    socket.on('connect', () => {
      // Re-fetch full state after reconnect to avoid stale data
      import('../api/variableApi').then(({ fetchReadVariables }) => {
        fetchReadVariables().then(response => {
          if (response.success && response.data?.variables) {
            dispatch(setAllVariables(response.data.variables));
          }
        }).catch(() => { /* reconnect fetch failed */ });
      });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO Connection Error:', err);
    });

    const FLUSH_INTERVAL_MS = 32;

    const flushBuffer = () => {
      const updates = updateBuffer.current;
      if (Object.keys(updates).length > 0) {
        dispatch(updateVariables(updates));
        updateBuffer.current = {};
      }
    };

    const intervalId = setInterval(flushBuffer, FLUSH_INTERVAL_MS);

    interface VariableItem { variableName?: string; value?: unknown }

    const handleData = (data: unknown) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (!parsed) return;

        let items: VariableItem[] = [];

        const record = parsed as Record<string, unknown>;
        if (record.data && Array.isArray(record.data)) {
          items = record.data as VariableItem[];
        } else if (Array.isArray(parsed)) {
          items = parsed as VariableItem[];
        } else {
          return;
        }

        items.forEach((item) => {
          if (item && typeof item.variableName === 'string' && item.value !== undefined) {
            updateBuffer.current[item.variableName] = Number(item.value);
          }
        });

      } catch (err) {
        console.error('Error processing socket data:', err);
      }
    };

    socket.on('message', handleData);
    socket.on('variables', handleData);
    socket.on('variable_update', handleData);
    socket.on('variableReadingUpdated', handleData);

    return () => {
      socket.disconnect();
      clearInterval(intervalId);
    };
  }, [dispatch, wsUrl]);
}
