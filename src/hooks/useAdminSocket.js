import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';

/**
 * Connect socket when user is authenticated; disconnect on logout/unmount.
 * Call from Layout when user exists. Token read from localStorage.
 */
export function useSocketConnection(user) {
  useEffect(() => {
    if (!user) {
      console.log('[useAdminSocket] No user, disconnecting socket');
      disconnectSocket();
      return;
    }
    const token = localStorage.getItem('token');
    if (token) {
      console.log('[useAdminSocket] Connecting socket for admin');
      connectSocket(token);
    } else {
      console.warn('[useAdminSocket] No token, skipping socket connect');
    }
    return () => {
      console.log('[useAdminSocket] Cleanup: disconnecting socket');
      disconnectSocket();
    };
  }, [user]);
}

/**
 * Subscribe to job/scheme realtime events: toast + optional refetch callbacks.
 * Use in Jobs, Schemes, Dashboard. Socket must already be connected (Layout).
 */
export function useAdminRealtime({ onJobEvent, onSchemeEvent } = {}) {
  const onJob = useRef(onJobEvent);
  const onScheme = useRef(onSchemeEvent);
  onJob.current = onJobEvent;
  onScheme.current = onSchemeEvent;

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const h = (ev, msg, toastMsg) => {
      console.log('[useAdminRealtime] Event:', ev, msg);
      toast.success(toastMsg);
      if (ev.startsWith('job')) onJob.current?.();
      else if (ev.startsWith('scheme')) onScheme.current?.();
    };

    s.on('job:created', (p) => h('job:created', p, 'New job created'));
    s.on('job:updated', (p) => h('job:updated', p, 'Job updated'));
    s.on('job:deleted', (p) => h('job:deleted', p, 'Job deleted'));
    s.on('scheme:created', (p) => h('scheme:created', p, 'New scheme created'));
    s.on('scheme:updated', (p) => h('scheme:updated', p, 'Scheme updated'));
    s.on('scheme:deleted', (p) => h('scheme:deleted', p, 'Scheme deleted'));

    return () => {
      s.off('job:created');
      s.off('job:updated');
      s.off('job:deleted');
      s.off('scheme:created');
      s.off('scheme:updated');
      s.off('scheme:deleted');
    };
  }, []);
}
